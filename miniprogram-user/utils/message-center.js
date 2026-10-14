const {
  extractList,
  firstValid,
  normalizeImageUrl,
  safeText
} = require('./normalizers')

const CHAT_MESSAGE_TYPE = 4
const DEFAULT_AVATAR = '/images/avatar.png'
const profileCache = {}

function getCurrentUserProfile(app) {
  const storedUserInfo = wx.getStorageSync('userInfo') || app.globalData.userInfo || {}
  const token = wx.getStorageSync('token') || app.globalData.token || ''
  const roleId = Number(firstValid(storedUserInfo.roleId, wx.getStorageSync('roleId'), app.globalData.roleId, 3))
  const userId = firstValid(storedUserInfo.userId, storedUserInfo.id)

  return {
    token,
    roleId,
    userId,
    userName: safeText(firstValid(storedUserInfo.userName, storedUserInfo.name), ''),
    userAvatar: normalizeImageUrl(firstValid(storedUserInfo.userPicture, storedUserInfo.avatar), app.globalData.baseUrl, DEFAULT_AVATAR)
  }
}

function requestData(app, options) {
  return new Promise(resolve => {
    app.request({
      ...options,
      hideLoading: true,
      success: res => {
        if (res.statusCode === 200 && res.data && res.data.code === 200) {
          resolve(res.data.data)
          return
        }

        resolve(null)
      },
      fail: () => resolve(null)
    })
  })
}

function requestList(app, options) {
  return requestData(app, options).then(data => extractList({ data }))
}

function formatListTime(value) {
  if (!value) {
    return ''
  }

  const date = value instanceof Date ? value : new Date(value)
  if (Number.isNaN(date.getTime())) {
    return ''
  }

  const now = new Date()
  const isSameYear = date.getFullYear() === now.getFullYear()
  const isSameMonth = date.getMonth() === now.getMonth()
  const isSameDate = date.getDate() === now.getDate()
  const pad = number => String(number).padStart(2, '0')

  if (isSameYear && isSameMonth && isSameDate) {
    return `${pad(date.getHours())}:${pad(date.getMinutes())}`
  }

  const yesterday = new Date(now)
  yesterday.setDate(now.getDate() - 1)
  if (
    date.getFullYear() === yesterday.getFullYear() &&
    date.getMonth() === yesterday.getMonth() &&
    date.getDate() === yesterday.getDate()
  ) {
    return '昨天'
  }

  if (isSameYear) {
    return `${pad(date.getMonth() + 1)}-${pad(date.getDate())}`
  }

  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`
}

function sortByLatestTime(items) {
  return items.sort((left, right) => {
    const leftTime = new Date(firstValid(left.latestTime, left.createTime, 0)).getTime()
    const rightTime = new Date(firstValid(right.latestTime, right.createTime, 0)).getTime()

    if (leftTime !== rightTime) {
      return rightTime - leftTime
    }

    return Number(firstValid(right.id, 0)) - Number(firstValid(left.id, 0))
  })
}

async function fetchPeerProfile(app, userId) {
  const cacheKey = String(userId)
  if (profileCache[cacheKey]) {
    return profileCache[cacheKey]
  }

  const userData = await requestData(app, {
    url: `sysUser/${userId}`,
    method: 'GET'
  })

  const baseProfile = {
    userId,
    roleId: Number(firstValid(userData && userData.roleId, 3)),
    companyId: firstValid(userData && userData.companyId, userData && userData.company && userData.company.id),
    userName: safeText(firstValid(userData && userData.userName, userData && userData.name), `用户${userId}`),
    userAvatar: normalizeImageUrl(firstValid(userData && userData.userPicture, userData && userData.avatar), app.globalData.baseUrl, DEFAULT_AVATAR)
  }

  if (baseProfile.roleId === 2 && baseProfile.companyId) {
    const enterpriseData = await requestData(app, {
      url: `enterprise/${baseProfile.companyId}`,
      method: 'GET'
    })

    if (enterpriseData) {
      baseProfile.userName = safeText(firstValid(enterpriseData.name, baseProfile.userName), baseProfile.userName)
      baseProfile.userAvatar = normalizeImageUrl(firstValid(enterpriseData.logo, baseProfile.userAvatar), app.globalData.baseUrl, baseProfile.userAvatar)
    }
  }

  profileCache[cacheKey] = baseProfile
  return baseProfile
}

async function fetchChatMessages(app, currentUserId) {
  const [sentMessages, receivedMessages] = await Promise.all([
    requestList(app, {
      url: 'message',
      method: 'GET',
      data: {
        senderId: Number(currentUserId),
        type: CHAT_MESSAGE_TYPE
      }
    }),
    requestList(app, {
      url: 'message',
      method: 'GET',
      data: {
        receiverId: Number(currentUserId),
        type: CHAT_MESSAGE_TYPE
      }
    })
  ])

  return [...sentMessages, ...receivedMessages]
}

async function fetchConversationList(app, currentUserId) {
  const messages = await fetchChatMessages(app, currentUserId)
  const conversationMap = {}

  messages.forEach(item => {
    const senderId = firstValid(item.senderId, 0)
    const receiverId = firstValid(item.receiverId, 0)
    const peerId = String(senderId) === String(currentUserId) ? receiverId : senderId

    if (!peerId) {
      return
    }

    const conversationKey = String(peerId)
    const currentTime = new Date(firstValid(item.createTime, 0)).getTime()
    const existingConversation = conversationMap[conversationKey]

    if (!existingConversation) {
      conversationMap[conversationKey] = {
        id: conversationKey,
        userId: peerId,
        lastMessage: safeText(item.content, '暂无消息'),
        latestTime: item.createTime,
        unreadCount: String(receiverId) === String(currentUserId) && Number(item.isRead) !== 1 ? 1 : 0
      }
      return
    }

    if (String(receiverId) === String(currentUserId) && Number(item.isRead) !== 1) {
      existingConversation.unreadCount += 1
    }

    const latestTime = new Date(firstValid(existingConversation.latestTime, 0)).getTime()
    if (currentTime >= latestTime) {
      existingConversation.lastMessage = safeText(item.content, existingConversation.lastMessage)
      existingConversation.latestTime = item.createTime
    }
  })

  const conversations = Object.values(conversationMap)
  const profiles = await Promise.all(conversations.map(item => fetchPeerProfile(app, item.userId)))
  const profileMap = {}
  profiles.forEach(item => {
    profileMap[String(item.userId)] = item
  })

  return sortByLatestTime(conversations).map(item => {
    const profile = profileMap[String(item.userId)] || {}
    return {
      ...item,
      userName: safeText(profile.userName, `用户${item.userId}`),
      avatar: normalizeImageUrl(profile.userAvatar, app.globalData.baseUrl, DEFAULT_AVATAR),
      timeText: formatListTime(item.latestTime)
    }
  })
}

function buildChatUrl(conversation) {
  const userName = encodeURIComponent(safeText(conversation.userName, '沟通对象'))
  const userAvatar = encodeURIComponent(safeText(conversation.avatar, ''))
  return `/pages/chat/chat?userId=${conversation.userId}&userName=${userName}&userAvatar=${userAvatar}`
}

module.exports = {
  DEFAULT_AVATAR,
  buildChatUrl,
  fetchConversationList,
  fetchPeerProfile,
  formatListTime,
  getCurrentUserProfile
}
