import { ref, nextTick, getCurrentInstance } from 'vue'
import { preview } from '@/utils/remoteFunc.ts'
import { isImage, gDownload } from '@/utils/gFunc.ts'
import { $toast } from 'oeos-components'

import { deleteOne, objectPropertyDetail } from '@/api/bucketReview'

export const useBtns = (RestoreExpirationInDaysRef, bucketOverviewHistoryRef, BucketFileDetailsCompRef, init) => {
  const { proxy } = getCurrentInstance()
  const btns = ref([])
  const isChange = ref(false)
  const detailRow = async (row) => {
    let params = {
      bucket: row.bucket,
      key: row.key,
    }
    let res = await objectPropertyDetail(params)
    BucketFileDetailsCompRef.value.open(res)
  }
  async function deleteRow(row) {
    let params = {
      bucket: row.bucket,
      key: row.name,
    }
    await deleteOne(params)
    $toast('删除成功')
    init()
  }
  btns.value = {
    label: '操作',
    prop: 'operation',
    width: proxy.$dev ? 300 : 200,
    maxBtns: proxy.$dev ? 10 : 3,
    isShow: (row) => {
      return row.injectTime ? true : false
    },
    btns: [
      { content: '详情', handler: detailRow },
      { content: '下载', handler: gDownload },
      { content: '删除', handler: deleteRow }, // reConfirm: true,
      {
        content: '恢复',
        handler: (row) => {
          RestoreExpirationInDaysRef.value.open(row)
        },
      },
      { content: '历史', handler: (row) => bucketOverviewHistoryRef.value.open(row) },
      {
        content: '预览',
        isShow: (row) => {
          return isImage(row.key)
        },
        handler: (row) => preview(row.bucket, row.name),
      },
    ],
  }
  return {
    btns,
    isChange,
  }
}
