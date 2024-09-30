import request from '@/utils/request'

export function previewImage(params) {
  return request('object/download', {
    params: params,
    responseType: 'arraybuffer',
    customResponse: true,
  })
}
