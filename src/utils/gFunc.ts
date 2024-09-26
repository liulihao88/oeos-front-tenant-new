import { $toast, getStorage } from 'oeos-components'
import settings from '@/config/settings.ts'
export function gDownload(item) {
  console.log(`34 item`, item)

  if (!item.bucket) {
    $toast('不是有效数据，不支持下载!', 'warn')
    return false
  } else {
    if (item.bucket.length <= 0) {
      $toast('不是有效数据，不支持下载!', 'warn')
    }
  }
  let getUrl = `/v1/admin/tenant/object/download` //接口
  let bucketName = item.bucket ? item.bucket : ''
  let objectKey = item.key ? item.key : ''
  let objectVersionID = item.version ? item.version : ''
  let dataUrl = `?bucket=${bucketName}&key=${encodeURIComponent(objectKey)}&version=${objectVersionID}`
  let baseUrl = import.meta.env.DEV ? settings.url : window.origin
  let _href = baseUrl + getUrl + dataUrl + `&Authorization=${getStorage('tenant-token')}`
  console.log(`41 _href`, _href)
  window.location.href = _href
}
