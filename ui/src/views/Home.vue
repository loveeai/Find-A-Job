<template>
  <el-container class="home-container">
    <el-header>
      <div class="span-container" @click="toWelcome">校园兼职小程序后台</div>
      <el-dropdown @command="handleCommand">
        <span class="el-dropdown-link">
          超级管理员
          <i class="el-icon-arrow-down el-icon--right"></i>
        </span>
        <el-dropdown-menu slot="dropdown">
          <el-dropdown-item command="logout">退出登录</el-dropdown-item>
        </el-dropdown-menu>
      </el-dropdown>
    </el-header>

    <el-container>
      <el-aside :width="isCollapsed ? '64px' : '250px'">
        <div class="toggle-button" @click="toggleCollapse">|||</div>
        <el-menu
          background-color="#39424b"
          text-color="#fff"
          active-text-color="#ffd04b"
          unique-opened
          :collapse="isCollapsed"
          :collapse-transition="false"
          :router="true"
          :default-active="$route.path"
        >
          <el-submenu v-for="item in menulist" :key="item.id" :index="String(item.id)">
            <template slot="title">
              <i class="el-icon-menu"></i>
              <span>{{ item.name }}</span>
            </template>
            <el-menu-item v-for="subItem in item.children" :key="subItem.id" :index="'/' + subItem.path">
              <i class="el-icon-arrow-right"></i>
              <span>{{ subItem.name }}</span>
            </el-menu-item>
          </el-submenu>
        </el-menu>
      </el-aside>

      <el-main>
        <router-view></router-view>
      </el-main>
    </el-container>
  </el-container>
</template>

<script>
export default {
  name: "Home",
  data() {
    return {
      menulist: [
        {
          id: 1,
          name: "用户信息管理",
          children: [
            { id: 1, path: "user2", name: "学生用户管理" },
            { id: 2, path: "user", name: "企业用户管理" }
          ]
        },
        {
          id: 2,
          name: "招聘信息管理",
          children: [
            { id: 1, path: "jobCategory", name: "岗位分类管理" },
            { id: 2, path: "jobInfo", name: "招聘岗位管理" },
            { id: 3, path: "jobAudit", name: "招聘信息审核" },
            { id: 4, path: "enterprise", name: "企业信息管理" },
            { id: 5, path: "comment", name: "评论管理" },
            { id: 6, path: "complaint", name: "投诉管理" }
          ]
        },
        {
          id: 3,
          name: "系统信息管理",
          children: [
            { id: 1, path: "carousel", name: "轮播图管理" },
            { id: 2, path: "statistics", name: "数据统计管理" }
          ]
        }
      ],
      isCollapsed: false
    };
  },
  methods: {
    toggleCollapse() {
      this.isCollapsed = !this.isCollapsed;
    },
    toWelcome() {
      this.$router.push("/statistics");
    },
    handleCommand() {
      window.sessionStorage.clear();
      this.$router.push("/login");
    }
  }
};
</script>

<style scoped>
.home-container {
  height: 100%;
}

.el-header {
  background-color: #39424b;
  display: flex;
  justify-content: space-between;
  padding: 0 24px 0 14px;
  align-items: center;
  color: whitesmoke;
  font-size: 20px;
}

.el-aside {
  background-color: #39424b;
}

.toggle-button {
  background-color: #4a5064;
  font-size: 10px;
  line-height: 24px;
  color: #fff;
  text-align: center;
  letter-spacing: 0.1em;
  cursor: pointer;
}

.span-container {
  cursor: pointer;
  font-weight: 600;
}

.el-main {
  background-color: #f5f5f5;
}

.el-menu {
  border: 0;
}

.el-dropdown-link {
  cursor: pointer;
  color: #409eff;
}

.el-icon-arrow-down {
  font-size: 12px;
}
</style>
