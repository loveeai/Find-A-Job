const app = getApp()
const {
  extractList,
  firstValid,
  normalizeImageUrl,
  normalizeJob,
  safeText
} = require('../../utils/normalizers')

function sortJobsByPublishTime(jobList) {
  return jobList.slice().sort((a, b) => {
    const timestampDiff = Number(b.publishTimestamp || 0) - Number(a.publishTimestamp || 0)
    if (timestampDiff !== 0) {
      return timestampDiff
    }
    return Number(b.id || 0) - Number(a.id || 0)
  })
}

Page({
  data: {
    bannerList: [],
    jobList: [],
    isLoadingJobs: true,
    lastJobListToken: ''
  },

  onLoad() {
    this.checkUserRole()
    this.loadBannerList()
    this.loadJobList()
  },

  onShow() {
    this.checkUserRole()
    const currentToken = app.globalData.token || wx.getStorageSync('token') || ''

    if (typeof this.getTabBar === 'function' && this.getTabBar()) {
      this.getTabBar().setData({ selected: 0 })
    }

    if (!this.data.jobList.length || currentToken !== this.data.lastJobListToken) {
      this.loadJobList()
      return
    }

    this.syncCollectedState()
  },

  checkUserRole() {
    const isLoggedIn = app.globalData.isLoggedIn || wx.getStorageSync('isLoggedIn')
    const roleId = Number(app.globalData.roleId || wx.getStorageSync('roleId') || 3)

    if (isLoggedIn && roleId === 2) {
      wx.reLaunch({
        url: '/pages/enterprise/index/index'
      })
    }
  },

  loadBannerList() {
    const fallbackList = [
      {
        id: 'local-banner',
        title: '校园兼职精选',
        imageUrl: '/images/logo.png'
      }
    ]

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
          this.setData({ bannerList: fallbackList })
          return
        }

        const list = extractList(res.data)
        const bannerList = list
          .map(item => ({
            id: firstValid(item.id, item.bannerId, item.carouselId, `banner-${Date.now()}`),
            title: safeText(firstValid(item.title, item.name), '校园兼职精选'),
            imageUrl: normalizeImageUrl(
              firstValid(item.posters, item.imageUrl, item.imgUrl, item.image, item.url),
              app.globalData.baseUrl,
              '/images/logo.png'
            )
          }))
          .filter(item => item.imageUrl)

        this.setData({
          bannerList: bannerList.length ? bannerList : fallbackList
        })
      },
      fail: () => {
        this.setData({ bannerList: fallbackList })
      }
    })
  },

  loadJobList() {
    this.setData({ isLoadingJobs: true })

    app.request({
      url: 'job',
      method: 'GET',
      data: {
        pageNum: 1,
        pageSize: 6,
        status: 1,
        activeOnly: true
      },
      success: res => {
        if (res.statusCode !== 200 || !res.data || res.data.code !== 200) {
          this.setData({
            jobList: [],
            isLoadingJobs: false
          })
          return
        }

        const jobList = sortJobsByPublishTime(
          extractList(res.data).map(item => normalizeJob(item, app.globalData.baseUrl))
        )
        this.setData({
          jobList,
          isLoadingJobs: false,
          lastJobListToken: app.globalData.token || wx.getStorageSync('token') || ''
        })
        this.syncCollectedState()
      },
      fail: () => {
        this.setData({
          jobList: [],
          isLoadingJobs: false
        })
      }
    })
  },

  syncCollectedState() {
    const isLoggedIn = app.globalData.isLoggedIn || wx.getStorageSync('isLoggedIn')
    const roleId = Number(app.globalData.roleId || wx.getStorageSync('roleId') || 3)

    if (!isLoggedIn || roleId === 2 || !this.data.jobList.length) {
      return
    }

    app.request({
      url: 'userCollectJob',
      method: 'GET',
      hideLoading: true,
      success: res => {
        if (res.statusCode !== 200 || !res.data || res.data.code !== 200) {
          return
        }

        const collectedSet = new Set(
          extractList(res.data)
            .map(item => String(item.jobId))
            .filter(Boolean)
        )

        this.setData({
          jobList: this.data.jobList.map(job => ({
            ...job,
            isCollected: collectedSet.has(String(job.id))
          }))
        })
      }
    })
  },

  goToJobList() {
    wx.navigateTo({
      url: '/pages/job/job'
    })
  },

  goToJobDetail(e) {
    const { id } = e.currentTarget.dataset
    if (!id) {
      return
    }

    wx.navigateTo({
      url: `/pages/job-detail/job-detail?id=${id}`
    })
  },

  collectJob(e) {
    const { id } = e.currentTarget.dataset
    const jobIndex = this.data.jobList.findIndex(job => String(job.id) === String(id))

    if (jobIndex < 0) {
      return
    }

    const isLoggedIn = app.globalData.isLoggedIn || wx.getStorageSync('isLoggedIn')
    const roleId = Number(app.globalData.roleId || wx.getStorageSync('roleId') || 3)

    if (!isLoggedIn) {
      wx.showModal({
        title: '提示',
        content: '登录后才能收藏职位，是否前往登录？',
        success: result => {
          if (result.confirm) {
            wx.navigateTo({ url: '/pages/login/login' })
          }
        }
      })
      return
    }

    if (roleId === 2) {
      wx.showToast({
        title: '企业用户无法收藏职位',
        icon: 'none'
      })
      return
    }

    const originalJob = this.data.jobList[jobIndex]
    const nextCollected = !originalJob.isCollected
    const jobList = this.data.jobList.slice()
    jobList[jobIndex] = {
      ...originalJob,
      isCollected: nextCollected
    }
    this.setData({ jobList })

    if (nextCollected) {
      app.request({
        url: 'userCollectJob',
        method: 'POST',
        data: {
          jobId: originalJob.id
        },
        hideLoading: true,
        success: res => {
          if (res.statusCode === 200 && res.data && res.data.code === 200) {
            wx.showToast({
              title: '收藏成功',
              icon: 'success'
            })
            return
          }

          this.restoreJobCollect(jobIndex, originalJob)
        },
        fail: () => {
          this.restoreJobCollect(jobIndex, originalJob)
        }
      })
      return
    }

    app.request({
      url: 'userCollectJob',
      method: 'GET',
      hideLoading: true,
      data: {
        jobId: originalJob.id
      },
      success: res => {
        if (res.statusCode !== 200 || !res.data || res.data.code !== 200) {
          this.restoreJobCollect(jobIndex, originalJob)
          return
        }

        const records = extractList(res.data)
        const targetRecord = records.find(item => String(item.jobId) === String(originalJob.id))

        if (!targetRecord || !targetRecord.id) {
          wx.showToast({
            title: '已取消收藏',
            icon: 'success'
          })
          return
        }

        app.request({
          url: `userCollectJob/${targetRecord.id}`,
          method: 'DELETE',
          hideLoading: true,
          success: deleteRes => {
            if (deleteRes.statusCode === 200 && deleteRes.data && deleteRes.data.code === 200) {
              wx.showToast({
                title: '已取消收藏',
                icon: 'success'
              })
              return
            }

            this.restoreJobCollect(jobIndex, originalJob)
          },
          fail: () => {
            this.restoreJobCollect(jobIndex, originalJob)
          }
        })
      },
      fail: () => {
        this.restoreJobCollect(jobIndex, originalJob)
      }
    })
  },

  restoreJobCollect(jobIndex, originalJob) {
    const jobList = this.data.jobList.slice()
    jobList[jobIndex] = originalJob
    this.setData({ jobList })
    wx.showToast({
      title: '操作失败，请稍后重试',
      icon: 'none'
    })
  }
})
