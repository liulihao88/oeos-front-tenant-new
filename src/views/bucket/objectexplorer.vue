<script setup lang="ts">
import { ref, computed, getCurrentInstance, nextTick, h } from 'vue'
const { proxy } = getCurrentInstance()
import { getBucketOptions, getObjectList, deleteBatch, deleteOne } from '@/api/bucketReview'
import UploadFile from '@/views/bucket/components/uploadFile.vue'
import BucketOverviewHistory from '@/views/bucket/components/bucketOverviewHistory.vue'

const bucketId = ref()
const bucketName = ref()
const bucketOptions = ref([])
const selectRef = ref(null)
const selections = ref([])
const bucketOverviewHistoryRef = ref(null)

const columns = [
  {
    type: 'selection',
  },
  {
    label: '对象名称',
    prop: 'name',
  },
  {
    label: '文件大小',
    prop: 'size',
    width: 100,
    filter: (value, row) => {
      if (value === 0 && row.lastModifiedTime == null) {
        return ''
      }
      return proxy.formatBytes(value)
    },
  },
  {
    label: '存储类型',
    width: 200,
    prop: 'storageClass',
  },
  {
    label: '对象内容md5值',
    prop: 'chechsum',
  },
  {
    label: '更新时间',
    width: 180,
    prop: 'lastModifiedTime',
    filter: (value) => proxy.formatTime(value),
  },
  {
    label: '操作',
    prop: 'operation',
    width: 300,
    maxBtns: proxy.$dev ? 6 : null,
    btns: [
      { content: '预览' },
      { content: '恢复' },
      { content: '历史', handler: historyRow },
      { content: '详情' },
      { content: '删除', handler: deleteRow }, // reConfirm: true,
      { content: '下载' },
    ],
  },
]
const data = ref([])
const selectDisabled = computed(() => {
  return selections.value.length === 0
})
function easySearch() {}

async function getBucketListInit() {
  let res = await getBucketOptions()
  bucketOptions.value = res
  getTableByBucket()
}
async function getTableByBucket() {
  let storageBucketValue = proxy.getStorage('tenant-bucket-id')
  if (proxy.notEmpty(storageBucketValue)) {
    await nextTick()
    selectRef.value.$refs.selectRef.$emit('change', storageBucketValue)
  }
}
function selectChange(value) {
  bucketId.value = value
  bucketName.value = bucketOptions.value.filter((v) => v.value === bucketId.value)[0].name
  proxy.setStorage('tenant-bucket-id', bucketId.value)
  init()
}
getBucketListInit()
async function init() {
  let sendParams = {
    bucket: bucketName.value,
    pageMarker: '',
    prefixKey: '',
  }
  let res = await getObjectList(sendParams)
  data.value = proxy.clone(res, 1)
}

const selectionChange = (val, ...a) => {
  console.log(`65 val`, val)
  selections.value = val
}
const refresh = () => {
  init()
}
const multypleDelete = async () => {
  await deleteBatch(selections.value)
  proxy.$toast('删除成功!')
  init()
}
async function deleteRow(row) {
  let params = {
    bucket: bucketName.value,
    key: row.name,
  }
  await deleteOne(params)
  proxy.$toast('删除成功!')
  init()
}
async function historyRow(row) {
  bucketOverviewHistoryRef.value.open(row)
}
</script>

<template>
  <div>
    <div class="top f">
      <o-select
        ref="selectRef"
        v-model="bucketId"
        placeholder="请选择桶名"
        class="m-r-16"
        :options="bucketOptions"
        label="name"
        @change="selectChange"
      />
      <UploadFile :bucketName="bucketName" />
      <el-button type="primary" icon="el-icon-search" @click="easySearch">简单搜索</el-button>
      <el-button type="primary" icon="el-icon-plus" @click="easySearch">高级搜索</el-button>
      <el-button type="primary" icon="el-icon-download" :disabled="selectDisabled" @click="easySearch">
        批量下载
      </el-button>
      <el-button type="primary" icon="el-icon-delete" :disabled="selectDisabled" @click="multypleDelete">
        批量删除
      </el-button>
      <el-button type="primary" icon="el-icon-refresh-left" :disabled="selectDisabled" @click="easySearch">
        批量恢复
      </el-button>
      <el-button type="primary" icon="el-icon-refresh" @click="refresh">刷新</el-button>
    </div>

    <o-table :columns="columns" :data="data" class="m-t-24" @selection-change="selectionChange" />

    <BucketOverviewHistory ref="bucketOverviewHistoryRef" :bucket-name="bucketName" />
  </div>
</template>
