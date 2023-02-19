import request from '@/utils/request'
import qs from 'qs'

export function categorys() {
  return request({
    url: '/categorys/0',
    method: 'get'
  })
}

export function remove(id) {
  return request({
    url: '/categorys/' + id,
    method: 'delete'
  })
}

export function create(data) {
  return request({
    url: '/categorys',
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

export function update(data) {
  return request({
    url: '/categorys',
    method: 'put',
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
