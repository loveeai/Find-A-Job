Component({
  data: {
    selected: 0,
    color: '#999999',
    selectedColor: '#07c160',
    list: [
      {
        pagePath: '/pages/index/index',
        text: '首页',
        iconName: 'wap-home-o',
        selectedIconName: 'wap-home'
      },
      {
        pagePath: '/pages/search/search',
        text: '搜索',
        iconName: 'search',
        selectedIconName: 'search'
      },
      {
        pagePath: '/pages/resume/resume',
        text: '简历',
        iconName: 'notes-o',
        selectedIconName: 'notes'
      },
      {
        pagePath: '/pages/user/user',
        text: '我的',
        iconName: 'user-o',
        selectedIconName: 'user'
      }
    ]
  },

  methods: {
    switchTab(e) {
      const { path, index } = e.currentTarget.dataset
      wx.switchTab({ url: path })
      this.setData({ selected: index })
    }
  },

  lifetimes: {
    attached() {
      const pages = getCurrentPages()
      if (!pages.length) {
        return
      }

      const currentPage = pages[pages.length - 1]
      const currentPath = currentPage && currentPage.route ? `/${currentPage.route}` : ''
      const index = this.data.list.findIndex(item => item.pagePath === currentPath)

      if (index >= 0) {
        this.setData({ selected: index })
      }
    }
  }
})
