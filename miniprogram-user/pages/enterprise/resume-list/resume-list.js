// pages/enterprise/resume-list/resume-list.js
const app = getApp()
Page({
  /**
   * 页面的初始数据
   */
  data: {
    resumes: [], // 简历列表
    filter: {
      keyword: '', // 关键词搜索
      industry: '', // 行业筛选
      experience: '', // 经验筛选
      education: '', // 学历筛选
      skills: '' // 技能筛选
    },
    page: 1,
    size: 10,
    hasMore: true,
    showFilter: false // 是否显示筛选面板
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.getResumeList()
  },

  /**
   * 获取简历列表
   */
  getResumeList: function (refresh = false) {
    if (!refresh && !this.data.hasMore) {
      return
    }

    const { filter, page, size } = this.data

    app.request({
      url: 'resume',
      method: 'GET',
      data: {
        ...filter,
        page,
        size
      },
      loadingTitle: '加载简历列表...',
      hideLoading: refresh, // 下拉刷新时不显示加载动画
      success: (res) => {
        if (res.data.code === 200) {
          const newResumes = res.data.data.records || []
          const resumes = refresh ? newResumes : [...this.data.resumes, ...newResumes]
          const hasMore = resumes.length < res.data.data.total
          
          this.setData({
            resumes,
            hasMore,
            page: refresh ? 1 : page + 1
          })
        }
      },
      complete: () => {
        wx.stopPullDownRefresh()
      }
    })
  },

  /**
   * 关键词搜索
   */
  onSearch: function (e) {
    const keyword = e.detail.value
    const { filter } = this.data
    filter.keyword = keyword
    this.setData({ filter, page: 1, hasMore: true })
    this.getResumeList(true)
  },

  /**
   * 筛选条件输入
   */
  onFilterInput: function (e) {
    const field = e.currentTarget.dataset.field
    const value = e.detail.value
    const { filter } = this.data
    filter[field] = value
    this.setData({ filter })
  },

  /**
   * 应用筛选
   */
  applyFilter: function () {
    this.setData({ 
      showFilter: false, 
      page: 1, 
      hasMore: true 
    })
    this.getResumeList(true)
  },

  /**
   * 重置筛选
   */
  resetFilter: function () {
    const filter = {
      keyword: '',
      industry: '',
      experience: '',
      education: '',
      skills: ''
    }
    this.setData({ filter })
  },

  /**
   * 显示/隐藏筛选面板
   */
  toggleFilter: function () {
    this.setData({ showFilter: !this.data.showFilter })
  },

  /**
   * 查看简历详情
   */
  viewResumeDetail: function (e) {
    const resumeId = e.currentTarget.dataset.id
    wx.navigateTo({
      url: `/pages/enterprise/resume-detail/resume-detail?id=${resumeId}`
    })
  },

  /**
   * 收藏简历
   */
  collectResume: function (e) {
    const index = e.currentTarget.dataset.index
    const { resumes } = this.data
    const resume = resumes[index]
    const isCollected = resume.isCollected

    // 取消收藏不需要企业ID
    if (isCollected) {
      app.request({
        url: `enterpriseCollectResume/${resume.id}`,
        method: 'DELETE',
        data: {},
        loadingTitle: '取消收藏中...',
        success: (res) => {
          if (res.data.code === 200) {
            resume.isCollected = !isCollected
            resumes[index] = resume
            this.setData({ resumes })
            wx.showToast({
              title: '取消收藏成功',
              icon: 'success'
            })
          }
        }
      })
    } else {
      // 收藏需要企业ID
      // 优先从本地存储直接获取userInfo，确保获取最新数据
      const localUserInfo = wx.getStorageSync('userInfo')
      console.log('从本地存储获取的userInfo:', JSON.stringify(localUserInfo, null, 2))
      
      // 直接从localUserInfo获取companyId，这是用户指定的企业ID字段
      const enterpriseId = localUserInfo?.companyId || ''
      
      console.log('获取到的企业ID:', enterpriseId)
      
      if (!enterpriseId) {
        console.error('企业ID不存在，无法收藏简历', localUserInfo)
        wx.showToast({
          title: '企业信息不完整',
          icon: 'none'
        })
        return
      }
      
      // 获取用户ID
      const userId = localUserInfo?.id || localUserInfo?.userId || localUserInfo?.user_id || ''
      
      app.request({
        url: 'enterpriseCollectResume',
        method: 'POST',
        data: { 
          resumeId: resume.id,
          enterpriseId: enterpriseId, // 添加企业ID
          enterprise_id: enterpriseId, // 兼容下划线命名
          userId: userId, // 添加用户ID
          user_id: userId, // 兼容下划线命名
          id: userId // 兼容直接使用id作为用户ID
        },
        loadingTitle: '收藏中...',
        success: (res) => {
          if (res.data.code === 200) {
            resume.isCollected = !isCollected
            resumes[index] = resume
            this.setData({ resumes })
            wx.showToast({
              title: '收藏成功',
              icon: 'success'
            })
          }
        }
      })
    }
  },

  /**
   * 生命周期函数--监听页面上拉触底事件
   */
  onReachBottom: function () {
    this.getResumeList()
  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {
    this.getResumeList(true)
  }
})