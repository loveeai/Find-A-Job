const app = getApp()
const { extractList, firstValid, safeText } = require('../../utils/normalizers')
const {
  PASSWORD_MAX_LENGTH,
  PASSWORD_PLACEHOLDER,
  PASSWORD_RULE_HINT,
  USERNAME_MAX_LENGTH,
  USERNAME_PLACEHOLDER,
  USERNAME_RULE_HINT,
  sanitizePasswordInput,
  sanitizeUserNameInput,
  validatePassword,
  validateUserName
} = require('../../utils/credential-rules')

function normalizeMessage(payload, fallback) {
  return safeText(firstValid(payload && payload.msg, payload && payload.message), fallback)
}

function requestWithPromise(options) {
  return new Promise((resolve, reject) => {
    app.request({
      ...options,
      success: res => resolve(res),
      fail: err => reject(err)
    })
  })
}

Page({
  data: {
    mode: 'login',
    loading: false,
    userNameMaxLength: USERNAME_MAX_LENGTH,
    passwordMaxLength: PASSWORD_MAX_LENGTH,
    userNamePlaceholder: USERNAME_PLACEHOLDER,
    passwordPlaceholder: PASSWORD_PLACEHOLDER,
    userNameRuleHint: USERNAME_RULE_HINT,
    passwordRuleHint: PASSWORD_RULE_HINT,
    companyList: [],
    companyIndex: -1,
    loginForm: {
      userName: '',
      password: '',
      roleId: 3
    },
    registerForm: {
      userName: '',
      password: '',
      confirmPassword: '',
      phoneNumber: '',
      email: '',
      sex: true,
      roleId: 3,
      companyId: ''
    }
  },

  onLoad() {
    this.loadCompanyList()
  },

  switchMode(e) {
    const { mode } = e.currentTarget.dataset
    if (!mode || mode === this.data.mode) {
      return
    }

    this.setData({ mode })
  },

  onLoginFieldChange(e) {
    const { field } = e.currentTarget.dataset
    let value = e.detail.value

    if (field === 'userName') {
      value = sanitizeUserNameInput(value)
    } else if (field === 'password') {
      value = sanitizePasswordInput(value)
    }

    this.setData({
      [`loginForm.${field}`]: value
    })
  },

  onRegisterFieldChange(e) {
    const { field } = e.currentTarget.dataset
    let value = e.detail.value

    if (field === 'userName') {
      value = sanitizeUserNameInput(value)
    } else if (field === 'password' || field === 'confirmPassword') {
      value = sanitizePasswordInput(value)
    }

    this.setData({
      [`registerForm.${field}`]: value
    })
  },

  onLoginRoleChange(e) {
    this.setData({
      'loginForm.roleId': Number(e.detail.value)
    })
  },

  onRegisterRoleChange(e) {
    const roleId = Number(e.detail.value)
    this.setData({
      'registerForm.roleId': roleId,
      'registerForm.companyId': roleId === 2 ? this.data.registerForm.companyId : '',
      companyIndex: roleId === 2 ? this.data.companyIndex : -1
    })
  },

  onGenderChange(e) {
    this.setData({
      'registerForm.sex': e.detail.value === 'male'
    })
  },

  onCompanyChange(e) {
    const companyIndex = Number(e.detail.value)
    const company = this.data.companyList[companyIndex] || {}
    this.setData({
      companyIndex,
      'registerForm.companyId': firstValid(company.id, '')
    })
  },

  loadCompanyList() {
    app.request({
      url: 'enterprise',
      method: 'GET',
      hideLoading: true,
      data: {
        pageNum: 1,
        pageSize: 200
      },
      success: res => {
        if (res.statusCode === 200 && res.data && res.data.code === 200) {
          this.setData({
            companyList: extractList(res.data)
          })
        }
      }
    })
  },

  onLogin() {
    const { userName, password, roleId } = this.data.loginForm
    const normalizedUserName = sanitizeUserNameInput(userName)
    const normalizedPassword = sanitizePasswordInput(password)
    const userNameError = validateUserName(normalizedUserName)
    const passwordError = validatePassword(normalizedPassword)

    if (normalizedUserName !== userName || normalizedPassword !== password) {
      this.setData({
        'loginForm.userName': normalizedUserName,
        'loginForm.password': normalizedPassword
      })
    }

    if (userNameError) {
      wx.showToast({
        title: userNameError,
        icon: 'none'
      })
      return
    }

    if (passwordError) {
      wx.showToast({
        title: passwordError,
        icon: 'none'
      })
      return
    }

    this.setData({ loading: true })

    wx.request({
      url: `${app.globalData.baseUrl}sysUser/login`,
      method: 'POST',
      data: {
        userName: normalizedUserName,
        password: normalizedPassword
      },
      success: res => {
        if (res.statusCode === 200 && res.data && res.data.code === 200 && res.data.data) {
          const loginData = res.data.data
          const userInfo = loginData.sysUser || {}

          if (Number(userInfo.roleId) !== Number(roleId)) {
            wx.showToast({
              title: '请选择正确的登录身份',
              icon: 'none'
            })
            return
          }

          app.globalData.userInfo = userInfo
          app.globalData.token = loginData.token
          app.globalData.roleId = userInfo.roleId
          app.globalData.isLoggedIn = true

          wx.setStorageSync('userInfo', userInfo)
          wx.setStorageSync('token', loginData.token)
          wx.setStorageSync('roleId', userInfo.roleId)
          wx.setStorageSync('isLoggedIn', true)

          wx.showToast({
            title: '登录成功',
            icon: 'success'
          })

          if (Number(userInfo.roleId) === 2) {
            wx.redirectTo({
              url: '/pages/enterprise/index/index'
            })
            return
          }

          wx.switchTab({
            url: '/pages/index/index'
          })
          return
        }

        wx.showToast({
          title: normalizeMessage(res.data, '登录失败'),
          icon: 'none'
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
      }
    })
  },

  async onRegister() {
    const registerForm = this.data.registerForm
    const userName = sanitizeUserNameInput(registerForm.userName)
    const password = sanitizePasswordInput(registerForm.password)
    const confirmPassword = sanitizePasswordInput(registerForm.confirmPassword)
    const phoneNumber = safeText(registerForm.phoneNumber, '').trim()
    const email = safeText(registerForm.email, '').trim()
    const isEnterpriseUser = Number(registerForm.roleId) === 2
    const userNameError = validateUserName(userName)
    const passwordError = validatePassword(password)
    const confirmPasswordError = validatePassword(confirmPassword, '请再次输入密码')

    if (
      userName !== registerForm.userName ||
      password !== registerForm.password ||
      confirmPassword !== registerForm.confirmPassword
    ) {
      this.setData({
        'registerForm.userName': userName,
        'registerForm.password': password,
        'registerForm.confirmPassword': confirmPassword
      })
    }

    if (userNameError) {
      wx.showToast({
        title: userNameError,
        icon: 'none'
      })
      return
    }

    if (passwordError) {
      wx.showToast({
        title: passwordError,
        icon: 'none'
      })
      return
    }

    if (confirmPasswordError) {
      wx.showToast({
        title: confirmPasswordError,
        icon: 'none'
      })
      return
    }

    if (password !== confirmPassword) {
      wx.showToast({
        title: '两次输入的密码不一致',
        icon: 'none'
      })
      return
    }

    if (!/^1\d{10}$/.test(phoneNumber)) {
      wx.showToast({
        title: '请输入正确的手机号',
        icon: 'none'
      })
      return
    }

    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      wx.showToast({
        title: '请输入正确的邮箱',
        icon: 'none'
      })
      return
    }

    if (isEnterpriseUser && !registerForm.companyId) {
      wx.showToast({
        title: '请选择所属企业',
        icon: 'none'
      })
      return
    }

    this.setData({ loading: true })

    const payload = {
      userName,
      password,
      phoneNumber,
      email,
      sex: registerForm.sex,
      roleId: Number(registerForm.roleId),
      companyId: isEnterpriseUser ? Number(registerForm.companyId) : undefined,
      auditStatus: isEnterpriseUser ? 0 : 1
    }

    try {
      const uniqueRes = await requestWithPromise({
        url: 'sysUser/checkUnique',
        method: 'GET',
        hideLoading: true,
        data: {
          userName,
          phoneNumber,
          email
        }
      })

      if (uniqueRes.statusCode !== 200 || !uniqueRes.data || uniqueRes.data.code !== 200 || !uniqueRes.data.data) {
        throw new Error(normalizeMessage(uniqueRes.data, '唯一性校验失败'))
      }

      const uniqueData = uniqueRes.data.data || {}
      if (!uniqueData.userNameUnique) {
        throw new Error('账号已存在')
      }
      if (!uniqueData.phoneNumberUnique) {
        throw new Error('手机号已存在')
      }
      if (email && !uniqueData.emailUnique) {
        throw new Error('邮箱已存在')
      }

      const registerRes = await requestWithPromise({
        url: 'sysUser',
        method: 'POST',
        hideLoading: true,
        data: payload
      })

      if (registerRes.statusCode === 200 && registerRes.data && registerRes.data.code === 200) {
        wx.showToast({
          title: isEnterpriseUser ? '已提交审核' : '注册成功，请登录',
          icon: 'success'
        })

        this.setData({
          mode: 'login',
          'loginForm.userName': userName,
          'loginForm.password': '',
          'loginForm.roleId': registerForm.roleId,
          registerForm: {
            userName: '',
            password: '',
            confirmPassword: '',
            phoneNumber: '',
            email: '',
            sex: true,
            roleId: 3,
            companyId: ''
          },
          companyIndex: -1
        })

        if (isEnterpriseUser) {
          wx.showModal({
            title: '提交成功',
            content: '企业账号已提交给管理员审核，审核通过后方可登录系统。',
            showCancel: false
          })
        }
        return
      }

      wx.showToast({
        title: normalizeMessage(registerRes.data, '注册失败'),
        icon: 'none'
      })
    } catch (error) {
      wx.showToast({
        title: safeText(error && error.message, '网络请求失败'),
        icon: 'none'
      })
    } finally {
      this.setData({ loading: false })
    }
  }
})
