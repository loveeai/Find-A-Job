const app = getApp()
const {
  extractList,
  normalizeComment,
  normalizeJob,
  normalizeResume,
  safeText
} = require('../../utils/normalizers')

function uniqueById(list) {
  const seen = new Set()
  return list.filter(item => {
    const id = String(item.id || '').trim()
    if (!id || seen.has(id)) {
      return false
    }
    seen.add(id)
    return true
  })
}

Page({
  data: {
    jobId: '',
    jobInfo: null,
    commentList: [],
    commentContent: '',
    isLoadingComments: false,
    showComplaintModal: false,
    complaintReason: '',
    isSubmittingComplaint: false,
    showResumeSelect: false,
    resumeOptions: [],
    selectedResumeId: '',
    selectedResumeInfo: null,
    hasMultipleResumes: false,
    resumeFileOptions: [],
    selectedResumeFileId: '',
    selectedResumeFileInfo: null,
    hasMultipleResumeFiles: false,
    isLoadingResumeFiles: false
  },

  onLoad(options) {
    this.setData({
      jobId: options.id || ''
    })
    this.loadJobDetail()
    this.loadComments()
  },

  loadJobDetail() {
    app.request({
      url: `job/${this.data.jobId}`,
      method: 'GET',
      success: res => {
        if (res.statusCode !== 200 || !res.data || res.data.code !== 200 || !res.data.data) {
          wx.showToast({
            title: '职位详情加载失败',
            icon: 'none'
          })
          return
        }

        this.setData({
          jobInfo: normalizeJob(res.data.data, app.globalData.baseUrl)
        })
        this.syncCollectedState()
      },
      fail: () => {
        wx.showToast({
          title: '职位详情加载失败',
          icon: 'none'
        })
      }
    })
  },

  syncCollectedState() {
    const isLoggedIn = app.globalData.isLoggedIn || wx.getStorageSync('isLoggedIn')
    const roleId = Number(app.globalData.roleId || wx.getStorageSync('roleId') || 3)

    if (!isLoggedIn || roleId === 2 || !this.data.jobInfo) {
      return
    }

    app.request({
      url: 'userCollectJob',
      method: 'GET',
      data: { jobId: this.data.jobId },
      hideLoading: true,
      success: res => {
        if (res.statusCode !== 200 || !res.data || res.data.code !== 200) {
          return
        }

        const isCollected = extractList(res.data).some(item => String(item.jobId) === String(this.data.jobId))
        this.setData({
          jobInfo: {
            ...this.data.jobInfo,
            isCollected
          }
        })
      }
    })
  },

  loadComments() {
    this.setData({ isLoadingComments: true })

    app.request({
      url: 'comment',
      method: 'GET',
      hideLoading: true,
      data: {
        jobId: this.data.jobId,
        pageNum: 1,
        pageSize: 50
      },
      success: res => {
        if (res.statusCode === 200 && res.data && res.data.code === 200) {
          this.setData({
            commentList: extractList(res.data).map(item => normalizeComment(item, app.globalData.baseUrl))
          })
          return
        }

        this.setData({ commentList: [] })
      },
      fail: () => {
        this.setData({ commentList: [] })
      },
      complete: () => {
        this.setData({ isLoadingComments: false })
      }
    })
  },

  onCommentInput(e) {
    this.setData({
      commentContent: e.detail.value
    })
  },

  submitComment() {
    const isLoggedIn = app.globalData.isLoggedIn || wx.getStorageSync('isLoggedIn')
    const roleId = Number(app.globalData.roleId || wx.getStorageSync('roleId') || 3)
    const content = this.data.commentContent.trim()

    if (!isLoggedIn) {
      wx.showModal({
        title: '提示',
        content: '登录后才能评论，是否前往登录？',
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
        title: '企业用户无法评论职位',
        icon: 'none'
      })
      return
    }

    if (!content) {
      wx.showToast({
        title: '请输入评论内容',
        icon: 'none'
      })
      return
    }

    app.request({
      url: 'comment',
      method: 'POST',
      data: {
        jobId: Number(this.data.jobId),
        content
      },
      success: res => {
        if (res.statusCode === 200 && res.data && res.data.code === 200) {
          this.setData({ commentContent: '' })
          wx.showToast({
            title: '评论成功',
            icon: 'success'
          })
          this.loadComments()
          return
        }

        wx.showToast({
          title: safeText(res.data && res.data.msg, '评论失败'),
          icon: 'none'
        })
      },
      fail: () => {
        wx.showToast({
          title: '评论失败，请稍后重试',
          icon: 'none'
        })
      }
    })
  },

  openComplaintModal() {
    const isLoggedIn = app.globalData.isLoggedIn || wx.getStorageSync('isLoggedIn')
    const roleId = Number(app.globalData.roleId || wx.getStorageSync('roleId') || 3)

    if (!isLoggedIn) {
      wx.showModal({
        title: '提示',
        content: '登录后才能投诉职位，是否前往登录？',
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
        title: '企业用户无法投诉职位',
        icon: 'none'
      })
      return
    }

    this.setData({
      showComplaintModal: true,
      complaintReason: '',
      isSubmittingComplaint: false
    })
  },

  onComplaintReasonInput(e) {
    this.setData({
      complaintReason: e.detail.value
    })
  },

  cancelComplaint() {
    if (this.data.isSubmittingComplaint) {
      return
    }

    this.setData({
      showComplaintModal: false,
      complaintReason: ''
    })
  },

  submitComplaint() {
    if (this.data.isSubmittingComplaint) {
      return
    }

    const reason = safeText(this.data.complaintReason, '').trim()
    if (!reason) {
      wx.showToast({
        title: '请输入投诉原因',
        icon: 'none'
      })
      return
    }

    this.setData({ isSubmittingComplaint: true })

    app.request({
      url: 'complaint',
      method: 'POST',
      data: {
        jobId: Number(this.data.jobId),
        reason
      },
      loadingTitle: '提交中...',
      success: res => {
        if (res.statusCode === 200 && res.data && res.data.code === 200) {
          this.setData({
            showComplaintModal: false,
            complaintReason: ''
          })
          wx.showToast({
            title: '投诉已提交',
            icon: 'success'
          })
          return
        }

        wx.showToast({
          title: safeText(res.data && res.data.msg, '投诉失败'),
          icon: 'none'
        })
      },
      fail: () => {
        wx.showToast({
          title: '投诉失败，请稍后重试',
          icon: 'none'
        })
      },
      complete: () => {
        this.setData({ isSubmittingComplaint: false })
      }
    })
  },

  goToCompanyDetail() {
    const enterpriseId = this.data.jobInfo && this.data.jobInfo.enterpriseId
    if (!enterpriseId) {
      wx.showToast({
        title: '暂无企业详情',
        icon: 'none'
      })
      return
    }

    wx.navigateTo({
      url: `/pages/company-detail/company-detail?id=${enterpriseId}`
    })
  },

  collectJob() {
    const jobInfo = this.data.jobInfo
    if (!jobInfo) {
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

    const originalState = Boolean(jobInfo.isCollected)
    this.setData({
      jobInfo: {
        ...jobInfo,
        isCollected: !originalState
      }
    })

    if (!originalState) {
      app.request({
        url: 'userCollectJob',
        method: 'POST',
        data: { jobId: jobInfo.id },
        hideLoading: true,
        success: res => {
          if (res.statusCode === 200 && res.data && res.data.code === 200) {
            wx.showToast({
              title: '收藏成功',
              icon: 'success'
            })
            return
          }
          this.restoreCollectState(originalState)
        },
        fail: () => {
          this.restoreCollectState(originalState)
        }
      })
      return
    }

    app.request({
      url: 'userCollectJob',
      method: 'GET',
      data: { jobId: jobInfo.id },
      hideLoading: true,
      success: res => {
        if (res.statusCode !== 200 || !res.data || res.data.code !== 200) {
          this.restoreCollectState(originalState)
          return
        }

        const targetRecord = extractList(res.data).find(item => String(item.jobId) === String(jobInfo.id))
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
            this.restoreCollectState(originalState)
          },
          fail: () => {
            this.restoreCollectState(originalState)
          }
        })
      },
      fail: () => {
        this.restoreCollectState(originalState)
      }
    })
  },

  restoreCollectState(originalState) {
    if (!this.data.jobInfo) {
      return
    }

    this.setData({
      jobInfo: {
        ...this.data.jobInfo,
        isCollected: originalState
      }
    })

    wx.showToast({
      title: '操作失败，请稍后重试',
      icon: 'none'
    })
  },

  applyJob() {
    const isLoggedIn = app.globalData.isLoggedIn || wx.getStorageSync('isLoggedIn')
    const roleId = Number(app.globalData.roleId || wx.getStorageSync('roleId') || 3)
    const { jobInfo } = this.data

    if (!isLoggedIn) {
      wx.showModal({
        title: '提示',
        content: '登录后才能投递简历，是否前往登录？',
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
        title: '企业用户无法投递简历',
        icon: 'none'
      })
      return
    }

    if (jobInfo && jobInfo.isExpired) {
      wx.showToast({
        title: '该职位已结束招聘',
        icon: 'none'
      })
      return
    }

    app.request({
      url: 'resume',
      method: 'GET',
      success: res => {
        if (res.statusCode !== 200 || !res.data || res.data.code !== 200) {
          wx.showToast({
            title: '简历加载失败',
            icon: 'none'
          })
          return
        }

        const resumeOptions = uniqueById(
          extractList(res.data).map(item => {
            const resume = normalizeResume(item, app.globalData.baseUrl)
            return {
              id: String(resume.id),
              title: resume.title,
              subtitle: resume.expectedPositionName
            }
          })
        )

        if (!resumeOptions.length) {
          wx.showModal({
            title: '还没有简历',
            content: '请先完善简历并上传附件后，再投递当前职位。',
            success: result => {
              if (result.confirm) {
                wx.navigateTo({ url: '/pages/resume-edit/resume-edit' })
              }
            }
          })
          return
        }

        const selectedResumeInfo = resumeOptions[0]
        this.setData({
          showResumeSelect: true,
          resumeOptions,
          selectedResumeId: selectedResumeInfo.id,
          selectedResumeInfo,
          hasMultipleResumes: resumeOptions.length > 1,
          resumeFileOptions: [],
          selectedResumeFileId: '',
          selectedResumeFileInfo: null,
          hasMultipleResumeFiles: false
        })
        this.loadResumeFilesForApply(selectedResumeInfo.id)
      },
      fail: () => {
        wx.showToast({
          title: '简历加载失败',
          icon: 'none'
        })
      }
    })
  },

  loadResumeFilesForApply(resumeId) {
    if (!resumeId) {
      this.setData({
        resumeFileOptions: [],
        selectedResumeFileId: '',
        selectedResumeFileInfo: null,
        hasMultipleResumeFiles: false,
        isLoadingResumeFiles: false
      })
      return
    }

    this.setData({
      isLoadingResumeFiles: true,
      resumeFileOptions: [],
      selectedResumeFileId: '',
      selectedResumeFileInfo: null,
      hasMultipleResumeFiles: false
    })

    app.request({
      url: 'resumeFile',
      method: 'GET',
      hideLoading: true,
      data: { resumeId },
      success: res => {
        if (res.statusCode !== 200 || !res.data || res.data.code !== 200) {
          this.setData({
            resumeFileOptions: [],
            selectedResumeFileId: '',
            selectedResumeFileInfo: null,
            hasMultipleResumeFiles: false,
            isLoadingResumeFiles: false
          })
          return
        }

        const resumeFileOptions = uniqueById(
          extractList(res.data).map(file => ({
            id: String(file.id),
            fileName: safeText(file.fileName, '简历附件'),
            formattedSize: this.formatFileSize(file.fileSize || 0)
          }))
        )

        const selectedResumeFileInfo = resumeFileOptions.length ? resumeFileOptions[0] : null

        this.setData({
          resumeFileOptions,
          selectedResumeFileId: selectedResumeFileInfo ? selectedResumeFileInfo.id : '',
          selectedResumeFileInfo,
          hasMultipleResumeFiles: resumeFileOptions.length > 1,
          isLoadingResumeFiles: false
        })
      },
      fail: () => {
        this.setData({
          resumeFileOptions: [],
          selectedResumeFileId: '',
          selectedResumeFileInfo: null,
          hasMultipleResumeFiles: false,
          isLoadingResumeFiles: false
        })
      }
    })
  },

  formatFileSize(size) {
    const fileSize = Number(size) || 0
    if (fileSize < 1024) {
      return `${fileSize} B`
    }
    if (fileSize < 1024 * 1024) {
      return `${(fileSize / 1024).toFixed(1)} KB`
    }
    return `${(fileSize / 1024 / 1024).toFixed(1)} MB`
  },

  onResumeChange(e) {
    const selectedResumeId = String(e.detail.value || '')
    const selectedResumeInfo = this.data.resumeOptions.find(item => item.id === selectedResumeId) || null
    this.setData({
      selectedResumeId,
      selectedResumeInfo
    })
    this.loadResumeFilesForApply(selectedResumeId)
  },

  onResumeFileChange(e) {
    const selectedResumeFileId = String(e.detail.value || '')
    const selectedResumeFileInfo = this.data.resumeFileOptions.find(item => item.id === selectedResumeFileId) || null
    this.setData({
      selectedResumeFileId,
      selectedResumeFileInfo
    })
  },

  cancelResumeSelect() {
    this.setData({
      showResumeSelect: false,
      resumeOptions: [],
      selectedResumeId: '',
      selectedResumeInfo: null,
      hasMultipleResumes: false,
      resumeFileOptions: [],
      selectedResumeFileId: '',
      selectedResumeFileInfo: null,
      hasMultipleResumeFiles: false,
      isLoadingResumeFiles: false
    })
  },

  goToResumePage() {
    this.cancelResumeSelect()
    wx.navigateTo({
      url: '/pages/resume/resume'
    })
  },

  confirmResumeSelect() {
    if (!this.data.selectedResumeId) {
      wx.showToast({
        title: '请选择要投递的简历',
        icon: 'none'
      })
      return
    }

    if (!this.data.selectedResumeFileId) {
      wx.showToast({
        title: '请选择要投递的附件',
        icon: 'none'
      })
      return
    }

    this.setData({ showResumeSelect: false })
    this.submitApplication({
      resumeId: Number(this.data.selectedResumeId),
      resumeFileId: Number(this.data.selectedResumeFileId)
    })
  },

  getApplicationErrorMessage(message) {
    const text = safeText(message, '')
    if (!text) {
      return '投递失败，请稍后重试'
    }

    if (text.indexOf('resume_file_id') !== -1 || text.indexOf('Database upgrade failed') !== -1) {
      return '数据库尚未升级，请重启后端或执行 application 表升级脚本后重试'
    }

    return text
  },

  submitApplication(payload) {
    app.request({
      url: 'application',
      method: 'POST',
      data: {
        jobId: Number(this.data.jobId),
        resumeId: payload.resumeId,
        resumeFileId: payload.resumeFileId
      },
      loadingTitle: '投递中...',
      success: res => {
        if (res.statusCode === 200 && res.data && res.data.code === 200) {
          wx.showModal({
            title: '投递成功',
            content: '本次投递的简历附件已提交给企业，请耐心等待处理结果。',
            showCancel: false
          })
          return
        }

        wx.showToast({
          title: this.getApplicationErrorMessage(res.data && res.data.msg),
          icon: 'none'
        })
      },
      fail: () => {
        wx.showToast({
          title: '投递失败，请稍后重试',
          icon: 'none'
        })
      }
    })
  }
})
