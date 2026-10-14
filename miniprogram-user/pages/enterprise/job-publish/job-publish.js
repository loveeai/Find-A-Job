const app = getApp()
const { firstValid, safeText } = require('../../../utils/normalizers')

function normalizeMessage(payload, fallback) {
  return safeText(firstValid(payload && payload.msg, payload && payload.message), fallback)
}

Page({
  data: {
    jobId: '',
    loading: false,
    canPublish: true,
    blockReason: '',
    enterpriseStatus: null,
    job: {
      title: '',
      categoryId: '',
      industry: '',
      salaryMin: '',
      salaryMax: '',
      location: '',
      jobType: '',
      description: '',
      welfare: '',
      startTime: '',
      endTime: '',
      nums: '',
      status: 2
    },
    categories: [],
    firstLevelCategories: [],
    secondLevelCategories: [],
    selectedFirstLevelIndex: 0,
    selectedSecondLevelIndex: 0,
    selectedFirstLevel: '',
    selectedSecondLevel: '',
    selectedFirstLevelName: '请选择一级分类',
    selectedSecondLevelName: '请选择二级分类',
    showSecondLevel: false
  },

  onLoad(options) {
    const jobId = safeText(options.id, '')
    this.setData({ jobId })
    this.getJobCategories()
    this.loadEnterpriseAccessStatus()

    if (jobId) {
      this.getJobDetail(jobId)
    }
  },

  onShow() {
    this.loadEnterpriseAccessStatus(true)
  },

  getCurrentUserInfo() {
    return app.globalData.userInfo || wx.getStorageSync('userInfo') || {}
  },

  syncCurrentUserInfo(userInfo) {
    const mergedUserInfo = {
      ...this.getCurrentUserInfo(),
      ...(userInfo || {})
    }

    app.globalData.userInfo = mergedUserInfo
    app.globalData.roleId = Number(firstValid(mergedUserInfo.roleId, app.globalData.roleId, 3))
    wx.setStorageSync('userInfo', mergedUserInfo)
    wx.setStorageSync('roleId', app.globalData.roleId)
  },

  getCurrentUserId(userInfo = this.getCurrentUserInfo()) {
    return firstValid(userInfo.userId, userInfo.id)
  },

  getCurrentCompanyId(userInfo = this.getCurrentUserInfo()) {
    return firstValid(userInfo.companyId, userInfo.company && userInfo.company.id)
  },

  getAuditBlockReason(userInfo = this.getCurrentUserInfo()) {
    const auditStatus = Number(firstValid(userInfo.auditStatus, 1))
    if (auditStatus === 0) {
      return '企业账号待管理员审核，暂时无法发布职位'
    }
    if (auditStatus === 2) {
      return '企业账号审核未通过，暂时无法发布职位'
    }
    return ''
  },

  isAuthFailureMessage(message) {
    const text = safeText(message, '')
    return text.indexOf('登录') !== -1
      || text.indexOf('凭证') !== -1
      || text.indexOf('token') !== -1
      || text.indexOf('Token') !== -1
      || text.indexOf('请先登录') !== -1
  },

  handleAuthFailure(message) {
    wx.showToast({
      title: safeText(message, '登录状态已失效，请重新登录'),
      icon: 'none'
    })

    setTimeout(() => {
      app.clearLoginState()
      app.redirectToLogin()
    }, 800)
  },

  updatePublishAvailability(allowed, reason) {
    this.setData({
      canPublish: allowed,
      blockReason: allowed ? '' : safeText(reason, '')
    })
  },

  loadEnterpriseAccessStatus(silent = false) {
    const userId = this.getCurrentUserId()
    if (!userId) {
      const message = '未获取到企业信息，请重新登录'
      this.updatePublishAvailability(false, message)
      if (!silent) {
        this.handleAuthFailure(message)
      }
      return Promise.resolve(false)
    }

    return new Promise(resolve => {
      app.request({
        url: `sysUser/${userId}`,
        method: 'GET',
        hideLoading: true,
        success: userRes => {
          if (userRes.statusCode !== 200 || !userRes.data || userRes.data.code !== 200 || !userRes.data.data) {
            const message = normalizeMessage(userRes.data, '用户状态加载失败，请稍后重试')
            if (this.isAuthFailureMessage(message)) {
              this.updatePublishAvailability(false, message)
              if (!silent) {
                this.handleAuthFailure(message)
              }
              resolve(false)
              return
            }

            this.updatePublishAvailability(false, message)
            if (!silent) {
              wx.showToast({
                title: message,
                icon: 'none'
              })
            }
            resolve(false)
            return
          }

          const latestUserInfo = userRes.data.data || {}
          this.syncCurrentUserInfo(latestUserInfo)

          if (Number(firstValid(latestUserInfo.roleId, 0)) !== 2) {
            const message = '仅企业用户可发布职位'
            this.updatePublishAvailability(false, message)
            if (!silent) {
              wx.showToast({
                title: message,
                icon: 'none'
              })
            }
            resolve(false)
            return
          }

          const auditBlockReason = this.getAuditBlockReason(latestUserInfo)
          if (auditBlockReason) {
            this.updatePublishAvailability(false, auditBlockReason)
            if (!silent) {
              wx.showToast({
                title: auditBlockReason,
                icon: 'none'
              })
            }
            resolve(false)
            return
          }

          const companyId = this.getCurrentCompanyId(latestUserInfo)
          if (!companyId) {
            const message = '未获取到企业信息，请重新登录'
            this.updatePublishAvailability(false, message)
            if (!silent) {
              this.handleAuthFailure(message)
            }
            resolve(false)
            return
          }

          app.request({
            url: `enterprise/${companyId}`,
            method: 'GET',
            hideLoading: true,
            success: enterpriseRes => {
              if (enterpriseRes.statusCode === 200 && enterpriseRes.data && enterpriseRes.data.code === 200 && enterpriseRes.data.data) {
                const enterprise = enterpriseRes.data.data
                const enterpriseStatus = Number(firstValid(enterprise.status, -1))
                const isEnabled = enterpriseStatus === 1
                const reason = isEnabled ? '' : '企业已被管理员禁用，无法发布职位'

                this.setData({ enterpriseStatus })
                this.updatePublishAvailability(isEnabled, reason)

                if (!isEnabled && !silent) {
                  wx.showToast({
                    title: reason,
                    icon: 'none'
                  })
                }
                resolve(isEnabled)
                return
              }

              const message = normalizeMessage(enterpriseRes.data, '企业状态加载失败，请稍后重试')
              if (this.isAuthFailureMessage(message)) {
                this.updatePublishAvailability(false, message)
                if (!silent) {
                  this.handleAuthFailure(message)
                }
                resolve(false)
                return
              }

              this.updatePublishAvailability(false, message)
              if (!silent) {
                wx.showToast({
                  title: message,
                  icon: 'none'
                })
              }
              resolve(false)
            },
            fail: () => {
              const message = '企业状态加载失败，请稍后重试'
              this.updatePublishAvailability(false, message)
              if (!silent) {
                wx.showToast({
                  title: message,
                  icon: 'none'
                })
              }
              resolve(false)
            }
          })
        },
        fail: () => {
          const message = '用户状态加载失败，请稍后重试'
          this.updatePublishAvailability(false, message)
          if (!silent) {
            wx.showToast({
              title: message,
              icon: 'none'
            })
          }
          resolve(false)
        }
      })
    })
  },

  getJobCategories() {
    app.request({
      url: 'jobCategory',
      loadingTitle: '加载职位分类...',
      success: res => {
        if (res.data && res.data.code === 200) {
          const categories = res.data.data || []
          this.setData({
            categories,
            firstLevelCategories: categories.filter(category => Number(category.parentId) === 0)
          })
          if (this.data.job.categoryId) {
            this.setJobCategory(this.data.job.categoryId)
          }
        }
      }
    })
  },

  getSecondLevelCategories(parentId) {
    return this.data.categories.filter(category => Number(category.parentId) === Number(parentId))
  },

  getJobDetail(jobId) {
    app.request({
      url: `job/${jobId}`,
      method: 'GET',
      loadingTitle: '加载职位详情...',
      success: res => {
        if (res.data && res.data.code === 200 && res.data.data) {
          const jobDetail = res.data.data
          this.setJobCategory(jobDetail.categoryId)
          this.setData({
            job: {
              id: jobDetail.id || '',
              title: jobDetail.title || jobDetail.jobTitle || '',
              categoryId: jobDetail.categoryId || '',
              industry: jobDetail.industry || '',
              salaryMin: jobDetail.salaryMin || jobDetail.minSalary || '',
              salaryMax: jobDetail.salaryMax || jobDetail.maxSalary || '',
              location: jobDetail.location || jobDetail.city || '',
              jobType: jobDetail.jobType || '',
              description: jobDetail.description || jobDetail.jobDescription || '',
              welfare: jobDetail.welfare || jobDetail.benefits || '',
              startTime: jobDetail.startTime || '',
              endTime: jobDetail.endTime || '',
              nums: jobDetail.nums || '',
              status: jobDetail.status || 2
            }
          })
          return
        }

        wx.showToast({
          title: normalizeMessage(res.data, '获取职位详情失败'),
          icon: 'none'
        })
      },
      fail: err => {
        console.error('获取职位详情失败:', err)
        wx.showToast({
          title: '网络请求失败',
          icon: 'none'
        })
      }
    })
  },

  setJobCategory(categoryId) {
    if (!categoryId || !this.data.categories.length) {
      return
    }

    const currentCategory = this.data.categories.find(cat => Number(cat.id) === Number(categoryId))
    if (!currentCategory) {
      return
    }

    if (Number(currentCategory.parentId) !== 0) {
      const firstLevelCategory = this.data.categories.find(cat => Number(cat.id) === Number(currentCategory.parentId))
      if (!firstLevelCategory) {
        return
      }

      const firstLevelIndex = this.data.firstLevelCategories.findIndex(cat => Number(cat.id) === Number(firstLevelCategory.id))
      const secondLevelCategories = this.getSecondLevelCategories(firstLevelCategory.id)
      const secondLevelIndex = secondLevelCategories.findIndex(cat => Number(cat.id) === Number(categoryId))

      this.setData({
        selectedFirstLevelIndex: firstLevelIndex < 0 ? 0 : firstLevelIndex,
        selectedFirstLevel: firstLevelCategory.id,
        selectedFirstLevelName: firstLevelCategory.name,
        secondLevelCategories,
        selectedSecondLevelIndex: secondLevelIndex < 0 ? 0 : secondLevelIndex,
        selectedSecondLevel: categoryId,
        selectedSecondLevelName: currentCategory.name,
        showSecondLevel: secondLevelCategories.length > 0
      })
      return
    }

    const firstLevelIndex = this.data.firstLevelCategories.findIndex(cat => Number(cat.id) === Number(categoryId))
    this.setData({
      selectedFirstLevelIndex: firstLevelIndex < 0 ? 0 : firstLevelIndex,
      selectedFirstLevel: categoryId,
      selectedFirstLevelName: currentCategory.name,
      secondLevelCategories: this.getSecondLevelCategories(categoryId),
      selectedSecondLevelIndex: 0,
      selectedSecondLevel: '',
      selectedSecondLevelName: '请选择二级分类',
      showSecondLevel: false
    })
  },

  onInput(e) {
    const field = e.currentTarget.dataset.field
    this.setData({
      [`job.${field}`]: e.detail.value
    })
  },

  onDateChange(e) {
    const field = e.currentTarget.dataset.field
    this.setData({
      [`job.${field}`]: e.detail.value
    })
  },

  selectFirstLevel(e) {
    const index = Number(e.detail.value)
    const selectedFirstLevel = this.data.firstLevelCategories[index]
    if (!selectedFirstLevel) {
      return
    }

    const secondLevelCategories = this.getSecondLevelCategories(selectedFirstLevel.id)
    this.setData({
      selectedFirstLevelIndex: index,
      selectedFirstLevel: selectedFirstLevel.id,
      selectedFirstLevelName: selectedFirstLevel.name,
      secondLevelCategories,
      selectedSecondLevelIndex: 0,
      selectedSecondLevel: '',
      selectedSecondLevelName: '请选择二级分类',
      'job.categoryId': '',
      showSecondLevel: secondLevelCategories.length > 0
    })
  },

  selectSecondLevel(e) {
    const index = Number(e.detail.value)
    const selectedSecondLevel = this.data.secondLevelCategories[index]
    if (!selectedSecondLevel) {
      return
    }

    this.setData({
      selectedSecondLevelIndex: index,
      selectedSecondLevel: selectedSecondLevel.id,
      selectedSecondLevelName: selectedSecondLevel.name,
      'job.categoryId': selectedSecondLevel.id
    })
  },

  async publishJob() {
    if (this.data.loading) {
      return
    }

    if (!this.data.canPublish) {
      wx.showToast({
        title: safeText(this.data.blockReason, '当前账号无法发布职位'),
        icon: 'none'
      })
      return
    }

    const enterpriseAvailable = await this.loadEnterpriseAccessStatus(true)
    if (!enterpriseAvailable) {
      wx.showToast({
        title: safeText(this.data.blockReason, '当前账号无法发布职位'),
        icon: 'none'
      })
      return
    }

    const { job, jobId } = this.data
    if (!job.title || !job.categoryId || !job.salaryMin || !job.salaryMax || !job.location || !job.description || !job.welfare) {
      wx.showToast({
        title: '请填写完整职位信息',
        icon: 'none'
      })
      return
    }

    const userInfo = this.getCurrentUserInfo()
    const enterpriseId = firstValid(userInfo.companyId, userInfo.company && userInfo.company.id)
    if (!enterpriseId) {
      this.handleAuthFailure('未获取到企业信息，请重新登录')
      return
    }

    const isUpdate = Boolean(jobId)
    const requestData = {
      ...job,
      enterpriseId,
      status: isUpdate ? job.status : 2
    }
    const url = isUpdate ? `job/${jobId}` : 'job'
    const method = isUpdate ? 'PUT' : 'POST'
    const loadingTitle = isUpdate ? '更新职位中...' : '发布职位中...'
    const successTitle = isUpdate ? '职位更新成功' : '职位发布成功'

    this.setData({ loading: true })

    app.request({
      url,
      method,
      data: requestData,
      loadingTitle,
      success: res => {
        if (res.data && res.data.code === 200) {
          wx.showToast({
            title: successTitle,
            icon: 'success'
          })
          setTimeout(() => {
            wx.navigateBack()
          }, 1500)
          return
        }

        const message = normalizeMessage(res.data, isUpdate ? '更新职位失败' : '发布职位失败')
        if (this.isAuthFailureMessage(message)) {
          this.handleAuthFailure(message)
          return
        }

        if (message.indexOf('禁用') !== -1 || message.indexOf('审核') !== -1) {
          this.updatePublishAvailability(false, message)
        }

        wx.showToast({
          title: message,
          icon: 'none'
        })
      },
      fail: err => {
        console.error(isUpdate ? '更新职位失败:' : '发布职位失败:', err)
        wx.showToast({
          title: '网络请求失败',
          icon: 'none'
        })
      },
      complete: () => {
        this.setData({ loading: false })
      }
    })
  }
})
