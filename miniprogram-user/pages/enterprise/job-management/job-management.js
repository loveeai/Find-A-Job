const app = getApp()
const { extractList, safeText } = require('../../../utils/normalizers')

function pad2(value) {
  return String(value).padStart(2, '0')
}

function isValidDate(date) {
  return date instanceof Date && !Number.isNaN(date.getTime())
}

function parseDateValue(value, useEndOfDay = false) {
  if (value === undefined || value === null || value === '') {
    return null
  }

  if (value instanceof Date) {
    return isValidDate(value) ? value : null
  }

  const numericValue = Number(value)
  if (Number.isFinite(numericValue) && numericValue > 0) {
    const timestamp = numericValue > 100000000000 ? numericValue : numericValue * 1000
    const date = new Date(timestamp)
    return isValidDate(date) ? date : null
  }

  const text = String(value).trim()
  if (!text) {
    return null
  }

  const match = text.match(
    /^(\d{4})[-/](\d{1,2})[-/](\d{1,2})(?:[ T](\d{1,2})(?::(\d{1,2}))?(?::(\d{1,2}))?)?/
  )
  if (match) {
    const year = Number(match[1])
    const month = Number(match[2]) - 1
    const day = Number(match[3])
    const hasTime = match[4] !== undefined
    const hours = hasTime ? Number(match[4] || 0) : (useEndOfDay ? 23 : 0)
    const minutes = hasTime ? Number(match[5] || 0) : (useEndOfDay ? 59 : 0)
    const seconds = hasTime ? Number(match[6] || 0) : (useEndOfDay ? 59 : 0)
    const date = new Date(year, month, day, hours, minutes, seconds)
    return isValidDate(date) ? date : null
  }

  const normalizedText = text.replace(/-/g, '/')
  const date = new Date(normalizedText)
  return isValidDate(date) ? date : null
}

function formatDateValue(value, includeTime = false, fallback = '未设置') {
  const date = parseDateValue(value, includeTime)
  if (!date) {
    return fallback
  }

  const year = date.getFullYear()
  const month = pad2(date.getMonth() + 1)
  const day = pad2(date.getDate())
  if (!includeTime) {
    return `${year}-${month}-${day}`
  }

  const hours = pad2(date.getHours())
  const minutes = pad2(date.getMinutes())
  return `${year}-${month}-${day} ${hours}:${minutes}`
}

function resolveProgress(startTime, endTime) {
  const now = new Date()
  const startDate = parseDateValue(startTime, false)
  const endDate = parseDateValue(endTime, true)

  if (startDate && now.getTime() < startDate.getTime()) {
    return {
      key: 'pending',
      text: '未开始'
    }
  }

  if (endDate && now.getTime() > endDate.getTime()) {
    return {
      key: 'ended',
      text: '已结束'
    }
  }

  return {
    key: 'active',
    text: '招聘中'
  }
}

function formatSalaryText(job) {
  const salaryText = safeText(job.salary, '')
  if (salaryText) {
    return salaryText
  }

  const salaryMin = Number(job.salaryMin || job.minSalary || 0)
  const salaryMax = Number(job.salaryMax || job.maxSalary || 0)
  if (salaryMin > 0 && salaryMax > 0) {
    return `${salaryMin}-${salaryMax}元/时`
  }
  if (salaryMin > 0) {
    return `${salaryMin}元/时起`
  }
  if (salaryMax > 0) {
    return `${salaryMax}元/时以内`
  }
  return '薪资面议'
}

function uniqueById(list) {
  const seen = new Set()
  return list.filter(item => {
    const id = String(item.id || '')
    if (!id || seen.has(id)) {
      return false
    }
    seen.add(id)
    return true
  })
}

Page({
  data: {
    jobList: [],
    pageNum: 1,
    pageSize: 10,
    hasMore: true,
    loading: false
  },

  onLoad() {
    this.reloadJobList()
  },

  onShow() {
    this.reloadJobList()
  },

  onPullDownRefresh() {
    this.reloadJobList()
  },

  onReachBottom() {
    if (!this.data.loading && this.data.hasMore) {
      this.getJobList(false)
    }
  },

  getEnterpriseId() {
    const globalUserInfo = app.globalData.userInfo || {}
    const storageUserInfo = wx.getStorageSync('userInfo') || {}
    return Number(
      globalUserInfo.companyId ||
      globalUserInfo.enterpriseId ||
      storageUserInfo.companyId ||
      storageUserInfo.enterpriseId ||
      0
    )
  },

  reloadJobList() {
    this.setData({
      pageNum: 1,
      hasMore: true,
      jobList: []
    })
    this.getJobList(true)
  },

  normalizeJobItem(job) {
    const progress = resolveProgress(job.startTime, job.endTime)
    return {
      id: safeText(job.id, ''),
      title: safeText(job.title || job.jobTitle || job.position, '未命名职位'),
      salaryText: formatSalaryText(job),
      location: safeText(job.location || job.city || job.workplace, '地点待完善'),
      publishTimeText: formatDateValue(job.createTime || job.publishTime || job.updatedAt, true, '未设置'),
      startTimeText: formatDateValue(job.startTime, false, '未设置'),
      endTimeText: formatDateValue(job.endTime, false, '未设置'),
      progressKey: progress.key,
      progressText: progress.text,
      description: safeText(job.description || job.jobDescription || job.detail, '暂无职位描述')
    }
  },

  getJobList(refresh = false) {
    if (this.data.loading || (!refresh && !this.data.hasMore)) {
      return
    }

    const enterpriseId = this.getEnterpriseId()
    if (!enterpriseId) {
      wx.stopPullDownRefresh()
      wx.showToast({
        title: '未获取到企业信息',
        icon: 'none'
      })
      return
    }

    const pageNum = refresh ? 1 : this.data.pageNum
    this.setData({ loading: true })

    app.request({
      url: 'job',
      method: 'GET',
      data: {
        pageNum,
        pageSize: this.data.pageSize,
        enterpriseId
      },
      loadingTitle: '加载招聘信息...',
      hideLoading: refresh,
      success: res => {
        if (res.statusCode !== 200 || !res.data || res.data.code !== 200) {
          wx.showToast({
            title: safeText(res.data && (res.data.msg || res.data.message), '获取招聘信息失败'),
            icon: 'none'
          })
          return
        }

        const rawList = extractList(res.data)
        const total = Number((res.data.data && res.data.data.total) || rawList.length || 0)
        const incomingList = rawList.map(item => this.normalizeJobItem(item))
        const nextJobList = refresh
          ? incomingList
          : uniqueById(this.data.jobList.concat(incomingList))

        this.setData({
          jobList: nextJobList,
          hasMore: total > 0 ? nextJobList.length < total : incomingList.length >= this.data.pageSize,
          pageNum: pageNum + 1
        })
      },
      fail: () => {
        wx.showToast({
          title: '网络请求失败',
          icon: 'none'
        })
      },
      complete: () => {
        this.setData({ loading: false })
        wx.stopPullDownRefresh()
      }
    })
  },

  goToJobDetail(e) {
    const jobId = e.currentTarget.dataset.id
    if (!jobId) {
      return
    }

    wx.navigateTo({
      url: `/pages/enterprise/job-publish/job-publish?id=${jobId}`
    })
  },

  deleteJob(e) {
    const id = e.currentTarget.dataset.id
    if (!id) {
      return
    }

    wx.showModal({
      title: '确认删除',
      content: '确定要删除这条招聘信息吗？',
      success: result => {
        if (!result.confirm) {
          return
        }

        app.request({
          url: `job/${id}`,
          method: 'DELETE',
          loadingTitle: '删除中...',
          success: res => {
            if (res.statusCode === 200 && res.data && res.data.code === 200) {
              wx.showToast({
                title: '删除成功',
                icon: 'success'
              })

              this.setData({
                jobList: this.data.jobList.filter(item => String(item.id) !== String(id))
              })
              return
            }

            wx.showToast({
              title: safeText(res.data && (res.data.msg || res.data.message), '删除失败'),
              icon: 'none'
            })
          },
          fail: () => {
            wx.showToast({
              title: '网络请求失败',
              icon: 'none'
            })
          }
        })
      }
    })
  }
})
