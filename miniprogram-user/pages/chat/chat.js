const app = getApp()
const { extractList, firstValid, normalizeImageUrl, safeText } = require('../../utils/normalizers')
const { fetchPeerProfile } = require('../../utils/message-center')

function formatMessageTime(value) {
  const date = value instanceof Date ? value : new Date(value)
  if (Number.isNaN(date.getTime())) {
    return ''
  }

  const pad = number => String(number).padStart(2, '0')
  return `${pad(date.getHours())}:${pad(date.getMinutes())}`
}

function getCurrentUserProfile() {
  const userInfo = wx.getStorageSync('userInfo') || app.globalData.userInfo || {}
  const userId = firstValid(userInfo.userId, userInfo.id)

  return {
    userId,
    userName: safeText(firstValid(userInfo.userName, userInfo.name), '我'),
    userAvatar: normalizeImageUrl(firstValid(userInfo.userPicture, userInfo.avatar), app.globalData.baseUrl, '/images/avatar.png')
  }
}

function decodeQueryValue(value) {
  if (!value) {
    return ''
  }

  try {
    return decodeURIComponent(value)
  } catch (error) {
    return value
  }
}

function normalizeMessage(message, currentUserId) {
  const senderId = firstValid(message.senderId, 0)
  const createTime = firstValid(message.createTime, message.sendTime, new Date().toISOString())
  const isOwn = String(senderId) === String(currentUserId)

  return {
    ...message,
    id: firstValid(message.id, `local-${Date.now()}`),
    senderId,
    receiverId: firstValid(message.receiverId, 0),
    isRead: Number(firstValid(message.isRead, 0)),
    content: safeText(message.content, ''),
    createTime,
    timeText: formatMessageTime(createTime),
    isOwn,
    isPending: Boolean(message.isPending),
    isFailed: Boolean(message.isFailed)
  }
}

Page({
  data: {
    currentUserId: '',
    currentUserName: '',
    currentUserAvatar: '/images/avatar.png',
    peerUserId: '',
    peerUserName: '',
    peerUserAvatar: '/images/avatar.png',
    messages: [],
    inputValue: '',
    loading: true,
    scrollIntoView: ''
  },

  onLoad(options) {
    const profile = getCurrentUserProfile()
    const peerUserId = safeText(options.userId, '')
    const peerUserName = safeText(decodeQueryValue(options.userName), '沟通对象')
    const peerUserAvatar = decodeQueryValue(options.userAvatar)

    if (!profile.userId) {
      wx.showToast({
        title: '请先登录',
        icon: 'none'
      })
      wx.navigateTo({
        url: '/pages/login/login'
      })
      return
    }

    if (!peerUserId) {
      wx.showToast({
        title: '沟通对象不存在',
        icon: 'none'
      })
      setTimeout(() => {
        wx.navigateBack()
      }, 300)
      return
    }

    this.setData({
      currentUserId: profile.userId,
      currentUserName: profile.userName,
      currentUserAvatar: profile.userAvatar,
      peerUserId,
      peerUserName,
      peerUserAvatar: normalizeImageUrl(peerUserAvatar, app.globalData.baseUrl, '/images/avatar.png')
    })

    this.syncPeerProfile()
    this.loadMessages()
  },

  onShow() {
    this.startPolling()
  },

  onHide() {
    this.stopPolling()
  },

  onUnload() {
    this.stopPolling()
  },

  startPolling() {
    this.stopPolling()

    if (!this.data.currentUserId || !this.data.peerUserId) {
      return
    }

    this.pollTimer = setInterval(() => {
      this.loadMessages(true)
    }, 6000)
  },

  stopPolling() {
    if (this.pollTimer) {
      clearInterval(this.pollTimer)
      this.pollTimer = null
    }
  },

  async syncPeerProfile() {
    if (!this.data.peerUserId) {
      return
    }

    const profile = await fetchPeerProfile(app, this.data.peerUserId)
    if (!profile) {
      return
    }

    this.setData({
      peerUserName: safeText(profile.userName, this.data.peerUserName),
      peerUserAvatar: normalizeImageUrl(profile.userAvatar, app.globalData.baseUrl, this.data.peerUserAvatar || '/images/avatar.png')
    })
  },

  fetchMessages(params) {
    return new Promise(resolve => {
      app.request({
        url: 'message',
        method: 'GET',
        data: params,
        hideLoading: true,
        success: res => {
          if (res.statusCode === 200 && res.data && res.data.code === 200) {
            resolve(extractList(res.data))
            return
          }

          resolve([])
        },
        fail: () => resolve([])
      })
    })
  },

  async loadMessages(silent = false) {
    if (!this.data.currentUserId || !this.data.peerUserId) {
      return
    }

    if (!silent) {
      this.setData({ loading: true })
    }

    const [sentMessages, receivedMessages] = await Promise.all([
      this.fetchMessages({
        senderId: this.data.currentUserId,
        receiverId: this.data.peerUserId,
        type: 4
      }),
      this.fetchMessages({
        senderId: this.data.peerUserId,
        receiverId: this.data.currentUserId,
        type: 4
      })
    ])

    const messages = [...sentMessages, ...receivedMessages]
      .sort((left, right) => {
        const leftTime = new Date(left.createTime || 0).getTime()
        const rightTime = new Date(right.createTime || 0).getTime()
        if (leftTime !== rightTime) {
          return leftTime - rightTime
        }
        return Number(firstValid(left.id, 0)) - Number(firstValid(right.id, 0))
      })
      .map(item => normalizeMessage(item, this.data.currentUserId))

    this.setData({
      messages,
      loading: false
    })

    this.scrollToBottom(messages)
    this.markMessagesAsRead(messages)
  },

  markMessagesAsRead(messages) {
    const unreadMessages = messages.filter(item => !item.isOwn && item.isRead !== 1 && item.id)
    unreadMessages.forEach(item => {
      app.request({
        url: 'message',
        method: 'PUT',
        hideLoading: true,
        data: {
          id: item.id,
          isRead: 1
        }
      })
    })
  },

  scrollToBottom(messages = this.data.messages) {
    if (!messages.length) {
      return
    }

    const lastMessage = messages[messages.length - 1]
    this.setData({
      scrollIntoView: `message-${lastMessage.id}`
    })
  },

  sendMessage() {
    const content = safeText(this.data.inputValue, '')
    if (!content) {
      return
    }

    const localId = `local-${Date.now()}`
    const localMessage = normalizeMessage({
      id: localId,
      senderId: this.data.currentUserId,
      receiverId: this.data.peerUserId,
      content,
      createTime: new Date().toISOString(),
      isRead: 1,
      isPending: true
    }, this.data.currentUserId)

    const messages = [...this.data.messages, localMessage]
    this.setData({
      messages,
      inputValue: ''
    })
    this.scrollToBottom(messages)

    app.request({
      url: 'message',
      method: 'POST',
      hideLoading: true,
      data: {
        senderId: Number(this.data.currentUserId),
        receiverId: Number(this.data.peerUserId),
        type: 4,
        content,
        isRead: 0
      },
      success: res => {
        if (res.statusCode === 200 && res.data && res.data.code === 200) {
          this.loadMessages(true)
          return
        }

        this.markLocalMessageFailed(localId)
        wx.showToast({
          title: '发送失败',
          icon: 'none'
        })
      },
      fail: () => {
        this.markLocalMessageFailed(localId)
        wx.showToast({
          title: '发送失败，请重试',
          icon: 'none'
        })
      }
    })
  },

  markLocalMessageFailed(localId) {
    const messages = this.data.messages.map(item => {
      if (String(item.id) !== String(localId)) {
        return item
      }

      return {
        ...item,
        isPending: false,
        isFailed: true
      }
    })

    this.setData({ messages })
  },

  onInput(e) {
    this.setData({
      inputValue: e.detail.value
    })
  },

  goBack() {
    wx.navigateBack()
  }
})
