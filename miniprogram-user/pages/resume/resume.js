const app = getApp()
const { extractList, normalizeResume, safeText } = require('../../utils/normalizers')

Page({
  data: {
    resume: null,
    resumeFiles: [],
    isLoading: true,
    showUploadDialog: false,
    pendingUploadFile: null,
    uploadDisplayName: ''
  },

  onLoad() {
    this.checkUserRole()
    this.loadResumeDetail()
  },

  onShow() {
    this.checkUserRole()
    this.loadResumeDetail()

    if (typeof this.getTabBar === 'function' && this.getTabBar()) {
      this.getTabBar().setData({ selected: 2 })
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

  loadResumeDetail() {
    this.setData({ isLoading: true })

    app.request({
      url: 'resume',
      method: 'GET',
      success: res => {
        if (res.statusCode !== 200 || !res.data || res.data.code !== 200) {
          this.setData({
            resume: null,
            resumeFiles: []
          })
          return
        }

        const resumes = extractList(res.data)
        if (!resumes.length) {
          this.setData({
            resume: null,
            resumeFiles: []
          })
          return
        }

        const resume = normalizeResume(resumes[0], app.globalData.baseUrl)
        this.setData({ resume })
        this.loadResumeFiles(resume.id)
      },
      fail: () => {
        this.setData({
          resume: null,
          resumeFiles: []
        })
      },
      complete: () => {
        this.setData({ isLoading: false })
      }
    })
  },

  loadResumeFiles(resumeId) {
    app.request({
      url: 'resumeFile',
      method: 'GET',
      hideLoading: true,
      data: { resumeId },
      success: res => {
        if (res.statusCode !== 200 || !res.data || res.data.code !== 200) {
          this.setData({ resumeFiles: [] })
          return
        }

        const resumeFiles = extractList(res.data).map(file => {
          const filePath = safeText(file.filePath, '')
          const fileName = safeText(file.fileName, filePath.split(/[\\/]/).pop() || '简历附件')
          return {
            ...file,
            fileName,
            formattedSize: this.formatFileSize(file.fileSize || 0)
          }
        })

        this.setData({ resumeFiles })
      },
      fail: () => {
        this.setData({ resumeFiles: [] })
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

  createResume() {
    wx.navigateTo({
      url: '/pages/resume-edit/resume-edit'
    })
  },

  editResume() {
    wx.navigateTo({
      url: '/pages/resume-edit/resume-edit'
    })
  },

  uploadResumeFile() {
    if (!this.data.resume) {
      wx.showToast({
        title: '请先创建简历',
        icon: 'none'
      })
      return
    }

    wx.chooseMessageFile({
      count: 1,
      type: 'file',
      extension: ['pdf', 'doc', 'docx'],
      success: chooseRes => {
        const tempFile = chooseRes.tempFiles && chooseRes.tempFiles[0]
        if (!tempFile) {
          return
        }

        const originalName = safeText(tempFile.name, tempFile.path.split(/[\\/]/).pop() || 'resume-file')
        this.setData({
          showUploadDialog: true,
          pendingUploadFile: tempFile,
          uploadDisplayName: this.getDefaultDisplayName(originalName)
        })
      }
    })
  },

  getDefaultDisplayName(fileName) {
    const name = safeText(fileName, '')
    const dotIndex = name.lastIndexOf('.')
    return dotIndex > 0 ? name.slice(0, dotIndex) : name
  },

  onUploadNameInput(e) {
    this.setData({
      uploadDisplayName: e.detail.value
    })
  },

  closeUploadDialog() {
    this.setData({
      showUploadDialog: false,
      pendingUploadFile: null,
      uploadDisplayName: ''
    })
  },

  getUploadErrorMessage(message) {
    const text = safeText(message, '')
    if (!text) {
      return '上传失败，请稍后重试'
    }

    const lowerText = text.toLowerCase()
    if (
      lowerText.includes('exception') ||
      lowerText.includes('sql') ||
      lowerText.includes('truncate') ||
      lowerText.includes('insert into') ||
      text.length > 60
    ) {
      return '上传失败，请稍后重试'
    }

    return text
  },

  confirmUploadResumeFile() {
    if (!this.data.resume || !this.data.pendingUploadFile) {
      this.closeUploadDialog()
      return
    }

    const fileName = safeText(this.data.pendingUploadFile.name, '')
    const displayName = safeText(this.data.uploadDisplayName, this.getDefaultDisplayName(fileName))

    wx.showLoading({
      title: '上传中...'
    })

    wx.uploadFile({
      url: `${app.globalData.baseUrl}resumeFile/upload`,
      filePath: this.data.pendingUploadFile.path,
      name: 'file',
      formData: {
        resumeId: this.data.resume.id,
        displayName
      },
      header: {
        token: app.globalData.token || wx.getStorageSync('token')
      },
      success: uploadRes => {
        let data = {}
        try {
          data = JSON.parse(uploadRes.data)
        } catch (error) {
          data = {}
        }

        if (uploadRes.statusCode === 200 && data.code === 200) {
          wx.showToast({
            title: '上传成功',
            icon: 'success'
          })
          this.closeUploadDialog()
          this.loadResumeFiles(this.data.resume.id)
          return
        }

        wx.showToast({
          title: this.getUploadErrorMessage(data.msg),
          icon: 'none'
        })
      },
      fail: () => {
        wx.showToast({
          title: '上传失败，请稍后重试',
          icon: 'none'
        })
      },
      complete: () => {
        wx.hideLoading()
      }
    })
  },

  deleteResumeFile(e) {
    const { id } = e.currentTarget.dataset
    if (!id) {
      return
    }

    wx.showModal({
      title: '删除附件',
      content: '删除后将无法恢复，是否继续？',
      success: result => {
        if (!result.confirm) {
          return
        }

        app.request({
          url: `resumeFile/${id}`,
          method: 'DELETE',
          loadingTitle: '删除中...',
          success: res => {
            if (res.statusCode === 200 && res.data && res.data.code === 200) {
              wx.showToast({
                title: '已删除',
                icon: 'success'
              })
              if (this.data.resume) {
                this.loadResumeFiles(this.data.resume.id)
              }
              return
            }

            wx.showToast({
              title: safeText(res.data && res.data.msg, '删除失败'),
              icon: 'none'
            })
          },
          fail: () => {
            wx.showToast({
              title: '删除失败，请稍后重试',
              icon: 'none'
            })
          }
        })
      }
    })
  },

  downloadFile(e) {
    const { file } = e.currentTarget.dataset
    if (!file || !file.id) {
      return
    }

    wx.showLoading({
      title: '下载中...'
    })

    wx.downloadFile({
      url: `${app.globalData.baseUrl}resumeFile/download/${file.id}`,
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
  }
})
