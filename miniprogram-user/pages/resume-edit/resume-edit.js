const app = getApp()
const { extractList, safeText } = require('../../utils/normalizers')

function createEmptyResume() {
  return {
    id: '',
    title: '',
    name: '',
    gender: 1,
    phone: '',
    email: '',
    location: '',
    education: '',
    experience: '',
    expectedPosition: '',
    expectedPositionName: '',
    selfIntroduction: ''
  }
}

function normalizeExpectedPosition(value) {
  const text = safeText(value, '')
  if (!text || !/^\d+$/.test(text)) {
    return undefined
  }
  return text
}

Page({
  data: {
    resume: createEmptyResume(),
    isLoading: true
  },

  onLoad() {
    this.loadResumeDetail()
  },

  loadResumeDetail() {
    this.setData({ isLoading: true })

    app.request({
      url: 'resume',
      method: 'GET',
      success: res => {
        if (res.statusCode !== 200 || !res.data || res.data.code !== 200) {
          this.setData({
            resume: createEmptyResume()
          })
          return
        }

        const list = extractList(res.data)
        if (!list.length) {
          this.setData({
            resume: createEmptyResume()
          })
          return
        }

        const current = list[0]
        this.setData({
          resume: {
            id: current.id || '',
            title: safeText(current.title, ''),
            name: safeText(current.name, ''),
            gender: Number(current.gender || 1),
            phone: safeText(current.phone, ''),
            email: safeText(current.email, ''),
            location: safeText(current.location, ''),
            education: safeText(current.education, ''),
            experience: safeText(current.experience, ''),
            expectedPosition: safeText(current.expectedPosition, ''),
            expectedPositionName: safeText(current.expectedPositionName || current.expectedPosition, ''),
            selfIntroduction: safeText(current.selfIntroduction, '')
          }
        })
      },
      fail: () => {
        wx.showToast({
          title: '简历加载失败',
          icon: 'none'
        })
      },
      complete: () => {
        this.setData({ isLoading: false })
      }
    })
  },

  onInput(e) {
    const { field, value } = e.currentTarget.dataset
    const nextValue = value !== undefined ? Number(value) : e.detail.value
    this.setData({
      [`resume.${field}`]: nextValue
    })
  },

  saveResume() {
    const { resume } = this.data

    if (!resume.title || !resume.name || !resume.phone || !resume.email) {
      wx.showToast({
        title: '请完善标题、姓名、电话和邮箱',
        icon: 'none'
      })
      return
    }

    wx.showLoading({
      title: '保存中...'
    })

    const method = resume.id ? 'PUT' : 'POST'
    const expectedPosition = normalizeExpectedPosition(resume.expectedPosition)
    const payload = {
      id: resume.id || undefined,
      title: resume.title,
      name: resume.name,
      gender: resume.gender,
      phone: resume.phone,
      email: resume.email,
      location: resume.location,
      education: resume.education,
      experience: resume.experience,
      expectedPosition,
      expectedPositionName: resume.expectedPositionName,
      selfIntroduction: resume.selfIntroduction,
      status: 0
    }

    app.request({
      url: 'resume',
      method,
      data: payload,
      success: res => {
        if (res.statusCode === 200 && res.data && res.data.code === 200) {
          wx.showToast({
            title: '保存成功',
            icon: 'success'
          })

          setTimeout(() => {
            wx.navigateBack({
              fail: () => {
                wx.switchTab({
                  url: '/pages/resume/resume'
                })
              }
            })
          }, 300)
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
  }
})
