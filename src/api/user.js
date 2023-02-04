import request from '@/utils/request'
import qs from 'qs'

export function login(data) {
  return request({
    url: '/user/login',
    method: 'post',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'
    },
    transformRequest: [
      function(data) {
        var ret = ''
        for (var it in data) {
          ret += encodeURIComponent(it) + '=' + encodeURIComponent(data[it]) + '&'
        }
        ret = ret.substring(0, ret.lastIndexOf('&'))
        return ret
      }
    ],
    data
  })
}

export function getInfo(token) {
  return request({
    url: '/user/me',
    method: 'get',
    params: { token }
  })
}

export function logout() {
  return request({
    url: '/vue-admin-template/user/logout',
    method: 'post'
  })
}

export function list() {
  return request({
    url: '/user/list',
    method: 'get'
  })
}

export function createUser(data) {
  return request({
    url: '/user/employee',
    method: 'post',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'
    },
    transformRequest: [
      function(data) {
        return qs.stringify(data)
      }
    ],
    data
  })
}

export function deleteUser(id) {
  return request({
    url: '/user/employee/' + id,
    method: 'delete'
  })
}

export function updateUser(data) {
  return request({
    url: '/user/employee/' + data.id,
    method: 'put',
    data
  })
}
