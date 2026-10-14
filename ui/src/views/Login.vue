<template>
  <div class="login-wrap">
    <div class="login-content">
      <el-form label-position="left" :model="loginForm" :rules="loginFormRules" ref="loginFormRef" label-width="0px"
        class="login-container">
        <!-- 系统Logo和标题 -->
        <div class="login-header">
          <div class="logo">
            <i class="el-icon-medical"></i>
          </div>
          <h3 class="title">大学生兼职小程序后台</h3>
        </div>
        
        <!-- 登录表单 -->
        <el-form-item prop="userName">
          <div class="input-wrapper">
            <i class="el-icon-user"></i>
            <el-input type="text" v-model="loginForm.userName" auto-complete="off" placeholder="账号"></el-input>
          </div>
        </el-form-item>
        
        <el-form-item prop="password">
          <div class="input-wrapper">
            <i class="el-icon-lock"></i>
            <el-input type="password" v-model="loginForm.password" auto-complete="off" placeholder="密码"></el-input>
          </div>
        </el-form-item>
        
        <el-form-item>
          <el-button type="primary" @click="login" style="width:100%">点击登录</el-button>
        </el-form-item>
      </el-form>
      
      <!-- 系统版权信息 -->
      <div class="copyright">
        <p>© 2025 智能陪诊系统 版权所有</p>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: "Login",
  data() {
    return {
      //登录表单数据对象
      loginForm: {
        userName: "admin",
        password: "000000"
      },
      //表单验证规则
      loginFormRules: {
        //验证用户名
        userName: [
          { required: true, message: "请输入用户名称", trigger: "blur" },
          { min: 2, max: 20, message: "长度在2到20个字符之间", trigger: "blur" }
        ],
        //验证密码
        password: [
          { required: true, message: "请输入密码", trigger: "blur" },
          { min: 6, max: 16, message: "长度在6到16个字符之间", trigger: "blur" }
        ]
      },
      //加载状态
      loading: false
    };
  },
  methods: {
    registerAccount() {
      this.$router.push("/register");
    },
    login() {
      this.loading = true;
      this.$refs.loginFormRef.validate(async valid => {
        if (!valid) {
          this.loading = false;
          return;
        }
        try {
          axios.defaults.headers.post["Content-Type"] = "application/json";
          const { data: res } = await axios.post(
            "sysUser/login",
            JSON.stringify(this.loginForm)
          );
          if (res.code != 200) return this.$message.error(res.msg);
          this.$message.success("登录成功");
          window.sessionStorage.setItem("token", res.data.token);
          window.sessionStorage.setItem(
            "loginUser",
            JSON.stringify({
              sysUser: res.data.sysUser,
              cinemaId: res.data.cinemaId,
              cinemaName: res.data.cinemaName
            })
          );
          window.sessionStorage.setItem(
            "btnPermission",
            res.data.sysUser.roleId === 1 ? "admin" : "normal"
          );
          //导航跳转到首页
          this.$router.push("/welcome");
        } catch (error) {
          this.$message.error("登录失败，请检查网络连接");
          this.loading = false;
        }
      });
    }
  }
};
</script>

<style scoped>
/* 全局样式重置 */
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

/* 登录页面背景 */
.login-wrap {
  width: 100%;
  height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  background-size: cover;
  background-position: center;
  background-attachment: fixed;
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  overflow: hidden;
}

/* 登录内容容器 */
.login-content {
  width: 100%;
  max-width: 420px;
  padding: 0 20px;
  animation: fadeInUp 0.6s ease-out;
}

/* 登录表单容器 */
.login-container {
  background: rgba(255, 255, 255, 0.95);
  padding: 40px 30px;
  border-radius: 16px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.2);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.3);
  transition: all 0.3s ease;
}

.login-container:hover {
  box-shadow: 0 25px 70px rgba(0, 0, 0, 0.25);
  transform: translateY(-2px);
}

/* 登录头部 */
.login-header {
  text-align: center;
  margin-bottom: 30px;
}

/* Logo */
.logo {
  width: 80px;
  height: 80px;
  margin: 0 auto 20px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 50%;
  display: flex;
  justify-content: center;
  align-items: center;
  font-size: 40px;
  color: white;
  box-shadow: 0 10px 30px rgba(102, 126, 234, 0.4);
  animation: pulse 2s ease-in-out infinite;
}

/* 标题 */
.title {
  font-size: 24px;
  font-weight: 700;
  color: #333;
  margin: 0;
  letter-spacing: 1px;
}

/* 输入框容器 */
.input-wrapper {
  position: relative;
  margin-bottom: 20px;
  border-radius: 8px;
  background: #f5f7fa;
  transition: all 0.3s ease;
  overflow: hidden;
}

.input-wrapper:hover {
  background: #e8ecf1;
}

.input-wrapper i {
  position: absolute;
  left: 15px;
  top: 50%;
  transform: translateY(-50%);
  color: #909399;
  font-size: 18px;
  transition: all 0.3s ease;
}

/* 登录按钮 */
.login-btn {
  width: 100%;
  height: 50px;
  border-radius: 8px;
  font-size: 16px;
  font-weight: 600;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border: none;
  color: white;
  cursor: pointer;
  transition: all 0.3s ease;
  letter-spacing: 1px;
  margin-top: 10px;
}

.login-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 10px 25px rgba(102, 126, 234, 0.4);
}

/* 系统版权信息 */
.copyright {
  text-align: center;
  margin-top: 25px;
  color: rgba(255, 255, 255, 0.8);
  font-size: 14px;
}

.copyright p {
  margin: 0;
}

/* 动画效果 */
@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes pulse {
  0%, 100% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.05);
  }
}

/* 响应式设计 */
@media (max-width: 480px) {
  .login-container {
    padding: 30px 25px;
  }
  
  .title {
    font-size: 20px;
  }
  
  .logo {
    width: 60px;
    height: 60px;
    font-size: 30px;
  }
}
</style>