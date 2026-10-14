const app = getApp()
const { extractList, normalizeJob } = require('../../utils/normalizers')

Page({
  data: {
    keyword: '',
    jobList: [],
    pageNum: 1,
    pageSize: 10,
    total: 0,
    hasMore: true,
    isLoading: false
  },

  onLoad(options) {
    this.checkUserRole()

    if (options.keyword) {
      this.setData({ keyword: options.keyword })
    }

    this.loadJobs(true)
  },

  onShow() {
    this.checkUserRole()
    if (!this.data.jobList.length && !this.data.isLoading) {
      this.loadJobs(true)
      return
    }
    this.syncCollectedState()
  },

  onPullDownRefresh() {
    this.loadJobs(true)
  },

  onReachBottom() {
    if (this.data.hasMore) {
      this.loadJobs()
    }
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

  onKeywordInput(e) {
    this.setData({
      keyword: e.detail.value
    })
  },

  submitSearch() {
    this.loadJobs(true)
  },

  clearKeyword() {
    this.setData({ keyword: '' })
    this.loadJobs(true)
  },

  loadJobs(reset = false) {
    if (this.data.isLoading) {
      return
    }

    const pageNum = reset ? 1 : this.data.pageNum
    this.setData({ isLoading: true })

    app.request({
      url: 'job',
      method: 'GET',
      data: {
        pageNum,
        pageSize: this.data.pageSize,
        status: 1,
        activeOnly: true,
        keyword: this.data.keyword.trim()
      },
      success: res => {
        if (res.statusCode !== 200 || !res.data || res.data.code !== 200) {
          this.setData({
            jobList: reset ? [] : this.data.jobList,
            hasMore: false
          })
          return
        }

        const list = extractList(res.data).map(item => normalizeJob(item, app.globalData.baseUrl))
        const jobList = reset ? list : this.data.jobList.concat(list)
        const total = Number(res.data.total || jobList.length)

        this.setData({
          jobList,
          total,
          pageNum: pageNum + 1,
          hasMore: jobList.length < total
        })

        this.syncCollectedState()
      },
      fail: () => {
        if (reset) {
          this.setData({
            jobList: [],
            hasMore: false
          })
        }
      },
      complete: () => {
        this.setData({ isLoading: false })
        wx.stopPullDownRefresh()
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

  goToJobDetail(e) {
    const { id } = e.currentTarget.dataset
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
        data: { jobId: originalJob.id },
        hideLoading: true,
        success: res => {
          if (res.statusCode === 200 && res.data && res.data.code === 200) {
            wx.showToast({ title: '收藏成功', icon: 'success' })
            return
          }
          this.restoreCollect(jobIndex, originalJob)
        },
        fail: () => {
          this.restoreCollect(jobIndex, originalJob)
        }
      })
      return
    }

    app.request({
      url: 'userCollectJob',
      method: 'GET',
      data: { jobId: originalJob.id },
      hideLoading: true,
      success: res => {
        if (res.statusCode !== 200 || !res.data || res.data.code !== 200) {
          this.restoreCollect(jobIndex, originalJob)
          return
        }

        const targetRecord = extractList(res.data).find(item => String(item.jobId) === String(originalJob.id))
        if (!targetRecord || !targetRecord.id) {
          wx.showToast({ title: '已取消收藏', icon: 'success' })
          return
        }

        app.request({
          url: `userCollectJob/${targetRecord.id}`,
          method: 'DELETE',
          hideLoading: true,
          success: deleteRes => {
            if (deleteRes.statusCode === 200 && deleteRes.data && deleteRes.data.code === 200) {
              wx.showToast({ title: '已取消收藏', icon: 'success' })
              return
            }
            this.restoreCollect(jobIndex, originalJob)
          },
          fail: () => {
            this.restoreCollect(jobIndex, originalJob)
          }
        })
      },
      fail: () => {
        this.restoreCollect(jobIndex, originalJob)
      }
    })
  },

  restoreCollect(index, originalJob) {
    const jobList = this.data.jobList.slice()
    jobList[index] = originalJob
    this.setData({ jobList })
    wx.showToast({
      title: '操作失败，请稍后重试',
      icon: 'none'
    })
  }
})
