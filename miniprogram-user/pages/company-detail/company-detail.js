const app = getApp()
const {
  extractList,
  normalizeEnterprise,
  normalizeJob
} = require('../../utils/normalizers')

Page({
  data: {
    companyId: '',
    companyInfo: null,
    jobList: [],
    isLoading: true
  },

  onLoad(options) {
    const companyId = options.id
    this.setData({ companyId })
    this.loadCompanyDetail()
    this.loadCompanyJobs()
  },

  loadCompanyDetail() {
    app.request({
      url: `enterprise/${this.data.companyId}`,
      method: 'GET',
      success: res => {
        if (res.statusCode !== 200 || !res.data || res.data.code !== 200 || !res.data.data) {
          wx.showToast({
            title: '企业详情加载失败',
            icon: 'none'
          })
          return
        }

        this.setData({
          companyInfo: normalizeEnterprise(res.data.data, app.globalData.baseUrl)
        })
      },
      fail: () => {
        wx.showToast({
          title: '企业详情加载失败',
          icon: 'none'
        })
      },
      complete: () => {
        this.setData({ isLoading: false })
      }
    })
  },

  loadCompanyJobs() {
    app.request({
      url: 'job',
      method: 'GET',
      hideLoading: true,
      data: {
        pageNum: 1,
        pageSize: 10,
        status: 1,
        activeOnly: true,
        enterpriseId: this.data.companyId
      },
      success: res => {
        if (res.statusCode === 200 && res.data && res.data.code === 200) {
          this.setData({
            jobList: extractList(res.data).map(item => normalizeJob(item, app.globalData.baseUrl))
          })
        }
      }
    })
  },

  goToJobDetail(e) {
    const { id } = e.currentTarget.dataset
    wx.navigateTo({
      url: `/pages/job-detail/job-detail?id=${id}`
    })
  }
})
