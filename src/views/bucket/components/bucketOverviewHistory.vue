<script setup lang="ts">
import { ref, getCurrentInstance, computed } from 'vue'
const { proxy } = getCurrentInstance()
import {
  getHistory,
  deleteOne,
  deleteBatch,
  objectDownloadBatch,
  objectRestoreBatch,
  objectRestore,
} from '@/api/bucketReview.ts'
const isShow = ref(false)
const data = ref([])
const props = defineProps({
  bucketName: {
    type: String,
  },
})

const selections = ref([])
const rowDetails = ref({})
const pageNumber = ref(proxy.PAGE_NUMBER)
const pageSize = ref(proxy.PAGE_SIZE)

const selectDisabled = computed(() => {
  return selections.value.length === 0
})
const init = async (isReset = false) => {
  if (isReset) {
    pageSize.value = PAGE_SIZE
    pageNumber.value = PAGE_NUMBER
  }
  let params = {
    key: rowDetails.value.name,
    bucket: props.bucketName || rowDetails.value.bucket,
    pageSize: pageSize.value,
    pageNumber: pageNumber.value,
  }
  let res = await getHistory(params)
  data.value = res
}
const open = async (row) => {
  rowDetails.value = row
  await init()
  isShow.value = true
}
const deleteRow = async (row) => {
  let params = {
    bucket: props.bucketName,
    key: row.name,
  }
  await deleteOne(params)
  proxy.$toast('删除成功!')
  init()
}
const restoreRow = async (row) => {
  let params = {
    bucket: props.bucketName,
    key: row.key,
  }
  let res = await objectRestore(params)
  proxy.$toast(res)
}
const update = (num, size) => {
  pageSize.value = size
  pageNumber.value = num
  init()
}

const multyRestore = async () => {
  await objectRestoreBatch(selections.value)
  proxy.$toast('批量恢复成功')
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
    label: '文件名',
    prop: 'name',
  },
  {
    label: '文件大小',
    prop: 'size',
    filter: proxy.formatBytes,
  },
  {
    label: '存储类型',
    prop: 'storageClass',
  },
  {
    label: '对象内容md5值',
    prop: 'chechsum',
  },
  {
    label: '版本',
    prop: 'version',
  },
  {
    label: '更新时间',
    prop: 'lastModifiedTime',
    filter: (val) => proxy.formatTime(val),
  },
  {
    label: '操作',
    prop: 'operation',
    maxBtns: 4,
    btns: [
      { content: '下载', handler: proxy.gDownload },
      { content: '恢复', handler: restoreRow },
      { content: '删除', handler: deleteRow },
    ],
  },
]
defineExpose({
  open,
})
</script>

<template>
  <o-dialog ref="dialogRef" v-model="isShow" title="历史版本" width="80%">
    <div class="mb2 f-ed-ct">
      <el-button type="primary" icon="el-icon-download" :disabled="selectDisabled" @click="batchDownload">
        批量下载
      </el-button>

      <el-button type="primary" icon="el-icon-refresh-left" :disabled="selectDisabled" @click="multyRestore">
        批量恢复
      </el-button>
      <el-button type="primary" icon="el-icon-delete" :disabled="selectDisabled" @click="multypleDelete">
        批量删除
      </el-button>
    </div>
    <o-table
      :columns="columns"
      :data="data"
      height="calc(100vh - 500px)"
      :pageSize="pageSize"
      @selection-change="selectionChange"
      @update="update"
    />
  </o-dialog>
</template>
