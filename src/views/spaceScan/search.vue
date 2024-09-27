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

const data = ref([])
const columns = [
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

const changeSelect = (value, label, options) => {
  bucketId.value = value
  bucketName.value = label
  form.value.bucket = label
  proxy.setStorage('tenant-bucket-id', value)
  proxy.setStorage('tenant-bucket-name', label)
  init()
}
const timeRange = ref([])

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
const restore = () => {
  console.log('restore')
}
const download = () => {
  console.log('download')
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
        <el-button type="primary" icon="el-icon-refresh-left" @click="restore">批量恢复</el-button>
        <el-button type="primary" icon="el-icon-download" @click="download">下载</el-button>
        <el-button type="primary" icon="el-icon-search" @click="init">查询</el-button>
      </div>
    </div>

    <div class="main">
      <o-table ref="tableRef" :columns="columns" :data="data" />
      o-table
    </div>
  </div>
</template>
