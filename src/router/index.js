import Vue from 'vue'
import Router from 'vue-router'

Vue.use(Router)

/* Layout */
import Layout from '@/layout'
import HomePage from '@/views/homepage'

/**
 * Note: sub-menu only appear when route children.length >= 1
 * Detail see: https://panjiachen.github.io/vue-element-admin-site/guide/essentials/router-and-nav.html
 *
 * hidden: true                   if set true, item will not show in the sidebar(default is false)
 * alwaysShow: true               if set true, will always show the root menu
 *                                if not set alwaysShow, when item has more than one children route,
 *                                it will becomes nested mode, otherwise not show the root menu
 * redirect: noRedirect           if set noRedirect will no redirect in the breadcrumb
 * name:'router-name'             the name is used by <keep-alive> (must set!!!)
 * meta : {
    roles: ['admin','editor']    control the page roles (you can set multiple roles)
    title: 'title'               the name show in sidebar and breadcrumb (recommend set)
    icon: 'svg-name'/'el-icon-x' the icon show in the sidebar
    breadcrumb: false            if set false, the item will hidden in breadcrumb(default is true)
    activeMenu: '/example/list'  if set path, the sidebar will highlight the path you set
  }
 */

/**
 * constantRoutes
 * a base page that does not have permission requirements
 * all roles can be accessed
 */
export const constantRoutes = [
  {
    path: '/login',
    component: () => import('@/views/login/index'),
    hidden: true
  },
  {
    path: '/',
    redirect: '/homepage',
    component: HomePage
  },
  {
    path: '/homepage',
    component: HomePage,
    meta: { title: '主页', icon: 'dashboard' }
  },
  {
    path: '/404',
    component: () => import('@/views/404'),
    hidden: true
  },
  {
    path: '/reagent',
    component: Layout,
    name: 'Reagent',
    meta: { title: '试剂管理', icon: 'el-icon-s-help' },
    hidden: true,
    children: [
      {
        path: 'list',
        name: 'ReagentList',
        component: () => import('@/views/reagent/list'),
        meta: { title: '试剂列表', icon: 'list' }
      },
      {
        path: 'create',
        name: 'ReagentCreate',
        component: () => import('@/views/reagent/create'),
        meta: { title: '新建试剂', icon: 'edit' }
      },
      {
        path: 'edit/:id(\\d+)',
        name: 'ReagentEdit',
        component: () => import('@/views/reagent/edit'),
        meta: { title: '试剂详情', noCache: true, icon: 'edit' },
        hidden: true
      },
      {
        path: 'take',
        name: 'ReagentTake',
        component: () => import('@/views/reagent/take'),
        meta: { title: '试剂取出', noCache: true, icon: 'edit' },
        hidden: true
      },
      {
        path: 'store',
        name: 'ReagentStore',
        component: () => import('@/views/reagent/store'),
        meta: { title: '试剂归还', noCache: true, icon: 'edit' },
        hidden: true
      }
    ]
  },

  {
    path: 'external-link',
    component: Layout,
    children: [
      {
        path: 'https://panjiachen.github.io/vue-element-admin-site/#/',
        meta: { title: '退出登陆', icon: 'link' }
      }
    ]
  },

  // 404 page must be placed at the end !!!
  { path: '*', redirect: '/404', hidden: true }
]

const createRouter = () => new Router({
  // mode: 'history', // require service support
  scrollBehavior: () => ({ y: 0 }),
  routes: constantRoutes
})

const router = createRouter()

// Detail see: https://github.com/vuejs/vue-router/issues/1234#issuecomment-357941465
export function resetRouter () {
  const newRouter = createRouter()
  router.matcher = newRouter.matcher // reset router
}

export default router
