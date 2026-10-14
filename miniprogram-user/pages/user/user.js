const app = getApp()
const { normalizeImageUrl, safeText } = require('../../utils/normalizers')

Page({
  data: {
    userInfo: {},
    roleId: 3,
    isLoggedIn: false
  },

  onLoad() {
    this.loadLocalUserInfo()
  },

  onShow() {
    this.loadLocalUserInfo()

    if (typeof this.getTabBar === 'function' && this.getTabBar()) {
      this.getTabBar().setData({ selected: 3 })
    }
  },

  loadLocalUserInfo() {
    const userInfo = wx.getStorageSync('userInfo') || {}
    const token = wx.getStorageSync('token') || ''
    const roleId = Number(wx.getStorageSync('roleId') || 3)
    const isLoggedIn = Boolean(wx.getStorageSync('isLoggedIn') || token)

    this.setData({
      userInfo: {
        ...userInfo,
        userName: safeText(userInfo.userName, isLoggedIn ? '未命名用户' : '未登录'),
        userPicture: normalizeImageUrl(userInfo.userPicture, app.globalData.baseUrl, '/images/avatar.png')
      },
      roleId,
      isLoggedIn
    })
  },

  onUserInfoTap() {
    if (!this.data.isLoggedIn) {
      wx.navigateTo({
        url: '/pages/login/login'
      })
      return
    }

    wx.navigateTo({
      url: '/pages/user/personal-info/personal-info'
    })
  },

  navigateTo(e) {
    const { url } = e.currentTarget.dataset
    if (!url) {
      return
    }

    if (!this.data.isLoggedIn) {
      wx.navigateTo({
        url: '/pages/login/login'
      })
      return
    }

    wx.navigateTo({ url })
  },

  goToChangePassword() {
    if (!this.data.isLoggedIn) {
      wx.navigateTo({
        url: '/pages/login/login'
      })
      return
    }

    wx.navigateTo({
      url: '/pages/change-password/change-password'
    })
  },

  logout() {
    wx.showModal({
      title: '退出登录',
      content: '确定退出当前账号吗？',
      success: res => {
        if (!res.confirm) {
          return
        }

        app.clearLoginState()
        app.redirectToLogin()
      }
    })
  }
})
