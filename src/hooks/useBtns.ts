import { ref, nextTick, getCurrentInstance, computed } from 'vue'
import { preview } from '@/utils/remoteFunc.ts'
import { isImage, gDownload } from '@/utils/gFunc.ts'
import { $toast } from 'oeos-components'
import { useRouter, useRoute } from 'vue-router'

import { deleteOne, objectPropertyDetail } from '@/api/bucketReview'

export const useBtns = (RestoreExpirationInDaysRef, bucketOverviewHistoryRef, BucketFileDetailsCompRef, init) => {
  const route = useRoute()
  const needVersion = ref(false)
  if (route.name === 'Objectexplorer') {
    needVersion.value = false
  } else {
    needVersion.value = true
  }
  const { proxy } = getCurrentInstance()
  const isChange = ref(false)
  const detailRow = async (row) => {
    let params = {
      bucket: row.bucket,
      key: row.key,
    }
    if (needVersion.value) {
      params.version = row.version
    }
    let res = await objectPropertyDetail(params)
    BucketFileDetailsCompRef.value.open(res)
  }
  async function deleteRow(row) {
    let params = {
      bucket: row.bucket,
      key: row.key,
    }
    if (needVersion.value) {
      params.version = row.version
    }
    await deleteOne(params)
    $toast('删除成功')
    init()
  }
  const downloadRow = async (row) => {
    return gDownload(row, needVersion.value)
  }
  const btns = computed(() => {
    let baseObj = {
      label: '操作',
      prop: 'operation',

      isShow: (row) => {
        return row.injectTime ? true : false
      },
      btns: [
        {
          content: '详情',
          handler: detailRow,
          comp: 'o-icon',
          attrs: {
            type: 'svg',
            name: 'detail',
            content: '详情',
          },
        },
        {
          content: '下载',
          handler: downloadRow,
          comp: 'o-icon',
          attrs: {
            type: 'svg',
            name: 'download',
            content: '下载',
          },
        },
        {
          content: '删除',
          handler: deleteRow,
          comp: 'o-icon',
          attrs: {
            name: 'delete',
            type: 'svg',
            content: '删除',
          },
          reConfirm: !proxy.$dev,
        },
        {
          content: '恢复',
          handler: (row) => {
            RestoreExpirationInDaysRef.value.open(row, needVersion.value)
          },
        },
        {
          content: '历史',
          handler: (row) => bucketOverviewHistoryRef.value.open(row),
        },
        {
          content: '预览',
          isShow: (row) => {
            return isImage(row.key)
          },
          handler: (row) => preview(row.bucket, row.name, row, needVersion.value),
        },
      ],
    }
    if (proxy.$dev) {
      baseObj.width = 300
      baseObj.maxBtns = 10
    }
    return baseObj
  })
  return {
    btns,
    isChange,
  }
}
