// pages/interview/interview.js
const app = getApp()

Page({
  data: {
    interviewList: [],
    isLoading: true,
    isEmpty: false,
    showActionSheet: false,
    selectedApplicationId: null
  },

  onLoad() {
    this.loadInterviews()
  },

  onShow() {
    // 每次显示页面时重新加载数据
    this.loadInterviews()
  },

  // 加载面试邀请列表
  loadInterviews() {
    if (!app.globalData.isLoggedIn) {
      wx.redirectTo({
        url: '/pages/login/login'
      })
      return
    }

    this.setData({
      isLoading: true
    })

    // 从后端获取面试邀请记录 (status=1表示已邀请面试)
    wx.request({
      url: app.globalData.baseUrl + 'application?status=1',
      method: 'GET',
      header: {
        'token': app.globalData.token || wx.getStorageSync('token')
      },
      success: (res) => {
        console.log('获取面试邀请记录成功:', res.data)
        if (res.statusCode === 200 && res.data.code === 200) {
          let interviews = res.data.data || []
          
          // 转换数据格式
          interviews = interviews.map(item => ({
            id: item.id,
            jobId: item.jobId,
            jobTitle: item.jobTitle || '未知职位',
            company: item.company || '未知公司',
            salary: item.salary || '薪资面议',
            location: item.location || '工作地点待定',
            interviewTime: item.interviewTime ? new Date(item.interviewTime).toISOString().split('T')[0] + ' ' + new Date(item.interviewTime).toTimeString().split(' ')[0] : '待定',
            interviewAddress: item.interviewAddress || '待定',
            companyLogo: item.companyLogo || '/images/company-logo.png',
            status: item.status,
            createTime: item.createTime ? new Date(item.createTime).toISOString().split('T')[0] : '未知时间'
          }))
          
          this.setData({
            interviewList: interviews,
            isLoading: false,
            isEmpty: interviews.length === 0
          })
        } else {
          wx.showToast({
            title: '获取面试邀请失败',
            icon: 'none'
          })
          this.setData({
            isLoading: false,
            isEmpty: true
          })
        }
      },
      fail: (err) => {
        console.error('获取面试邀请失败:', err)
        wx.showToast({
          title: '网络请求失败',
          icon: 'none'
        })
        this.setData({
          isLoading: false,
          isEmpty: true
        })
      }
    })
  },

  // 显示操作菜单
  showActions(e) {
    const applicationId = e.currentTarget.dataset.id
    this.setData({
      showActionSheet: true,
      selectedApplicationId: applicationId
    })
  },

  // 关闭操作菜单
  closeActionSheet() {
    this.setData({
      showActionSheet: false,
      selectedApplicationId: null
    })
  },

  // 处理ActionSheet选择
  onActionSheetSelect(e) {
    const action = e.detail.name
    const applicationId = this.data.selectedApplicationId
    
    if (action === 'accept') {
      this.updateInterviewStatus(applicationId, 1) // 1表示接受面试（待面试状态）
    } else if (action === 'reject') {
      this.updateInterviewStatus(applicationId, 4) // 4表示拒绝面试
    }
    
    this.closeActionSheet()
  },

  // 处理面试响应 (接受或拒绝) - 从按钮点击事件调用
  handleInterviewResponse(e) {
    const applicationId = e.currentTarget.dataset.id
    const newStatus = parseInt(e.currentTarget.dataset.status)
    
    this.updateInterviewStatus(applicationId, newStatus)
  },

  // 更新面试状态
  updateInterviewStatus(applicationId, newStatus) {
    wx.showLoading({
      title: '处理中...'
    })

    const statusText = newStatus === 1 ? '接受面试' : '拒绝面试'

    wx.request({
      url: app.globalData.baseUrl + 'application',
      method: 'PUT',
      header: {
        'token': app.globalData.token || wx.getStorageSync('token'),
        'Content-Type': 'application/json'
      },
      data: {
        id: applicationId,
        status: newStatus
      },
      success: (res) => {
        wx.hideLoading()
        console.log('更新状态结果:', res.data)
        if (res.statusCode === 200 && res.data.code === 200) {
          wx.showToast({
            title: `${statusText}成功`,
            icon: 'success'
          })
          // 重新加载列表
          this.loadInterviews()
        } else {
          wx.showToast({
            title: `${statusText}失败`,
            icon: 'none'
          })
        }
      },
      fail: (err) => {
        wx.hideLoading()
        console.error('更新状态失败:', err)
        wx.showToast({
          title: '网络请求失败',
          icon: 'none'
        })
      }
    })
  },

  // 跳转到职位详情页
  goToJobDetail(e) {
    const jobId = e.currentTarget.dataset.jobId
    wx.navigateTo({
      url: `/pages/job-detail/job-detail?id=${jobId}`
    })
  }
})
