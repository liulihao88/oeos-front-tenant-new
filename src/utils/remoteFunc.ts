import { api as viewerApi } from 'v-viewer'
import { previewImage } from '@/api/spaceScan.ts'
import { $toast } from 'oeos-components'

export const preview = async (bucketName, key, row) => {
  const params = {
    bucket: bucketName,
    key: key,
    version: row.version,
  }
  let res = await previewImage(params)
  if (res?.status !== 200 || !res) {
    return $toast(res?.data?.message || '请求错误', 'error')
  }
  const byteArray = new Uint8Array(res.data) // 将二进制数据流转换为字节数组
  const blob = new Blob([byteArray]) // 创建Blob对象
  const imgUrl = URL.createObjectURL(blob) // 创建一个URL，用于表示blob对象
  viewerApi({
    images: [imgUrl],
  })
}
