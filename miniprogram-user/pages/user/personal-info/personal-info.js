const app = getApp()
const { firstValid, normalizeImageUrl, safeText } = require('../../../utils/normalizers')
const {
  USERNAME_MAX_LENGTH,
  USERNAME_PLACEHOLDER,
  USERNAME_RULE_HINT,
  sanitizeUserNameInput,
  validateUserName
} = require('../../../utils/credential-rules')

function buildAvatarUrl(picture) {
  return normalizeImageUrl(picture, app.globalData.baseUrl, '/images/avatar.png')
}

function appendCacheKey(url) {
  if (!url || url.indexOf('http') !== 0) {
    return url
  }

  const separator = url.includes('?') ? '&' : '?'
  return `${url}${separator}t=${Date.now()}`
}

function normalizeUserInfo(rawUserInfo = {}) {
  return {
    ...rawUserInfo,
    userName: sanitizeUserNameInput(rawUserInfo.userName),
    userPicture: safeText(rawUserInfo.userPicture, '')
  }
}

function buildUserPayload(userInfo = {}) {
  return {
    userId: firstValid(userInfo.userId, userInfo.id),
    userName: sanitizeUserNameInput(userInfo.userName),
    phoneNumber: safeText(userInfo.phoneNumber, ''),
    sex: userInfo.sex,
    email: safeText(userInfo.email, ''),
    userPicture: safeText(userInfo.userPicture, '')
  }
}

Page({
  data: {
    userInfo: {},
    roleId: 3,
    isLoggedIn: false,
    avatarUrl: '/images/avatar.png',
    userNameMaxLength: USERNAME_MAX_LENGTH,
    userNamePlaceholder: USERNAME_PLACEHOLDER,
    userNameRuleHint: USERNAME_RULE_HINT
  },

  onLoad() {
    this.initGlobalData()
    this.loadUserInfo()
  },

  onShow() {
    this.initGlobalData()
    this.loadUserInfo()
  },

  initGlobalData() {
    const userInfo = wx.getStorageSync('userInfo') || {}
    const token = wx.getStorageSync('token') || ''
    const roleId = Number(wx.getStorageSync('roleId') || 3)
    const isLoggedIn = Boolean(wx.getStorageSync('isLoggedIn') || token)

    app.globalData.userInfo = userInfo
    app.globalData.token = token
    app.globalData.roleId = roleId
    app.globalData.isLoggedIn = isLoggedIn

    this.setData({
      roleId,
      isLoggedIn
    })
  },

  applyUserInfo(userInfo, shouldPersist = false, refreshAvatar = false) {
    const nextUserInfo = normalizeUserInfo(userInfo)
    const avatarUrl = refreshAvatar
      ? appendCacheKey(buildAvatarUrl(nextUserInfo.userPicture))
      : buildAvatarUrl(nextUserInfo.userPicture)

    this.setData({
      userInfo: nextUserInfo,
      avatarUrl
    })

    if (shouldPersist) {
      wx.setStorageSync('userInfo', nextUserInfo)
      app.globalData.userInfo = nextUserInfo
    }
  },

  loadUserInfo() {
    if (!this.data.isLoggedIn) {
      wx.navigateTo({
        url: '/pages/login/login'
      })
      return
    }

    const storedUserInfo = wx.getStorageSync('userInfo') || app.globalData.userInfo || {}
    const userId = firstValid(storedUserInfo.userId, storedUserInfo.id)

    this.applyUserInfo(storedUserInfo, false)

    if (!userId) {
      return
    }

    app.request({
      url: `sysUser/${userId}`,
      method: 'GET',
      hideLoading: true,
      success: res => {
        if (res.statusCode === 200 && res.data && res.data.code === 200 && res.data.data) {
          this.applyUserInfo({
            ...storedUserInfo,
            ...res.data.data,
            userPicture: safeText(firstValid(res.data.data.userPicture, storedUserInfo.userPicture), '')
          }, true)
          return
        }

        wx.showToast({
          title: '用户信息加载失败',
          icon: 'none'
        })
      },
      fail: () => {
        wx.showToast({
          title: '用户信息加载失败',
          icon: 'none'
        })
      }
    })
  },

  savePersonalInfo() {
    const userInfo = this.data.userInfo
    const normalizedUserName = sanitizeUserNameInput(userInfo.userName)
    const userNameError = validateUserName(normalizedUserName)

    if (normalizedUserName !== safeText(userInfo.userName, '')) {
      this.setData({
        'userInfo.userName': normalizedUserName
      })
    }

    if (userNameError) {
      wx.showToast({
        title: userNameError,
        icon: 'none'
      })
      return
    }

    if (userInfo.phoneNumber && !/^1\d{10}$/.test(userInfo.phoneNumber)) {
      wx.showToast({
        title: '手机号格式不正确',
        icon: 'none'
      })
      return
    }

    this.syncUserInfo({
      ...userInfo,
      userName: normalizedUserName
    }, '保存成功', false, () => {
      setTimeout(() => {
        wx.navigateBack()
      }, 300)
    })
  },

  syncUserInfo(userInfo, successTitle = '保存成功', refreshAvatar = false, onSuccess) {
    const payload = buildUserPayload(userInfo)
    if (!payload.userId || !payload.userName) {
      wx.showToast({
        title: '用户信息不完整',
        icon: 'none'
      })
      return
    }

    wx.showLoading({
      title: '保存中...'
    })

    app.request({
      url: 'sysUser',
      method: 'PUT',
      data: payload,
      hideLoading: true,
      success: res => {
        if (res.statusCode === 200 && res.data && res.data.code === 200) {
          const mergedUserInfo = {
            ...(wx.getStorageSync('userInfo') || {}),
            ...this.data.userInfo,
            ...payload
          }

          this.applyUserInfo(mergedUserInfo, true, refreshAvatar)
          wx.showToast({
            title: successTitle,
            icon: 'success'
          })

          if (typeof onSuccess === 'function') {
            onSuccess()
          }
          return
        }

        wx.showToast({
          title: safeText(firstValid(res.data && res.data.msg, res.data && res.data.message), '保存失败'),
          icon: 'none'
        })
        this.applyUserInfo(this.data.userInfo, false)
      },
      fail: () => {
        wx.showToast({
          title: '保存失败，请稍后重试',
          icon: 'none'
        })
        this.applyUserInfo(this.data.userInfo, false)
      },
      complete: () => {
        wx.hideLoading()
      }
    })
  },

  chooseImage() {
    wx.chooseMedia({
      count: 1,
      mediaType: ['image'],
      sourceType: ['album', 'camera'],
      sizeType: ['compressed'],
      success: res => {
        const tempFilePath = res.tempFiles && res.tempFiles[0] ? res.tempFiles[0].tempFilePath : ''
        if (!tempFilePath) {
          return
        }

        this.uploadImage(tempFilePath)
      }
    })
  },

  uploadImage(filePath) {
    const token = app.globalData.token || wx.getStorageSync('token')
    if (!token) {
      wx.showToast({
        title: '请先登录',
        icon: 'none'
      })
      return
    }

    const previousUserInfo = { ...this.data.userInfo }
    this.setData({
      avatarUrl: filePath
    })

    wx.showLoading({
      title: '上传中...'
    })

    wx.uploadFile({
      url: `${app.globalData.baseUrl}upload/user`,
      filePath,
      name: 'file',
      header: {
        token
      },
      success: res => {
        try {
          const response = JSON.parse(res.data || '{}')
          if (response.code === 200) {
            this.persistUserAvatar(response.data, previousUserInfo)
            return
          }
        } catch (error) {
        }

        this.applyUserInfo(previousUserInfo, false)
        wx.showToast({
          title: '头像上传失败',
          icon: 'none'
        })
      },
      fail: () => {
        this.applyUserInfo(previousUserInfo, false)
        wx.showToast({
          title: '头像上传失败',
          icon: 'none'
        })
      },
      complete: () => {
        wx.hideLoading()
      }
    })
  },

  persistUserAvatar(data, previousUserInfo) {
    const fileUrl = safeText(firstValid(
      typeof data === 'string' ? data : '',
      data && data.fileUrl,
      data && data.url,
      data && data.path,
      data && data.src,
      data && data.userPicture,
      data && data.data && data.data.fileUrl,
      data && data.data && data.data.url
    ), '')

    if (!fileUrl) {
      this.applyUserInfo(previousUserInfo, false)
      wx.showToast({
        title: '头像上传失败',
        icon: 'none'
      })
      return
    }

    const nextUserInfo = {
      ...this.data.userInfo,
      userPicture: fileUrl
    }

    this.syncUserInfo(nextUserInfo, '头像已更新', true)
  },

  goBack() {
    wx.navigateBack()
  },

  onGenderChange(e) {
    const { value } = e.detail
    let sex = null

    if (value === 'male') {
      sex = true
    } else if (value === 'female') {
      sex = false
    }

    this.setData({
      'userInfo.sex': sex
    })
  },

  onFieldChange(e) {
    const { name } = e.currentTarget.dataset
    let value = e.detail.value

    if (name === 'userName') {
      value = sanitizeUserNameInput(value)
    }

    this.setData({
      [`userInfo.${name}`]: value
    })
  }
})
