const app = getApp()
const { extractList, formatDate, safeText } = require('../../utils/normalizers')

const STATUS_MAP = {
  0: { text: '待处理', className: 'status-pending' },
  1: { text: '面试邀请', className: 'status-interview' },
  2: { text: '不合适', className: 'status-rejected' },
  3: { text: '已录用', className: 'status-hired' },
  4: { text: '已拒绝', className: 'status-rejected' }
}

function normalizeApplication(item) {
  const status = Number(item.status || 0)
  const statusMeta = STATUS_MAP[status] || { text: '处理中', className: 'status-default' }

  return {
    id: item.id,
    jobId: item.jobId,
    jobTitle: safeText(item.jobTitle, '职位信息待完善'),
    company: safeText(item.company, '企业信息待完善'),
    salary: safeText(item.salary, '薪资面议'),
    location: safeText(item.location, '地点待更新'),
    status,
    statusText: statusMeta.text,
    statusClass: statusMeta.className,
    appliedAt: formatDate(item.createTime) || '暂无记录',
    updatedAt: formatDate(item.updateTime) || '暂无记录',
    interviewTime: safeText(item.interviewTime, ''),
    interviewAddress: safeText(item.interviewAddress, ''),
    canViewJob: Boolean(item.jobId)
  }
}

Page({
  data: {
    applications: [],
    isLoading: true,
    isEmpty: false
  },

  onLoad() {
    this.loadApplications()
  },

  onShow() {
    this.loadApplications()
  },

  loadApplications() {
    if (!app.globalData.isLoggedIn) {
      wx.redirectTo({
        url: '/pages/login/login'
      })
      return
    }

    this.setData({
      isLoading: true
    })

    app.request({
      url: 'application',
      method: 'GET',
      hideLoading: true,
      success: res => {
        if (res.statusCode === 200 && res.data && res.data.code === 200) {
          const applications = extractList(res.data).map(normalizeApplication)

          this.setData({
            applications,
            isEmpty: applications.length === 0
          })
          return
        }

        wx.showToast({
          title: '获取投递记录失败',
          icon: 'none'
        })
        this.setData({
          applications: [],
          isEmpty: true
        })
      },
      fail: () => {
        wx.showToast({
          title: '网络请求失败',
          icon: 'none'
        })
        this.setData({
          applications: [],
          isEmpty: true
        })
      },
      complete: () => {
        this.setData({
          isLoading: false
        })
      }
    })
  },

  goToJobDetail(e) {
    const jobId = e.currentTarget.dataset.jobId
    if (!jobId) {
      wx.showToast({
        title: '该职位已下线',
        icon: 'none'
      })
      return
    }

    wx.navigateTo({
      url: `/pages/job-detail/job-detail?id=${jobId}`
    })
  }
})
