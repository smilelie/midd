export function fetchList (params) {
  return window.callSvc('reagent.list', params)
}

export function fetchReagent (data) {
  return window.callSvc('login.login', data)
}

export function createReagent (data) {
  return window.callSvc('reagent.new', data)
}

export function updateReagent (data) {
  return window.callSvc('reagent.update', data)
}

export function unlockReagent (data) {
  return window.callSvc('reagent.unlock', data)
}

export function bind (data) {
  return window.callSvc('reagent.bind', data)
}
