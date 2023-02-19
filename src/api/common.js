import request from '@/utils/request'
// import qs from 'qs'

export function generateBarCode() {
  return request({
    url: '/until/bar_code',
    method: 'get'
  })
}
