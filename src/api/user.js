import request from '@/utils/request'
// import '../config'

export function login (data) {
  console.log('login callSvc: ' + data)

  debugger
  window.callSvc('login.login', data, function (ok, rslt, ext) {
    console.log(ok)
    console.log(rslt)
    console.log(ext)

    return ok
  })
  // return request({
  //   url: '/vue-admin-template/user/login',
  //   method: 'post',
  //   data
  // })
}

export function getInfo (token) {
  return request({
    url: '/vue-admin-template/user/info',
    method: 'get',
    params: { token }
  })
}

export function logout () {
  return request({
    url: '/vue-admin-template/user/logout',
    method: 'post'
  })
}
