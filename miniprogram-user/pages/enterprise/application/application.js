const app = getApp()
const { extractList, firstValid, normalizeImageUrl, normalizeResume, safeText } = require('../../../utils/normalizers')

const STATUS_META = {
  0: { text: '待处理', tone: 'pending' },
  1: { text: '待面试', tone: 'interview' },
  2: { text: '不合适', tone: 'reject' },
  3: { text: '已录用', tone: 'hired' },
  4: { text: '已拒绝', tone: 'reject' }
}

function formatDateTime(value) {
  if (!value) {
    return ''
  }

  const date = value instanceof Date ? value : new Date(value)
  if (Number.isNaN(date.getTime())) {
    return safeText(value, '')
  }

  const pad = number => String(number).padStart(2, '0')
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} ${pad(date.getHours())}:${pad(date.getMinutes())}`
}

function normalizeApplication(item, baseUrl) {
  const status = Number(firstValid(item.status, 0))
  const statusMeta = STATUS_META[status] || { text: '处理中', tone: 'default' }

  return {
    id: item.id,
    jobId: item.jobId,
    resumeId: item.resumeId,
    resumeFileId: item.resumeFileId,
    resumeFileName: safeText(item.resumeFileName, '未选择附件'),
    userId: item.userId,
    jobTitle: safeText(item.jobTitle, '职位信息待完善'),
    companyName: safeText(firstValid(item.companyName, item.company), '企业信息待完善'),
    salary: safeText(item.salary, '薪资面议'),
    location: safeText(item.location, '地点待更新'),
    status,
    statusText: statusMeta.text,
    statusTone: statusMeta.tone,
    createdAt: formatDateTime(item.createTime) || '暂无记录',
    interviewTime: formatDateTime(item.interviewTime),
    interviewAddress: safeText(item.interviewAddress, ''),
    companyLogo: normalizeImageUrl(item.companyLogo, baseUrl, '/images/company-default.png'),
    expanded: false,
    resume: null
  }
}

function normalizeResumeDetail(resume) {
  if (!resume) {
    return null
  }

  const normalized = normalizeResume(resume, app.globalData.baseUrl)
  return {
    ...normalized,
    genderText: normalized.gender === 1 ? '男' : normalized.gender === 2 ? '女' : '未知'
  }
}

Page({
  data: {
    applicationList: [],
    loading: false,
    showInterviewForm: false,
    showDatetimePicker: false,
    datetimePickerValue: Date.now(),
    minDate: Date.now(),
    maxDate: new Date(new Date().setFullYear(new Date().getFullYear() + 1)).getTime(),
    interviewForm: {
      applicationId: '',
      interviewTime: '',
      interviewAddress: ''
    }
  },

  onLoad() {
    this.getApplicationList()
  },

  onShow() {
    this.getApplicationList()
  },

  async getApplicationList() {
    this.setData({ loading: true })

    app.request({
      url: 'application',
      method: 'GET',
      hideLoading: true,
      success: async res => {
        if (res.statusCode === 200 && res.data && res.data.code === 200) {
          const applicationList = extractList(res.data).map(item => normalizeApplication(item, app.globalData.baseUrl))
          const completedList = await this.loadResumeDetails(applicationList)

          this.setData({
            applicationList: completedList,
            loading: false
          })
          return
        }

        wx.showToast({
          title: '获取投递记录失败',
          icon: 'none'
        })
        this.setData({
          applicationList: [],
          loading: false
        })
      },
      fail: () => {
        wx.showToast({
          title: '获取投递记录失败',
          icon: 'none'
        })
        this.setData({
          applicationList: [],
          loading: false
        })
      }
    })
  },

  loadResumeDetails(applicationList) {
    const tasks = applicationList.map(item => this.fetchResumeDetail(item.resumeId))

    return Promise.all(tasks).then(resumeList => applicationList.map((item, index) => ({
      ...item,
      resume: resumeList[index]
    })))
  },

  fetchResumeDetail(resumeId) {
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
            resolve(normalizeResumeDetail(res.data.data))
            return
          }

          resolve(null)
        },
        fail: () => resolve(null)
      })
    })
  },

  toggleExpand(e) {
    const { id } = e.currentTarget.dataset
    const applicationList = this.data.applicationList.map(item => {
      if (String(item.id) !== String(id)) {
        return item
      }

      return {
        ...item,
        expanded: !item.expanded
      }
    })

    this.setData({ applicationList })
  },

  goToResumeDetail(e) {
    const resumeId = e.currentTarget.dataset.id
    if (!resumeId) {
      wx.showToast({
        title: '简历不存在',
        icon: 'none'
      })
      return
    }

    wx.navigateTo({
      url: `/pages/enterprise/resume-detail/resume-detail?id=${resumeId}`
    })
  },

  downloadResumeFile(e) {
    const fileId = e.currentTarget.dataset.fileId
    if (!fileId) {
      wx.showToast({
        title: '暂无可下载附件',
        icon: 'none'
      })
      return
    }

    wx.showLoading({
      title: '下载中...'
    })

    wx.downloadFile({
      url: `${app.globalData.baseUrl}resumeFile/download/${fileId}`,
      header: {
        token: app.globalData.token || wx.getStorageSync('token')
      },
      success: res => {
        if (res.statusCode === 200) {
          wx.openDocument({
            filePath: res.tempFilePath,
            showMenu: true
          })
          return
        }

        wx.showToast({
          title: '下载失败',
          icon: 'none'
        })
      },
      fail: () => {
        wx.showToast({
          title: '下载失败，请稍后重试',
          icon: 'none'
        })
      },
      complete: () => {
        wx.hideLoading()
      }
    })
  },

  startChat(e) {
    const userId = e.currentTarget.dataset.userId
    const userName = safeText(e.currentTarget.dataset.userName, '候选人')
    const userAvatar = safeText(e.currentTarget.dataset.userAvatar, '')

    if (!userId) {
      wx.showToast({
        title: '求职者信息不完整',
        icon: 'none'
      })
      return
    }

    wx.navigateTo({
      url: `/pages/chat/chat?userId=${userId}&userName=${encodeURIComponent(userName)}&userAvatar=${encodeURIComponent(userAvatar)}`
    })
  },

  updateApplicationStatus(e) {
    const id = e.currentTarget.dataset.id
    const status = Number(e.currentTarget.dataset.status)

    if (!id) {
      return
    }

    if (status === 1) {
      this.showInterviewForm(id)
      return
    }

    const actionText = status === 2 ? '标记为不合适' : '标记为已录用'
    wx.showModal({
      title: '确认操作',
      content: `确定要${actionText}吗？`,
      success: res => {
        if (!res.confirm) {
          return
        }

        this.requestStatusUpdate({
          id,
          status
        }, status === 2 ? '已标记不合适' : '已标记录用')
      }
    })
  },

  requestStatusUpdate(payload, successTitle, onSuccess) {
    app.request({
      url: 'application',
      method: 'PUT',
      data: payload,
      loadingTitle: '处理中...',
      success: res => {
        if (res.statusCode === 200 && res.data && res.data.code === 200) {
          if (typeof onSuccess === 'function') {
            onSuccess()
          }

          wx.showToast({
            title: successTitle,
            icon: 'success'
          })
          this.getApplicationList()
          return
        }

        wx.showToast({
          title: safeText(firstValid(res.data && res.data.msg, res.data && res.data.message), '操作失败'),
          icon: 'none'
        })
      },
      fail: () => {
        wx.showToast({
          title: '操作失败，请稍后重试',
          icon: 'none'
        })
      }
    })
  },

  showInterviewForm(applicationId) {
    const now = Date.now()
    this.setData({
      showInterviewForm: true,
      datetimePickerValue: now,
      minDate: now,
      interviewForm: {
        applicationId,
        interviewTime: '',
        interviewAddress: ''
      }
    })
  },

  closeInterviewForm() {
    this.setData({
      showInterviewForm: false
    })
  },

  showDatetimePicker() {
    const now = Date.now()
    this.setData({
      minDate: now,
      datetimePickerValue: Math.max(now, this.data.datetimePickerValue),
      showDatetimePicker: true
    })
  },

  closeDatetimePicker() {
    this.setData({
      showDatetimePicker: false
    })
  },

  onDatetimeConfirm(e) {
    const rawValue = firstValid(e.detail && e.detail.value, e.detail)
    const selectedDate = rawValue instanceof Date ? rawValue : new Date(rawValue)

    if (Number.isNaN(selectedDate.getTime())) {
      this.closeDatetimePicker()
      return
    }

    const pad = number => String(number).padStart(2, '0')
    const interviewTime = `${selectedDate.getFullYear()}-${pad(selectedDate.getMonth() + 1)}-${pad(selectedDate.getDate())} ${pad(selectedDate.getHours())}:${pad(selectedDate.getMinutes())}`

    this.setData({
      'interviewForm.interviewTime': interviewTime,
      datetimePickerValue: selectedDate.getTime(),
      showDatetimePicker: false
    })
  },

  onInterviewLocationChange(e) {
    this.setData({
      'interviewForm.interviewAddress': e.detail.value
    })
  },

  submitInterviewForm() {
    const { applicationId, interviewTime, interviewAddress } = this.data.interviewForm

    if (!interviewTime) {
      wx.showToast({
        title: '请选择面试时间',
        icon: 'none'
      })
      return
    }

    if (!safeText(interviewAddress, '')) {
      wx.showToast({
        title: '请输入面试地点',
        icon: 'none'
      })
      return
    }

    const interviewTimestamp = new Date(interviewTime.replace(/-/g, '/')).getTime()
    if (!Number.isFinite(interviewTimestamp)) {
      wx.showToast({
        title: '面试时间格式不正确',
        icon: 'none'
      })
      return
    }

    this.requestStatusUpdate({
      id: applicationId,
      status: 1,
      interviewTime: interviewTimestamp,
      interviewAddress: safeText(interviewAddress, '')
    }, '面试邀请已发送', () => {
      this.closeInterviewForm()
    })
  }
})
