<script setup lang="ts">
import { ref, getCurrentInstance, computed } from 'vue'
const { proxy } = getCurrentInstance()
const isShow = ref(false)

const details = ref({})
const options = computed(() => {
  return [
    { label: '租户', value: details.value.tenant },
    { label: '存储桶名称', value: details.value.bucket },
    {
      label: '对象写入时间',
      value: () => {
        return proxy.formatTime(details.value.injectTime)
      },
    },
    {
      label: '对象更新时间',
      value: () => {
        return proxy.formatTime(details.value.lastModifiedTime)
      },
    },
    { label: '对象内容md5值', value: details.value.checksum },
    { label: '对象分片数量', value: details.value.partCount },
    { label: '对象大小', value: details.value.size },
    { label: '对象存储类型', value: details.value.storageClass },
    { label: '对象名称', value: details.value.name },
    { label: '对象版本号', value: details.value.version },
  ]
})

const data = ref([])
const columns = [
  {
    label: '存储',
    prop: 'storage',
  },
  {
    label: '区域',
    prop: 'region',
  },
  {
    label: '位置',
    prop: 'location',
  },
]

const open = (sendDetails) => {
  console.log(`58 details`, details)
  details.value = sendDetails
  isShow.value = true
}

defineExpose({
  open,
})
</script>

<template>
  <div>
    <o-dialog ref="dialogRef" v-model="isShow" title="文件详情" width="80%">
      <o-description :column="2" :options="options" label-width="140" />

      <o-title title="存储位置" tb="20" />
      <o-table ref="tableRef" :columns="columns" :data="details.contentLocations" :showPage="false" />
    </o-dialog>
  </div>
</template>
