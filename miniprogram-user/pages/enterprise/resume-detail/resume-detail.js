const app = getApp()
const { extractList, firstValid, normalizeResume } = require('../../../utils/normalizers')

Page({
  data: {
    resumeId: '',
    resume: null,
    isCollected: false,
    collectId: '',
    isLoading: true
  },

  onLoad(options) {
    if (!options.id) {
      wx.showToast({
        title: '简历不存在',
        icon: 'none'
      })
      return
    }

    this.setData({
      resumeId: options.id
    })

    this.loadResumeDetail()
    this.checkCollectionStatus()
  },

  getCompanyId() {
    const userInfo = wx.getStorageSync('userInfo') || app.globalData.userInfo || {}
    return firstValid(userInfo.companyId, userInfo.company && userInfo.company.id)
  },

  goBack() {
    wx.navigateBack()
  },

  loadResumeDetail() {
    this.setData({ isLoading: true })

    app.request({
      url: `resume/${this.data.resumeId}`,
      method: 'GET',
      success: res => {
        if (res.statusCode === 200 && res.data && res.data.code === 200 && res.data.data) {
          this.setData({
            resume: normalizeResume(res.data.data, app.globalData.baseUrl)
          })
          return
        }

        wx.showToast({
          title: '简历详情加载失败',
          icon: 'none'
        })
      },
      fail: () => {
        wx.showToast({
          title: '简历详情加载失败',
          icon: 'none'
        })
      },
      complete: () => {
        this.setData({ isLoading: false })
      }
    })
  },

  checkCollectionStatus() {
    const enterpriseId = this.getCompanyId()
    if (!enterpriseId) {
      return
    }

    app.request({
      url: 'enterpriseCollectResume',
      method: 'GET',
      hideLoading: true,
      data: {
        resumeId: this.data.resumeId,
        enterpriseId
      },
      success: res => {
        if (res.statusCode !== 200 || !res.data || res.data.code !== 200) {
          return
        }

        const targetRecord = extractList(res.data).find(item => String(item.resumeId) === String(this.data.resumeId))
        this.setData({
          isCollected: Boolean(targetRecord),
          collectId: targetRecord ? targetRecord.id : ''
        })
      }
    })
  },

  toggleCollection() {
    if (this.data.isCollected) {
      this.cancelCollection()
      return
    }

    this.collectResume()
  },

  collectResume() {
    const enterpriseId = this.getCompanyId()
    const userInfo = wx.getStorageSync('userInfo') || app.globalData.userInfo || {}
    const userId = firstValid(userInfo.userId, userInfo.id)

    if (!enterpriseId) {
      wx.showToast({
        title: '未获取到企业信息',
        icon: 'none'
      })
      return
    }

    app.request({
      url: 'enterpriseCollectResume',
      method: 'POST',
      data: {
        resumeId: Number(this.data.resumeId),
        enterpriseId: Number(enterpriseId),
        userId: Number(userId || 0)
      },
      success: res => {
        if (res.statusCode === 200 && res.data && res.data.code === 200) {
          this.setData({
            isCollected: true
          })
          this.checkCollectionStatus()
          wx.showToast({
            title: '收藏成功',
            icon: 'success'
          })
          return
        }

        wx.showToast({
          title: '收藏失败',
          icon: 'none'
        })
      },
      fail: () => {
        wx.showToast({
          title: '收藏失败，请稍后重试',
          icon: 'none'
        })
      }
    })
  },

  cancelCollection() {
    if (!this.data.collectId) {
      this.checkCollectionStatus()
      wx.showToast({
        title: '已取消收藏',
        icon: 'success'
      })
      return
    }

    app.request({
      url: `enterpriseCollectResume/${this.data.collectId}`,
      method: 'DELETE',
      success: res => {
        if (res.statusCode === 200 && res.data && res.data.code === 200) {
          this.setData({
            isCollected: false,
            collectId: ''
          })
          wx.showToast({
            title: '已取消收藏',
            icon: 'success'
          })
          return
        }

        wx.showToast({
          title: '取消收藏失败',
          icon: 'none'
        })
      },
      fail: () => {
        wx.showToast({
          title: '取消收藏失败',
          icon: 'none'
        })
      }
    })
  },

  startChat() {
    if (!this.data.resume || !this.data.resume.userId) {
      wx.showToast({
        title: '求职者信息不完整',
        icon: 'none'
      })
      return
    }

    wx.navigateTo({
      url: `/pages/chat/chat?userId=${this.data.resume.userId}&userName=${encodeURIComponent(this.data.resume.name || '候选人')}&userAvatar=${encodeURIComponent(this.data.resume.avatar || '')}`
    })
  }
})
