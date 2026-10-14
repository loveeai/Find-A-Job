App({
  onLaunch() {
    const logs = wx.getStorageSync('logs') || []
    logs.unshift(Date.now())
    wx.setStorageSync('logs', logs)

    this.checkLoginStatus()

    wx.login({
      success: () => {}
    })

    wx.getSetting({
      success: res => {
        if (!res.authSetting['scope.userInfo']) {
          return
        }

        wx.getUserInfo({
          success: userRes => {
            this.globalData.userInfo = userRes.userInfo

            if (this.userInfoReadyCallback) {
              this.userInfoReadyCallback(userRes)
            }
          }
        })
      }
    })
  },

  checkLoginStatus() {
    const token = wx.getStorageSync('token')
    const userInfo = wx.getStorageSync('userInfo')
    const roleId = Number(wx.getStorageSync('roleId') || 3)
    const isLoggedIn = wx.getStorageSync('isLoggedIn')

    console.log('检查登录状态，本地缓存:', { token, hasUserInfo: !!userInfo, roleId, isLoggedIn })

    if ((token && userInfo) || isLoggedIn) {
      this.globalData.token = token
      this.globalData.userInfo = userInfo
      this.globalData.roleId = roleId
      this.globalData.isLoggedIn = true
      console.log('登录状态恢复成功')
      return
    }

    console.log('未恢复登录状态')
  },

  switchRole(roleId) {
    this.globalData.roleId = roleId
    wx.setStorageSync('roleId', roleId)
  },

  clearLoginState() {
    this.globalData.userInfo = null
    this.globalData.token = ''
    this.globalData.roleId = 3
    this.globalData.isLoggedIn = false

    wx.removeStorageSync('userInfo')
    wx.removeStorageSync('token')
    wx.removeStorageSync('roleId')
    wx.removeStorageSync('isLoggedIn')
  },

  redirectToLogin() {
    wx.reLaunch({
      url: '/pages/login/login'
    })
  },

  getCurrentRole() {
    return this.globalData.roleId || 3
  },

  isEnterpriseUser() {
    return this.globalData.roleId === 2
  },

  showLoading(title = '加载中...') {
    if (this.globalData.loading) {
      return
    }

    this.globalData.loading = true
    wx.showLoading({
      title,
      mask: true
    })
  },

  hideLoading() {
    if (!this.globalData.loading) {
      return
    }

    this.globalData.loading = false
    wx.hideLoading()
  },

  showError(message = '操作失败，请重试') {
    wx.showToast({
      title: message,
      icon: 'none',
      duration: 2000
    })
  },

  request(options) {
    const defaultOptions = {
      url: '',
      method: 'GET',
      data: {},
      header: {
        'content-type': 'application/json',
        token: this.globalData.token || wx.getStorageSync('token'),
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        Pragma: 'no-cache',
        Expires: '0'
      },
      success: () => {},
      fail: () => {},
      complete: () => {}
    }

    const mergedOptions = { ...defaultOptions, ...options }

    if (mergedOptions.url.indexOf('http') !== 0) {
      mergedOptions.url = this.globalData.baseUrl + mergedOptions.url
    }

    if (!mergedOptions.hideLoading) {
      this.showLoading(mergedOptions.loadingTitle)
    }

    if (mergedOptions.method === 'GET') {
      mergedOptions.data = {
        ...mergedOptions.data,
        _t: Date.now()
      }
    }

    console.log('最终发送数据:', mergedOptions.data)

    return wx.request({
      ...mergedOptions,
      success: res => {
        console.log('服务端响应:', res)

        if (mergedOptions.success) {
          mergedOptions.success(res)
        }

        if (res.data && res.data.code && res.data.code !== 200) {
          console.log('请求返回非 200 状态:', res.data.code, res.data.msg || '无错误信息')
        }
      },
      fail: err => {
        console.error('网络请求失败:', err)
        console.error('请求详情:', {
          url: mergedOptions.url,
          method: mergedOptions.method,
          headers: mergedOptions.header,
          data: mergedOptions.data
        })

        if (err.errMsg && err.errMsg.includes('ERR_CACHE_READ_FAILURE')) {
          console.error('缓存读取失败，尝试重新请求...')
          const retryOptions = { ...mergedOptions, hideLoading: true }
          delete retryOptions.success
          delete retryOptions.fail
          delete retryOptions.complete

          wx.request({
            ...retryOptions,
            success: res => {
              if (mergedOptions.success) {
                mergedOptions.success(res)
              }
            },
            fail: retryErr => {
              console.error('重试请求失败:', retryErr)
              if (mergedOptions.fail) {
                mergedOptions.fail(retryErr)
              }
            },
            complete: retryRes => {
              if (!mergedOptions.hideLoading) {
                this.hideLoading()
              }
              if (mergedOptions.complete) {
                mergedOptions.complete(retryRes)
              }
            }
          })
          return
        }

        if (mergedOptions.fail) {
          mergedOptions.fail(err)
        }
      },
      complete: res => {
        if (!mergedOptions.hideLoading) {
          this.hideLoading()
        }
        if (mergedOptions.complete) {
          mergedOptions.complete(res)
        }
      }
    })
  },

  globalData: {
    userInfo: null,
    token: '',
    baseUrl: 'http://127.0.0.1:8182/',
    roleId: 3,
    isLoggedIn: false,
    loading: false
  }
})
