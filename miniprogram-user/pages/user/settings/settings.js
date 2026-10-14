// pages/user/settings/settings.js
const app = getApp()

Page({
  data: {
    userInfo: {},
    isLoggedIn: false
  },

  onLoad() {
    this.setData({
      userInfo: app.globalData.userInfo || {},
      isLoggedIn: app.globalData.isLoggedIn
    })
  },

  onShow() {
    this.setData({
      userInfo: app.globalData.userInfo || {},
      isLoggedIn: app.globalData.isLoggedIn
    })
  },

  // 编辑个人信息
  editProfile() {
    if (!this.data.isLoggedIn) {
      wx.redirectTo({
        url: '/pages/login/login'
      })
      return
    }
    wx.navigateTo({
      url: '/pages/user/edit-profile/edit-profile'
    })
  },

  // 修改密码
  changePassword() {
    if (!this.data.isLoggedIn) {
      wx.redirectTo({
        url: '/pages/login/login'
      })
      return
    }
    wx.navigateTo({
      url: '/pages/user/change-password/change-password'
    })
  },

  // 隐私设置
  privacySettings() {
    wx.navigateTo({
      url: '/pages/user/privacy/privacy'
    })
  },

  // 清除缓存
  clearCache() {
    wx.showModal({
      title: '清除缓存',
      content: '确定要清除所有缓存数据吗？',
      success: (res) => {
        if (res.confirm) {
          // 清除缓存
          wx.clearStorageSync()
          wx.showToast({
            title: '缓存已清除',
            icon: 'success'
          })
        }
      }
    })
  }
})