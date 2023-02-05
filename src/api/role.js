import request from '@/utils/request'
import qs from 'qs'

export function vaildRoleList() {
  return request({
    url: '/role',
    method: 'get'
  })
}

export function assignRole(data) {
  return request({
    url: '/role/change_role/' + data.userName,
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
