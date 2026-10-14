import Vue from 'vue'
import VueRouter from 'vue-router'
import Home from '../views/Home.vue'
import { Message }from 'element-ui'
import NProgress from 'nprogress'
import 'nprogress/nprogress.css'
import Login from '@/views/Login';
import Welcome from "@/views/Welcome";
import Register from "../views/Register";
import Carousel from "../views/vaccine/Carousel";
import Statistics from "../views/vaccine/Statistics";
import EnterpriseInfo from "../views/vaccine/EnterpriseInfo";
import JobCategoryInfo from "../views/vaccine/JobCategoryInfo";
import JobInfo from "../views/vaccine/JobInfo";
import JobAudit from "../views/vaccine/JobAudit";
import CommentInfo from "../views/vaccine/CommentInfo";
import ComplaintInfo from "../views/vaccine/ComplaintInfo";
import UserInfo from "@/views/user/UserInfo";
import UserInfo2 from "@/views/user/UserInfo2";
import Userm from "@/views/user/Userm";
import ResourceInfo from "@/views/role/ResourceInfo";
import RoleInfo from "@/views/role/RoleInfo";
import Error404 from "@/views/Error404";

Vue.use(VueRouter)

const routes = [

  {
    path: '/',
    component: Login,
    redirect: '/login'
  },
  {
    path: '/login',
    component: Login
  },
  {
    path: '/home',
    component: Home,
    redirect: '/welcome',
    children: [
      { path: '/welcome', component: Welcome },
      { path: '/carousel', component: Carousel, meta: { btnPermission: 'admin' }},
      { path: '/statistics', component: Statistics, meta: { btnPermission: 'admin' }},
      { path: '/enterprise', component: EnterpriseInfo, meta: { btnPermission: 'admin' }},
      { path: '/jobCategory', component: JobCategoryInfo, meta: { btnPermission: 'admin' }},
      { path: '/jobInfo', component: JobInfo, meta: { btnPermission: 'admin' } },
      { path: '/jobAudit', component: JobAudit, meta: { btnPermission: 'admin' } },
      { path: '/comment', component: CommentInfo, meta: { btnPermission: 'admin' } },
      { path: '/complaint', component: ComplaintInfo, meta: { btnPermission: 'admin' } },
      { path: '/user', component: UserInfo, meta: { btnPermission: 'admin' }},
      { path: '/user2', component: UserInfo2, meta: { btnPermission: 'admin' }},
      { path: '/userm', component: Userm, meta: { btnPermission: 'admin' }},
      { path: '/role', component: RoleInfo, meta: { btnPermission: 'admin' }},
      { path: '/resource', component: ResourceInfo, meta: { btnPermission: 'admin' }},
    ]
  },
  {
    path: '/register',
    component: Register
  },
  
  {
    path: '/*',
    component: Error404
  }
]

const router = new VueRouter({
  routes,
  mode: 'history',
})

//挂载路由导航守卫
router.beforeEach((to, from, next) =>{
  //to 将要访问的路径
  //from 从哪个页面来
  //next 一个放行函数

  if(to.path == '/login' || to.path == '/404' || to.path == '/register') return next();

  //顶部进度条
  NProgress.start()
  //获取token
  const token = window.sessionStorage.getItem("token")
  if(!token){
    Message.error('抱歉，请先登录')
    return next('/login');
  }
  next();
})

router.afterEach(() => {
  NProgress.done()
})

const originalPush = VueRouter.prototype.push
VueRouter.prototype.push = function push(location){
  return originalPush.call(this, location).catch(err => err)
}


export default router
