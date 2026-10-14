const app = getApp()
const {
  extractList,
  firstValid,
  normalizeImageUrl,
  normalizeResume,
  safeText
} = require('../../../utils/normalizers')

Page({
  data: {
    bannerList: [],
    userList: [],
    isLoading: true
  },

  onLoad() {
    this.loadBannerList()
  },

  onShow() {
    this.loadRecommendedUsers()
  },

  getCompanyId() {
    const userInfo = wx.getStorageSync('userInfo') || app.globalData.userInfo || {}
    return firstValid(userInfo.companyId, userInfo.company && userInfo.company.id)
  },

  loadBannerList() {
    app.request({
      url: 'carousel',
      method: 'GET',
      hideLoading: true,
      data: {
        pageNum: 1,
        pageSize: 5
      },
      success: res => {
        if (res.statusCode !== 200 || !res.data || res.data.code !== 200) {
          this.setData({
            bannerList: [
              {
                id: 'enterprise-banner',
                imageUrl: '/images/logo.png'
              }
            ]
          })
          return
        }

        const bannerList = extractList(res.data).map(item => ({
          id: firstValid(item.id, item.bannerId, item.carouselId),
          imageUrl: normalizeImageUrl(
            firstValid(item.posters, item.imageUrl, item.imgUrl, item.image, item.url),
            app.globalData.baseUrl,
            '/images/logo.png'
          )
        }))

        this.setData({
          bannerList: bannerList.length ? bannerList : [{ id: 'enterprise-banner', imageUrl: '/images/logo.png' }]
        })
      }
    })
  },

  loadRecommendedUsers() {
    this.setData({ isLoading: true })

    app.request({
      url: 'resume',
      method: 'GET',
      data: {
        pageNum: 1,
        pageSize: 1000
      },
      success: res => {
        if (res.statusCode !== 200 || !res.data || res.data.code !== 200) {
          this.setData({
            userList: []
          })
          return
        }

        const userList = extractList(res.data).map(item => {
          const resume = normalizeResume(item, app.globalData.baseUrl)
          const skillPreview = safeText(item.selfIntroduction, '')
            .split(/[，,。；;]/)
            .map(text => text.trim())
            .filter(Boolean)
            .slice(0, 3)

          return {
            ...resume,
            skillPreview,
            isCollected: false,
            collectId: ''
          }
        })

        this.setData({ userList })
        this.syncCollectedState()
      },
      fail: () => {
        this.setData({ userList: [] })
      },
      complete: () => {
        this.setData({ isLoading: false })
      }
    })
  },

  syncCollectedState() {
    const enterpriseId = this.getCompanyId()
    if (!enterpriseId || !this.data.userList.length) {
      return
    }

    app.request({
      url: 'enterpriseCollectResume',
      method: 'GET',
      hideLoading: true,
      data: {
        enterpriseId
      },
      success: res => {
        if (res.statusCode !== 200 || !res.data || res.data.code !== 200) {
          return
        }

        const collectedMap = {}
        extractList(res.data).forEach(item => {
          if (item.resumeId) {
            collectedMap[String(item.resumeId)] = item.id
          }
        })

        this.setData({
          userList: this.data.userList.map(item => ({
            ...item,
            isCollected: Boolean(collectedMap[String(item.id)]),
            collectId: collectedMap[String(item.id)] || ''
          }))
        })
      }
    })
  },

  navigateTo(e) {
    const { url } = e.currentTarget.dataset
    if (!url) {
      return
    }

    wx.navigateTo({ url })
  },

  goToResumeDetail(e) {
    const { id } = e.currentTarget.dataset
    wx.navigateTo({
      url: `/pages/enterprise/resume-detail/resume-detail?id=${id}`
    })
  },

  collectResume(e) {
    const { id } = e.currentTarget.dataset
    const enterpriseId = this.getCompanyId()
    const userInfo = wx.getStorageSync('userInfo') || app.globalData.userInfo || {}
    const userId = firstValid(userInfo.userId, userInfo.id)
    const userList = this.data.userList.slice()
    const index = userList.findIndex(item => String(item.id) === String(id))

    if (index < 0 || !enterpriseId) {
      return
    }

    const current = userList[index]
    if (current.isCollected && current.collectId) {
      app.request({
        url: `enterpriseCollectResume/${current.collectId}`,
        method: 'DELETE',
        hideLoading: true,
        success: res => {
          if (res.statusCode === 200 && res.data && res.data.code === 200) {
            userList[index] = {
              ...current,
              isCollected: false,
              collectId: ''
            }
            this.setData({ userList })
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
      return
    }

    app.request({
      url: 'enterpriseCollectResume',
      method: 'POST',
      data: {
        resumeId: Number(current.id),
        enterpriseId: Number(enterpriseId),
        userId: Number(userId || 0)
      },
      hideLoading: true,
      success: res => {
        if (res.statusCode === 200 && res.data && res.data.code === 200) {
          wx.showToast({
            title: '收藏成功',
            icon: 'success'
          })
          this.syncCollectedState()
          return
        }

        wx.showToast({
          title: '收藏失败',
          icon: 'none'
        })
      },
      fail: () => {
        wx.showToast({
          title: '收藏失败',
          icon: 'none'
        })
      }
    })
  }
})
