<script setup lang="ts">
import { ref, getCurrentInstance, nextTick } from 'vue'
import axios from 'axios'
const { proxy } = getCurrentInstance()
import { getBucketOptions, getObjectList } from '@/api/bucketReview'
import { ElNotification } from 'element-plus'

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
    filter: (value, row) => {
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
    filter: (value) => proxy.formatTime(value),
  },
  {
    label: '操作',
    prop: 'operation',
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
function upload() {
  console.log('upload')
}
function easySearch() {}

async function getBucketListInit() {
  let res = await getBucketOptions()
  bucketOptions.value = res
  getTableByBucket()
}
async function getTableByBucket() {
  let storageBucketValue = proxy.getStorage('tenant-bucket-id')
  console.log(`19 storageBucketValue`, storageBucketValue)
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
const onChange = (file, files) => {
  console.log(`99 file`, file)

  console.log(`87 files`, files)
  const formData = new FormData()
  formData.append('file', file.raw)
  formData.append('bucket', bucketName.value)
  formData.append('key', '/')
  // request('object/upload', 'put', {
  //   data: formData,
  //   onUploadProgress: (progressEvent) => {
  //     const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total)
  //     console.log(`38 percentCompleted`, percentCompleted);
  //     // 可以在这里更新用户界面以显示上传进度
  //   },
  //   headers: {
  //     'Content-Type': 'multipart/form-data',
  //     Authorization: proxy.getStorage('tenant-token'),
  //   },
  // })

  axios
    .put('api/v1/admin/tenant/object/upload', formData, {
      onUploadProgress: (progressEvent) => {
        const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total)
        // 可以在这里更新用户界面以显示上传进度
        ElNotification({
          message: `${percentCompleted}`,
          duration: null,
          type: 'info',
        })
      },
      headers: {
        'Content-type': 'multipart/form-data',
        Authorization: proxy.getStorage('tenant-token'),
      },
    })
    .then((res) => {
      console.log(`46 res`, res)
    })
    .catch((err) => {
      console.log(`32 err`, err)
    })
}

async function _genNotify(errorText) {
  const notificationCount = document.querySelectorAll('.el-notification').length
  if (notificationCount === 0) {
    ElNotification({
      message: '关闭所有通知',
      duration: 0,
      type: 'info',
      onClose: _closeAllNotify,
    })
    await sleep(0)
  }
  ElNotification({
    message: errorText,
    type: 'error',
    duration: 0,
  })
  function _closeAllNotify() {
    const notifications = document.querySelectorAll('.el-notification')
    notifications.forEach((notification) => {
      notification.querySelector('.el-notification__closeBtn').click() // 模拟点击关闭按钮
    })
  }
}
const beforeUpload = (file) => {
  let size = file.size
  if (size / 1024 / 1024 > 1024 * 5) {
    return proxy.$toast('只能上传小于等于5GB大小的文件', 'e')
  }
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
      <g-upload class="m-r-10" multiple :onChange="onChange" :before-upload="beforeUpload">
        <el-button type="primary" icon="el-icon-upload" @click="upload">上传文件</el-button>
      </g-upload>
      <el-button type="primary" icon="el-icon-search" @click="easySearch">简单搜索</el-button>
      <el-button type="primary" icon="el-icon-plus" @click="easySearch">高级搜索</el-button>
      <el-button type="primary" icon="el-icon-download" @click="easySearch">批量下载</el-button>
      <el-button type="primary" icon="el-icon-refresh-left" @click="easySearch">批量恢复</el-button>
      <el-button type="primary" icon="el-icon-refresh" @click="easySearch">刷新</el-button>
    </div>

    <g-table :columns="columns" :data="data" class="m-t-24" />
  </div>
</template>
