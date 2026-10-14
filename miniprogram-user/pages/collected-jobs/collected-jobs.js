const app = getApp()
const { extractList, safeText } = require('../../utils/normalizers')

Page({
  data: {
    collectedJobs: [],
    isLoading: true
  },

  onLoad() {
    this.loadCollectedJobs()
  },

  onShow() {
    this.loadCollectedJobs()
  },

  loadCollectedJobs() {
    const isLoggedIn = app.globalData.isLoggedIn || wx.getStorageSync('isLoggedIn')
    if (!isLoggedIn) {
      wx.redirectTo({
        url: '/pages/login/login'
      })
      return
    }

    this.setData({ isLoading: true })

    app.request({
      url: 'userCollectJob',
      method: 'GET',
      success: res => {
        if (res.statusCode !== 200 || !res.data || res.data.code !== 200) {
          this.setData({
            collectedJobs: []
          })
          return
        }

        const collectedJobs = extractList(res.data).map(item => ({
          collectId: item.id,
          id: item.jobId,
          title: safeText(item.title, '职位名称待完善'),
          companyName: safeText(item.companyName, '企业名称待完善'),
          salary: safeText(item.salary, '薪资面议'),
          location: safeText(item.location, '地点待更新'),
          industry: safeText(item.industry, '行业待更新'),
          description: safeText(item.description, '暂无岗位描述')
        }))

        this.setData({ collectedJobs })
      },
      fail: () => {
        this.setData({
          collectedJobs: []
        })
      },
      complete: () => {
        this.setData({ isLoading: false })
      }
    })
  },

  goToJobDetail(e) {
    const { id } = e.currentTarget.dataset
    wx.navigateTo({
      url: `/pages/job-detail/job-detail?id=${id}`
    })
  },

  cancelCollect(e) {
    const { collectId } = e.currentTarget.dataset
    if (!collectId) {
      return
    }

    wx.showModal({
      title: '取消收藏',
      content: '确定取消收藏这个职位吗？',
      success: res => {
        if (!res.confirm) {
          return
        }

        app.request({
          url: `userCollectJob/${collectId}`,
          method: 'DELETE',
          success: deleteRes => {
            if (deleteRes.statusCode === 200 && deleteRes.data && deleteRes.data.code === 200) {
              wx.showToast({
                title: '已取消收藏',
                icon: 'success'
              })
              this.setData({
                collectedJobs: this.data.collectedJobs.filter(item => String(item.collectId) !== String(collectId))
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
      }
    })
  }
})
