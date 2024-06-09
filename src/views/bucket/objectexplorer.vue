<script setup lang="ts">
import { ref, getCurrentInstance, nextTick } from 'vue'
const { proxy } = getCurrentInstance()
import { getBucketOptions, getObjectList } from '@/api/bucketReview.js'

const searchValue = ref()
const bucketOptions = ref([])
const bucketName = ref('')
const selectRef = ref(null)
const columns = [
  {
    label: '对象名称',
    prop: 'name',
    useSlot: true,
  },
  {
    label: '文件大小',
    prop: 'size',
    filter: (value, row) => {
      console.log(`59 row`, row)
      console.log(`43 value`, value)
      if (value === 0 && row.lastModifiedTime == null) {
        return ''
      }
      return proxy.formatBytes(value)
    },
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
    label: '更新时间',
    prop: 'lastModifiedTime',
  },
  {
    label: '操作',
    prop: 'operation',
    btns: [
      { content: '预览' },
      { content: '删除' },
      { content: '详情' },
      { content: '恢复' },
      { content: '历史' },
      { content: '下载' },
    ],
  },
]
const data = ref([])
function upload() {
  console.log('upload')
}
function easySearch() {
  console.log('easySearch')
}

async function getBucketListInit() {
  let res = await getBucketOptions()
  bucketOptions.value = res
  getTableByBucket()
}
async function getTableByBucket() {
  let storageBucketValue = proxy.getStorage('bucketValue')
  console.log(`57 storageBucketValue`, storageBucketValue)
  if (storageBucketValue) {
    await nextTick()
    selectRef.value.$refs.selectRef.$emit('change', storageBucketValue)
  }
}
function selectChange(value) {
  searchValue.value = value
  bucketName.value = bucketOptions.value.filter((v) => v.value === searchValue.value)[0].name
  proxy.setStorage('bucketValue', searchValue.value)
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
  console.log(`94 res`, res)
  data.value = res
}
</script>

<template>
  <div>
    <div class="top f">
      <o-select
        ref="selectRef"
        v-model="searchValue"
        placeholder="请选择桶名"
        class="m-r-16"
        :options="bucketOptions"
        label="name"
        @change="selectChange"
      />
      <el-button type="primary" icon="el-icon-upload" @click="upload">上传文件</el-button>
      <el-button type="primary" icon="el-icon-search" @click="easySearch">简单搜索</el-button>
      <el-button type="primary" icon="el-icon-plus" @click="easySearch">高级搜索</el-button>
      <el-button type="primary" icon="el-icon-download" @click="easySearch">批量下载</el-button>
      <el-button type="primary" icon="el-icon-refresh-left" @click="easySearch">批量恢复</el-button>
      <el-button type="primary" icon="el-icon-refresh" @click="easySearch">刷新</el-button>
    </div>

    <o-table :columns="columns" :data="data" />
  </div>
</template>
