const app = getApp()
const { firstValid, safeText } = require('../../utils/normalizers')
const {
  PASSWORD_MAX_LENGTH,
  PASSWORD_PLACEHOLDER,
  PASSWORD_RULE_HINT,
  sanitizePasswordInput,
  validatePassword
} = require('../../utils/credential-rules')

function normalizeMessage(payload, fallback) {
  return safeText(firstValid(payload && payload.msg, payload && payload.message), fallback)
}

Page({
  data: {
    passwordMaxLength: PASSWORD_MAX_LENGTH,
    passwordPlaceholder: PASSWORD_PLACEHOLDER,
    passwordRuleHint: PASSWORD_RULE_HINT,
    form: {
      oldPassword: '',
      newPassword: '',
      confirmPassword: ''
    },
    submitting: false
  },

  onLoad() {
    const token = wx.getStorageSync('token') || app.globalData.token
    const userInfo = wx.getStorageSync('userInfo') || app.globalData.userInfo || {}
    const userId = firstValid(userInfo.userId, userInfo.id)

    if (!token || !userId) {
      app.clearLoginState()
      app.redirectToLogin()
    }
  },

  onFieldChange(e) {
    const { field } = e.currentTarget.dataset
    this.setData({
      [`form.${field}`]: sanitizePasswordInput(e.detail.value)
    })
  },

  submit() {
    if (this.data.submitting) {
      return
    }

    const { oldPassword, newPassword, confirmPassword } = this.data.form
    const userInfo = wx.getStorageSync('userInfo') || app.globalData.userInfo || {}
    const userId = firstValid(userInfo.userId, userInfo.id)
    const normalizedOldPassword = sanitizePasswordInput(oldPassword)
    const normalizedNewPassword = sanitizePasswordInput(newPassword)
    const normalizedConfirmPassword = sanitizePasswordInput(confirmPassword)

    if (
      normalizedOldPassword !== oldPassword ||
      normalizedNewPassword !== newPassword ||
      normalizedConfirmPassword !== confirmPassword
    ) {
      this.setData({
        'form.oldPassword': normalizedOldPassword,
        'form.newPassword': normalizedNewPassword,
        'form.confirmPassword': normalizedConfirmPassword
      })
    }

    if (!userId) {
      wx.showToast({
        title: '登录状态已失效',
        icon: 'none'
      })
      app.clearLoginState()
      setTimeout(() => {
        app.redirectToLogin()
      }, 300)
      return
    }

    const oldPasswordError = validatePassword(normalizedOldPassword, '请输入原密码')
    if (oldPasswordError) {
      wx.showToast({
        title: oldPasswordError,
        icon: 'none'
      })
      return
    }

    const newPasswordError = validatePassword(normalizedNewPassword, '请输入新密码')
    if (newPasswordError) {
      wx.showToast({
        title: newPasswordError,
        icon: 'none'
      })
      return
    }

    const confirmPasswordError = validatePassword(normalizedConfirmPassword, '请再次输入新密码')
    if (confirmPasswordError) {
      wx.showToast({
        title: confirmPasswordError,
        icon: 'none'
      })
      return
    }

    if (normalizedNewPassword !== normalizedConfirmPassword) {
      wx.showToast({
        title: '两次输入的新密码不一致',
        icon: 'none'
      })
      return
    }

    if (normalizedOldPassword === normalizedNewPassword) {
      wx.showToast({
        title: '新密码不能与原密码一致',
        icon: 'none'
      })
      return
    }

    this.setData({ submitting: true })

    app.request({
      url: 'updatePassword',
      method: 'PUT',
      data: {
        userId,
        password: normalizedOldPassword,
        newPassword: normalizedNewPassword
      },
      success: res => {
        if (res.statusCode === 200 && res.data && res.data.code === 200) {
          wx.showToast({
            title: '修改成功，请重新登录',
            icon: 'success',
            duration: 1500
          })

          app.clearLoginState()
          setTimeout(() => {
            app.redirectToLogin()
          }, 1200)
          return
        }

        wx.showToast({
          title: normalizeMessage(res.data, '修改失败'),
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
        this.setData({ submitting: false })
      }
    })
  }
})
