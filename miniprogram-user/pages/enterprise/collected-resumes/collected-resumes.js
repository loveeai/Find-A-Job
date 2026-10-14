const app = getApp()
const { extractList, firstValid, formatDate, normalizeResume, safeText } = require('../../../utils/normalizers')

Page({
  data: {
    loading: false,
    collectedList: []
  },

  onLoad() {
    this.loadCollectedResumes()
  },

  onShow() {
    this.loadCollectedResumes()
  },

  getCompanyId() {
    const userInfo = wx.getStorageSync('userInfo') || app.globalData.userInfo || {}
    return firstValid(userInfo.companyId, userInfo.company && userInfo.company.id)
  },

  loadCollectedResumes() {
    const enterpriseId = this.getCompanyId()
    if (!enterpriseId) {
      this.setData({
        loading: false,
        collectedList: []
      })
      return
    }

    this.setData({ loading: true })

    app.request({
      url: 'enterpriseCollectResume',
      method: 'GET',
      hideLoading: true,
      data: { enterpriseId },
      success: async res => {
        if (res.statusCode !== 200 || !res.data || res.data.code !== 200) {
          this.setData({
            loading: false,
            collectedList: []
          })
          return
        }

        const records = extractList(res.data)
        const resumeList = await Promise.all(records.map(item => this.fetchResume(item.resumeId)))

        const collectedList = records.map((item, index) => {
          const resume = resumeList[index]
          const introPreview = safeText(resume && resume.selfIntroduction, '')
            .split(/[，。；;,.]/)
            .map(text => text.trim())
            .filter(Boolean)
            .slice(0, 3)

          return {
            id: item.id,
            collectId: item.id,
            collectedAt: formatDate(item.createTime) || '暂无记录',
            resumeId: item.resumeId,
            resume,
            introPreview
          }
        })

        this.setData({
          loading: false,
          collectedList
        })
      },
      fail: () => {
        this.setData({
          loading: false,
          collectedList: []
        })
      }
    })
  },

  fetchResume(resumeId) {
    if (!resumeId) {
      return Promise.resolve(null)
    }

    return new Promise(resolve => {
      app.request({
        url: `resume/${resumeId}`,
        method: 'GET',
        hideLoading: true,
        success: res => {
          if (res.statusCode === 200 && res.data && res.data.code === 200 && res.data.data) {
            resolve(normalizeResume(res.data.data, app.globalData.baseUrl))
            return
          }
          resolve(null)
        },
        fail: () => resolve(null)
      })
    })
  },

  goToResumeDetail(e) {
    const { id } = e.currentTarget.dataset
    if (!id) {
      wx.showToast({
        title: '简历不存在',
        icon: 'none'
      })
      return
    }

    wx.navigateTo({
      url: `/pages/enterprise/resume-detail/resume-detail?id=${id}`
    })
  },

  startChat(e) {
    const { userId, userName, userAvatar } = e.currentTarget.dataset
    if (!userId) {
      wx.showToast({
        title: '求职者信息不完整',
        icon: 'none'
      })
      return
    }

    wx.navigateTo({
      url: `/pages/chat/chat?userId=${userId}&userName=${encodeURIComponent(userName || '候选人')}&userAvatar=${encodeURIComponent(userAvatar || '')}`
    })
  },

  removeCollect(e) {
    const { id } = e.currentTarget.dataset
    if (!id) {
      return
    }

    wx.showModal({
      title: '取消收藏',
      content: '确认从收藏列表中移除该求职者吗？',
      success: result => {
        if (!result.confirm) {
          return
        }

        app.request({
          url: `enterpriseCollectResume/${id}`,
          method: 'DELETE',
          loadingTitle: '处理中...',
          success: res => {
            if (res.statusCode === 200 && res.data && res.data.code === 200) {
              wx.showToast({
                title: '已取消收藏',
                icon: 'success'
              })
              this.setData({
                collectedList: this.data.collectedList.filter(item => String(item.collectId) !== String(id))
              })
              return
            }

            wx.showToast({
              title: safeText(res.data && res.data.msg, '取消收藏失败'),
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
      }
    })
  }
})
