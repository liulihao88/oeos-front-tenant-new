<script setup lang="ts">
import { ref, getCurrentInstance, computed } from 'vue'
const { proxy } = getCurrentInstance()

import { getHistory, deleteOne, deleteBatch, objectDownloadBatch, objectPropertyDetail } from '@/api/bucketReview.ts'
import BucketFileDetailsComp from '@/views/bucket/components/bucketFileDetailsComp.vue'

const isShow = ref(false)
const data = ref([])
const BucketFileDetailsCompRef = ref(null)
const RestoreExpirationInDaysRef = ref(null)
import RestoreExpirationInDays from '@/components/restoreExpirationInDays.vue'
const props = defineProps({
  bucketName: {
    type: String,
  },
})

const selections = ref([])
const rowDetails = ref({})
const prevHisList = ref([])
const pageMarker = ref()
const versionIdMarker = ref()

const init = async (isReset = false) => {
  if (isReset) {
  }
  let params = {
    key: rowDetails.value.key,
    bucket: props.bucketName || rowDetails.value.bucket,
    pageMarker: pageMarker.value,
    versionIdMarker: versionIdMarker.value,
  }
  let res = await getHistory(params)
  data.value = res
}

const detailRow = async (row) => {
  let params = {
    bucket: row.bucket,
    key: row.key,
    version: row.version,
  }
  let res = await objectPropertyDetail(params)
  BucketFileDetailsCompRef.value.open(res)
}

const open = async (row) => {
  rowDetails.value = row
  await init()
  isShow.value = true
}
const deleteRow = async (row) => {
  let params = {
    bucket: props.bucketName || rowDetails.value.bucket,
    key: row.key,
    version: row.version,
  }
  await deleteOne(params)
  proxy.$toast('删除成功!')
  init()
}

const selectionChange = (val, ...a) => {
  selections.value = val
}
const batchDownload = async () => {
  let res = await objectDownloadBatch(selections.value)
  proxy.gDownloadAll(res)
}
const multypleDelete = async () => {
  await deleteBatch(selections.value)
  proxy.$toast('删除成功!')
  init()
}
const columns = [
  {
    type: 'selection',
  },
  {
    label: '文件名称',
    prop: 'name',
  },
  {
    label: '文件大小',
    prop: 'size',
    filter: proxy.formatBytes,
    width: 100,
  },
  {
    label: '存储类型',
    prop: 'storageClass',
  },
  {
    label: '对象版本号',
    prop: 'version',
  },
  {
    label: '更新时间',
    prop: 'lastModifiedTime',
    filter: (val) => proxy.formatTime(val),
    width: proxy.TIME_WIDTH,
    align: 'center',
  },
  {
    label: '写入时间',
    prop: 'injectTime',
    filter: (val) => proxy.formatTime(val),
    width: proxy.TIME_WIDTH,
    align: 'center',
  },
  {
    label: '操作',
    prop: 'operation',
    maxBtns: 4,
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
        handler: proxy.gDownload,
        comp: 'o-icon',
        attrs: {
          type: 'svg',
          name: 'download',
          content: '下载',
        },
      },
      {
        content: '恢复',
        handler: (row) => {
          RestoreExpirationInDaysRef.value.open(row)
        },
        comp: 'o-icon',
        attrs: {
          type: 'svg',
          name: 'restore',
          content: '恢复',
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
    ],
  },
]
const prev = () => {
  let popList = prevHisList.value.pop()
  pageMarker.value = popList.key
  versionIdMarker.value = popList.version
  init()
}
const next = () => {
  pageMarker.value = data.value.at(-1).key
  versionIdMarker.value = data.value.at(-1).version
  prevHisList.value.push({
    pageMaker: pageMarker.value,
    versionIdMarker: versionIdMarker.value,
  })
  init()
}
defineExpose({
  open,
})
</script>

<template>
  <div>
    <o-dialog ref="dialogRef" v-model="isShow" title="历史版本" width="80%">
      <div class="mb2 f-ed-ct">
        <o-popconfirm
          content="确定要批量下载吗? "
          title="批量下载"
          :reConfirm="selections.length > 0"
          class="mr"
          @confirm="batchDownload"
        >
          <el-button type="primary" icon="el-icon-download" :disabled="selections.length === 0">批量下载</el-button>
        </o-popconfirm>

        <el-button
          type="primary"
          :disabled="selections.length === 0"
          @click="RestoreExpirationInDaysRef.open(selections)"
        >
          <template #icon>
            <o-svg name="restore" />
          </template>
          批量恢复
        </el-button>

        <o-popconfirm
          content="确定要批量删除吗? "
          title="批量删除"
          :reConfirm="selections.length > 0"
          class="mlr"
          @confirm="multypleDelete"
        >
          <el-button type="primary" icon="el-icon-download" :disabled="selections.length === 0">批量删除</el-button>
        </o-popconfirm>
      </div>
      <o-table
        :columns="columns"
        :data="data"
        height="calc(100vh - 500px)"
        class="mb2"
        :showPage="false"
        @selection-change="selectionChange"
      />

      <div class="mt2 f-ed-ct">
        <el-button type="primary" :disabled="prevHisList.length === 0" @click="prev">上一页</el-button>
        <el-button type="primary" :disabled="data.length < 20" @click="next">下一页</el-button>
      </div>
    </o-dialog>
    <RestoreExpirationInDays ref="RestoreExpirationInDaysRef" />
    <BucketFileDetailsComp ref="BucketFileDetailsCompRef" />
  </div>
</template>
