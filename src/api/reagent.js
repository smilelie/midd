import request from '@/utils/request'

const base_url = '/vue-element-admin/'

export function fetchList (params) {
  const url = '/vue-admin-template/reagent/list'
  return request({
    url,
    method: 'get',
    params
  })
}

export function fetchReagent (id) {
  return request({
    url: base_url + 'reagent/detail',
    method: 'get',
    params: { id }
  })
}

export function createReagent (data) {
  return request({
    url: base_url + 'reagent/create',
    method: 'post',
    params: { data }
  })
}
export function updateReagent (data) {
  return request({
    url: base_url + 'reagent/update',
    method: 'post',
    params: { data }
  })
}
