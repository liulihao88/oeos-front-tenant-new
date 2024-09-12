<script setup lang="ts">
import { ref, getCurrentInstance } from 'vue'
const { proxy } = getCurrentInstance()
import { getHistory } from '@/api/bucketReview.ts'
const isShow = ref(false)
const datas = ref([])
const props = defineProps({
  bucketName: {
    type: String,
  },
})
const open = async (row) => {
  // datas.value = row;
  let params = {
    key: row.name,
    bucket: props.bucketName,
  }
  await getHistory(params)
  isShow.value = true
}
const columns = [
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
    label: '版本',
    prop: 'version',
  },
  {
    label: '更新时间',
    prop: 'lastModifiedTime',
    filter: proxy.formatTime,
  },
  {
    label: '操作',
    prop: 'operation',
    btns: [{ content: '下载', handler: proxy.gDownType }],
  },
]
defineExpose({
  open,
})
</script>

<template>
  <o-dialog ref="dialogRef" v-model="isShow" title="历史版本" width="80%">
    <o-table :columns="columns" :data="datas" :showPage="false" />
  </o-dialog>
</template>
