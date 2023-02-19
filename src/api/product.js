import request from '@/utils/request'
import qs from 'qs'

export function page(params) {
  return request({
    url: '/product/page',
    method: 'get',
    params
  })
}

export function deleteProduct(id) {
  return request({
    url: '/product/' + id,
    method: 'delete'
  })
}

export function productDetail(id) {
  return request({
    url: '/product/' + id,
    method: 'get'
  })
}

export function create(data) {
  return request({
    url: '/product',
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
    url: '/product',
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
