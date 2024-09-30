<script setup lang="ts">
/**
 * injectTimeBegin: 1725494400000
  injectTimeEnd: 1726012800000
  pageNumber: 0
  pageSize: 30
  bucket: bucketnamemyjw
  key: aaa
 */
import { ref, getCurrentInstance } from 'vue'
import GetBucketList from '@/hooks/getBucketList.ts'
import { querySimple } from '@/api/searchApi.ts'
import { objectDownloadBatch, objectRestoreBatch } from '@/api/bucketReview.ts'
import { previewImage } from '@/api/spaceScan.ts'

const { proxy } = getCurrentInstance()
let getBucketList = GetBucketList()
getBucketList.getBucketList()

const bucketId = ref(proxy.getStorage('tenant-bucket-id') ?? '')
const bucketName = ref(proxy.getStorage('tenant-bucket-name') ?? '')

const form = ref({
  key: '',
  injectTimeBegin: '',
  injectTimeEnd: '',
  pageNumber: 0,
  pageSize: 30,
  bucket: bucketName.value,
})
const selections = ref([])

const data = ref([])

const preview = async (row) => {
  const params = {
    bucket: bucketName.value,
    key: row.name,
  }
  let res = await previewImage(params)
  if (res?.status !== 200 || !res) {
    return proxy.$toast(res?.data?.message || '请求错误', 'error')
  }
  const byteArray = new Uint8Array(res.data) // 将二进制数据流转换为字节数组
  const blob = new Blob([byteArray]) // 创建Blob对象
  const imgUrl = URL.createObjectURL(blob) // 创建一个URL，用于表示blob对象
  console.log(`98 imgUrl`, imgUrl)
}
const columns = [
  {
    type: 'selection',
  },
  {
    label: '对象名称',
    prop: 'name',
  },
  {
    label: '对象大小',
    prop: 'size',
    filter: proxy.formatBytes,
  },
  {
    label: '内容Hash',
    prop: 'chechsum',
  },
  {
    label: '写入时间',
    prop: 'injectTime',
    format: proxy.formatTime,
  },
  {
    key: 'operation',
    label: '操作',
    btns: [
      {
        content: '预览',
        handler: preview,
      },
      {
        content: '下载',
      },
      {
        content: '恢复',
      },
    ],
  },
]

const init = async () => {
  if (!form.value.bucket) {
    proxy.$toast('请先选择桶名后查询', 'e')
  }
  let res = await querySimple(form.value)
  data.value = res
  proxy.$toast('查询成功')
}

if (bucketId.value) {
  init()
}

const changeSelect = (value, label, options) => {
  bucketId.value = value
  bucketName.value = label
  form.value.bucket = label
  proxy.setStorage('tenant-bucket-id', value)
  proxy.setStorage('tenant-bucket-name', label)
  init()
}
const timeRange = ref([])

const multyRestore = async () => {
  await objectRestoreBatch(selections.value)
  proxy.$toast('批量恢复成功')
}

const timeChange = (value) => {
  console.log(`43 value`, value)
  console.log(`timeRange.value`, timeRange.value)
  if (proxy.notEmpty(timeRange.value[0] && proxy.notEmpty(timeRange.value[1]))) {
    form.value.injectTimeBegin = new Date(timeRange.value[0]).getTime()
    form.value.injectTimeEnd = new Date(timeRange.value[1]).getTime()
  } else {
    form.value.injectTimeBegin = ''
    form.value.injectTimeEnd = ''
  }
  init()
}
const download = async () => {
  if (!bucketName.value) {
    proxy.$toast('请先选择桶名', 'e')
  }
  if (!data.value.length) {
    proxy.$toast('无数据可下载！', 'e')
  }
  // 全部下载
  if (selections.value.length === 0) {
    const sendData = {
      bucket: bucketName.value,
      injectTimeBegin: form.value.injectTimeBegin,
      injectTimeEnd: form.value.injectTimeEnd,
      key: form.value.key,
    }
    proxy.gDownloadUrl('/v1/admin/tenant/object/download/simplequery', sendData)
  } else {
    // 不分下载
    let res = await objectDownloadBatch(selections.value)
    proxy.gDownloadAll(res)
  }
}
const selectionChange = (val, ...a) => {
  selections.value = val
}
</script>

<template>
  <div>
    <div class="f-bt-un w-100% m-b-16">
      <div class="f-3 f-st-ct">
        <o-select
          ref="selectRef"
          v-model="bucketId"
          placeholder="请选择桶名"
          class="mr"
          :clearable="false"
          :options="getBucketList.bucketOptions"
          label="name"
          @changeSelect="changeSelect"
        />

        <o-input v-model="form.key" width="150" placeholder="请输入对象名称" class="mr2" @input="init" />
        <o-date-range
          v-model="timeRange"
          type="datetimerange"
          start-placeholder="开始时间"
          end-placeholder="结束时间"
          @change="timeChange"
        />
      </div>
      <div class="f-1 f-ed-un">
        <el-button type="primary" icon="el-icon-refresh-left" :disabled="selections.length === 0" @click="multyRestore">
          批量恢复
        </el-button>
        <el-button type="primary" icon="el-icon-download" @click="download">下载</el-button>
        <el-button type="primary" icon="el-icon-search" @click="init">查询</el-button>
      </div>
    </div>

    <div class="main">
      <o-table ref="tableRef" :columns="columns" :data="data" @selection-change="selectionChange" />
      o-table
    </div>
  </div>
</template>
