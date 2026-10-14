const app = getApp()
const { firstValid, normalizeEnterprise, normalizeImageUrl, safeText } = require('../../../utils/normalizers')

function createEmptyEnterprise() {
  return {
    id: '',
    name: '',
    logo: '/images/default-logo.png',
    logoPath: '',
    scale: '',
    industry: '',
    address: '',
    description: ''
  }
}

function getRawAssetPath(value) {
  const text = safeText(value, '')
  if (!text) {
    return ''
  }

  const baseUrl = safeText(app.globalData.baseUrl, '').replace(/\/+$/, '')
  if (baseUrl && text.indexOf(baseUrl) === 0) {
    return text.slice(baseUrl.length)
  }

  return text
}

Page({
  data: {
    enterprise: createEmptyEnterprise(),
    isEditing: false,
    isLoading: true
  },

  onLoad() {
    this.loadEnterpriseInfo()
  },

  getCurrentCompanyId() {
    const userInfo = wx.getStorageSync('userInfo') || app.globalData.userInfo || {}
    return firstValid(userInfo.companyId, userInfo.company && userInfo.company.id)
  },

  loadEnterpriseInfo() {
    const companyId = this.getCurrentCompanyId()
    if (!companyId) {
      this.setData({ isLoading: false })
      wx.showToast({
        title: '未获取到企业信息',
        icon: 'none'
      })
      return
    }

    app.request({
      url: `enterprise/${companyId}`,
      method: 'GET',
      success: res => {
        if (res.statusCode === 200 && res.data && res.data.code === 200 && res.data.data) {
          const enterprise = normalizeEnterprise(res.data.data, app.globalData.baseUrl)
          this.setData({
            enterprise: {
              ...enterprise,
              logoPath: safeText(firstValid(res.data.data.logo, res.data.data.companyLogo), '')
            }
          })
          return
        }

        wx.showToast({
          title: '企业信息加载失败',
          icon: 'none'
        })
      },
      fail: () => {
        wx.showToast({
          title: '企业信息加载失败',
          icon: 'none'
        })
      },
      complete: () => {
        this.setData({ isLoading: false })
      }
    })
  },

  toggleEdit() {
    this.setData({
      isEditing: !this.data.isEditing
    })
  },

  onInput(e) {
    const { field } = e.currentTarget.dataset
    this.setData({
      [`enterprise.${field}`]: e.detail.value
    })
  },

  uploadLogo() {
    const token = app.globalData.token || wx.getStorageSync('token')
    if (!token) {
      wx.showToast({
        title: '请先登录',
        icon: 'none'
      })
      return
    }

    wx.chooseMedia({
      count: 1,
      mediaType: ['image'],
      sourceType: ['album', 'camera'],
      sizeType: ['compressed'],
      success: res => {
        const tempFilePath = res.tempFiles && res.tempFiles[0] ? res.tempFiles[0].tempFilePath : ''
        if (!tempFilePath) {
          return
        }

        const previousEnterprise = { ...this.data.enterprise }
        this.setData({
          'enterprise.logo': tempFilePath
        })

        wx.showLoading({
          title: '上传中...'
        })

        wx.uploadFile({
          url: `${app.globalData.baseUrl}upload/logo`,
          filePath: tempFilePath,
          name: 'file',
          header: {
            token
          },
          success: uploadRes => {
            try {
              const response = JSON.parse(uploadRes.data || '{}')
              if (response.code === 200) {
                const fileUrl = safeText(firstValid(
                  response.data && response.data.fileUrl,
                  response.data && response.data.url,
                  response.data
                ), '')

                if (!fileUrl) {
                  throw new Error('missing logo url')
                }

                this.persistEnterpriseLogo(fileUrl)
                return
              }
            } catch (error) {
            }

            this.setData({
              enterprise: previousEnterprise
            })
            wx.showToast({
              title: 'Logo 上传失败',
              icon: 'none'
            })
          },
          fail: () => {
            this.setData({
              enterprise: previousEnterprise
            })
            wx.showToast({
              title: 'Logo 上传失败',
              icon: 'none'
            })
          },
          complete: () => {
            wx.hideLoading()
          }
        })
      }
    })
  },

  persistEnterpriseLogo(fileUrl) {
    const nextEnterprise = {
      ...this.data.enterprise,
      logo: normalizeImageUrl(fileUrl, app.globalData.baseUrl, '/images/default-logo.png'),
      logoPath: fileUrl
    }

    this.setData({
      enterprise: nextEnterprise
    })

    app.request({
      url: 'enterprise',
      method: 'PUT',
      hideLoading: true,
      data: {
        id: this.getCurrentCompanyId(),
        name: safeText(nextEnterprise.name, ''),
        logo: safeText(nextEnterprise.logoPath, ''),
        scale: safeText(nextEnterprise.scale, ''),
        industry: safeText(nextEnterprise.industry, ''),
        address: safeText(nextEnterprise.address, ''),
        description: safeText(nextEnterprise.description, '')
      },
      success: res => {
        if (res.statusCode === 200 && res.data && res.data.code === 200) {
          wx.showToast({
            title: 'Logo 已更新',
            icon: 'success'
          })
          return
        }

        wx.showToast({
          title: safeText(firstValid(res.data && res.data.msg, res.data && res.data.message), 'Logo 保存失败'),
          icon: 'none'
        })
      },
      fail: () => {
        wx.showToast({
          title: 'Logo 保存失败',
          icon: 'none'
        })
      }
    })
  },

  saveEnterpriseInfo() {
    const { enterprise } = this.data
    if (!enterprise.name || !enterprise.industry || !enterprise.address) {
      wx.showToast({
        title: '请完善企业名称、行业和地址',
        icon: 'none'
      })
      return
    }

    const companyId = this.getCurrentCompanyId()
    if (!companyId) {
      wx.showToast({
        title: '企业信息缺失',
        icon: 'none'
      })
      return
    }

    wx.showLoading({
      title: '保存中...'
    })

    app.request({
      url: 'enterprise',
      method: 'PUT',
      data: {
        id: companyId,
        name: enterprise.name,
        logo: safeText(firstValid(enterprise.logoPath, getRawAssetPath(enterprise.logo), enterprise.logo), ''),
        scale: enterprise.scale,
        industry: enterprise.industry,
        address: enterprise.address,
        description: enterprise.description
      },
      success: res => {
        if (res.statusCode === 200 && res.data && res.data.code === 200) {
          wx.showToast({
            title: '保存成功',
            icon: 'success'
          })
          this.setData({ isEditing: false })
          this.loadEnterpriseInfo()
          return
        }

        wx.showToast({
          title: safeText(res.data && res.data.msg, '保存失败'),
          icon: 'none'
        })
      },
      fail: () => {
        wx.showToast({
          title: '保存失败，请稍后重试',
          icon: 'none'
        })
      },
      complete: () => {
        wx.hideLoading()
      }
    })
  },

  goToChangePassword() {
    wx.navigateTo({
      url: '/pages/change-password/change-password'
    })
  },

  logout() {
    wx.showModal({
      title: '退出登录',
      content: '确定退出当前账号吗？',
      success: res => {
        if (!res.confirm) {
          return
        }

        app.clearLoginState()
        app.redirectToLogin()
      }
    })
  }
})
