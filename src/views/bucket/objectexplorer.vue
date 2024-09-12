<script setup lang="ts">
import { ref, getCurrentInstance, nextTick, h } from 'vue'
import axios from 'axios'
const { proxy } = getCurrentInstance()
import { getBucketOptions, getObjectList } from '@/api/bucketReview'
import UploadFile from '@/views/bucket/components/uploadFile.vue'

import request from '@/utils/request.js'

const bucketId = ref()
const bucketName = ref()
const bucketOptions = ref([])
const selectRef = ref(null)
const columns = [
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
      { content: '删除' },
      { content: '详情' },
      { content: '恢复' },
      { content: '历史' },
      { content: '下载' },
    ],
  },
]
const data = ref([])
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
const refresh = () => {
  init()
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
      <el-button type="primary" icon="el-icon-download" @click="easySearch">批量下载</el-button>
      <el-button type="primary" icon="el-icon-refresh-left" @click="easySearch">批量恢复</el-button>
      <el-button type="primary" icon="el-icon-refresh" @click="refresh">刷新</el-button>
    </div>

    <o-table :columns="columns" :data="data" class="m-t-24" />
  </div>
</template>
