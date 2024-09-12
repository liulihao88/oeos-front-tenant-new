import { $toast, getStorage } from 'oeos-components'
function gDownType(item) {
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
  let _href = parseOrigin + getUrl + dataUrl + `&Authorization=${getStorage('oeos-token')}`
  window.location.href = _href
}
