import Vue from 'vue'

import 'normalize.css/normalize.css' // A modern alternative to CSS resets

import ElementUI from 'element-ui'
import 'element-ui/lib/theme-chalk/index.css'
// import locale from 'element-ui/lib/locale/lang/en' // lang i18n

import '@/styles/index.scss' // global css

import App from './App'
import store from './store'
import router from './router'

import '@/icons' // icon
import '@/permission' // permission control

import './config'

window.callSvc = function (apiInfo, params, fn) {
  var err = apiSvc.svc(apiInfo, params || {}, function (ok, rslt, ext) {
    if (ok) {
      if (fn) fn(ok, rslt, ext)
    } else {
      if (ext) {
        if (ext.accessDenied) {
          // 清除token信息并跳转到登录页面
          store.commit('logout')
          router.replace({
            path: 'login',
            query: {
              redirect: router.currentRoute.fullPath
            }
          })
          return
        } else if (ext.refresh) {
          // 刷新页面
          window.location.reload()
          return
        }
      }
      if (fn) fn(ok, rslt, ext)
    }
  })
  if (err && fn) {
    fn(false, null, {
      clientErr: err
    })
  }
}

/**
 * If you don't want to use mock-server
 * you want to use MockJs for mock api
 * you can execute: mockXHR()
 *
 * Currently MockJs will be used in the production environment,
 * please remove it before going online ! ! !
 */
if (process.env.NODE_ENV === 'production') {
  const { mockXHR } = require('../mock')
  mockXHR()
}

// set ElementUI lang to EN
// Vue.use(ElementUI, { locale })
// 如果想要中文版 element-ui，按如下方式声明
Vue.use(ElementUI)

Vue.config.productionTip = false

new Vue({
  el: '#app',
  router,
  store,
  render: h => h(App)
})
