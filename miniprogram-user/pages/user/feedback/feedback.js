// pages/user/feedback/feedback.js
const app = getApp()

Page({
  data: {
    feedbackContent: '',
    contactInfo: '',
    imageList: [],
    isSubmitting: false
  },

  // 输入反馈内容
  onContentInput(e) {
    this.setData({
      feedbackContent: e.detail.value
    })
  },

  // 输入联系方式
  onContactInput(e) {
    this.setData({
      contactInfo: e.detail.value
    })
  },

  // 选择图片
  chooseImage() {
    const maxCount = 3 - this.data.imageList.length
    if (maxCount <= 0) {
      wx.showToast({
        title: '最多只能上传3张图片',
        icon: 'none'
      })
      return
    }

    wx.chooseImage({
      count: maxCount,
      sizeType: ['compressed'],
      sourceType: ['album', 'camera'],
      success: (res) => {
        this.setData({
          imageList: this.data.imageList.concat(res.tempFilePaths)
        })
      }
    })
  },

  // 删除图片
  deleteImage(e) {
    const index = e.currentTarget.dataset.index
    const imageList = this.data.imageList
    imageList.splice(index, 1)
    this.setData({
      imageList: imageList
    })
  },

  // 提交反馈
  submitFeedback() {
    if (!this.data.feedbackContent.trim()) {
      wx.showToast({
        title: '请输入反馈内容',
        icon: 'none'
      })
      return
    }

    this.setData({
      isSubmitting: true
    })

    // 模拟提交过程
    setTimeout(() => {
      wx.showToast({
        title: '反馈提交成功',
        icon: 'success'
      })
      
      // 清空表单
      this.setData({
        feedbackContent: '',
        contactInfo: '',
        imageList: [],
        isSubmitting: false
      })
      
      // 返回上一页
      setTimeout(() => {
        wx.navigateBack()
      }, 1500)
    }, 1500)
  }
})