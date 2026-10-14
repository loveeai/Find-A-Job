// pages/user/about/about.js

Page({
  data: {
    version: '1.0.0'
  },

  onLoad() {
    // 页面加载时可以获取版本信息等
  },

  // 跳转到用户协议
  goToUserAgreement() {
    wx.navigateTo({
      url: '/pages/user/agreement/user-agreement'
    })
  },

  // 跳转到隐私政策
  goToPrivacyPolicy() {
    wx.navigateTo({
      url: '/pages/user/agreement/privacy-policy'
    })
  },

  // 联系客服
  contactCustomerService() {
    wx.showModal({
      title: '联系客服',
      content: '客服电话：400-123-4567',
      showCancel: false
    })
  }
})