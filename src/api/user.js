import request from '@/utils/request'

export function login (data) {
  console.log('login callSvc: ' + data)

  return window.callSvc('login.login', data)
  // return request({
  //   url: '/vue-admin-template/user/login',
  //   method: 'post',
  //   data
  // })
}

// export function getInfo (token) {
//   return request({
//     url: '/vue-admin-template/user/info',
//     method: 'get',
//     params: { token }
//   })
// }
export function secondAuth (data) {
  return window.callSvc('login.login2', data)
}

export function logout () {
  return window.callSvc('login.logout')
}
