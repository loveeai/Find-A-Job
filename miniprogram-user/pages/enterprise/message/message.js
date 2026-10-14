const app = getApp()
const {
  buildChatUrl,
  fetchConversationList,
  getCurrentUserProfile
} = require('../../../utils/message-center')

Page({
  data: {
    currentUserId: '',
    loading: false,
    conversations: []
  },

  onLoad() {
    this.bootstrap()
  },

  onShow() {
    if (this.data.currentUserId) {
      this.loadConversationList()
      return
    }

    this.bootstrap()
  },

  onPullDownRefresh() {
    this.loadConversationList().finally(() => {
      wx.stopPullDownRefresh()
    })
  },

  bootstrap() {
    const profile = getCurrentUserProfile(app)
    if (!profile.userId || !profile.token) {
      wx.navigateTo({
        url: '/pages/login/login'
      })
      return
    }

    if (profile.roleId !== 2) {
      wx.redirectTo({
        url: '/pages/message/message'
      })
      return
    }

    this.setData({
      currentUserId: profile.userId
    })

    this.loadConversationList()
  },

  async loadConversationList() {
    if (!this.data.currentUserId || this.data.loading) {
      return
    }

    this.setData({ loading: true })

    const conversations = await fetchConversationList(app, this.data.currentUserId)
    this.setData({
      conversations,
      loading: false
    })
  },

  openConversation(e) {
    const { index } = e.currentTarget.dataset
    const conversation = this.data.conversations[index]
    if (!conversation) {
      return
    }

    wx.navigateTo({
      url: buildChatUrl(conversation)
    })
  }
})
