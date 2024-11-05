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
import { api as viewerApi } from 'v-viewer'
import { querySimple } from '@/api/searchApi.ts'
import { preview } from '@/utils/remoteFunc.ts'

import { objectDownloadBatch, objectRestoreBatch, objectRestore } from '@/api/bucketReview.ts'
import { previewImage } from '@/api/spaceScan.ts'

const { proxy } = getCurrentInstance()

const bucketId = ref()
const bucketName = ref()

const form = ref({
  key: '',
  injectTimeBegin: '',
  injectTimeEnd: '',
  pageNumber: 0,
  pageSize: 30,
  bucket: bucketName.value,
})
const selections = ref([])
const total = ref(0)

const data = ref([])

const previewImage = async (row) => {
  preview(row.bucket, row.key)
}
const restoreRow = async (row) => {
  let params = {
    bucket: bucketName.value,
    key: row.key,
  }
  await objectRestore(params)
}
const columns = [
  {
    type: 'selection',
  },
  {
    label: '对象名称',
    useSlot: true,
    prop: 'name',
  },
  {
    label: '对象大小',
    prop: 'size',
    width: 100,
    filter: proxy.formatBytes,
  },
  {
    label: '内容Hash',
    prop: 'chechsum',
  },
  {
    label: '写入时间',
    prop: 'injectTime',
    filter: (val, row, prop) => {
      return proxy.formatTime(val)
    },
    width: proxy.TIME_WIDTH,
  },
  {
    key: 'operation',
    label: '操作',
    maxBtns: 5,
    btns: [
      {
        content: '下载',
        handler: proxy.gDownload,
      },
      {
        content: '恢复',
        handler: restoreRow,
      },
    ],
  },
]

const init = async () => {
  if (!bucketId.value) {
    return proxy.$toast('请先选择桶名后查询', 'e')
  }
  let res = await querySimple(form.value)
  data.value = res.details
  total.value = res.total
  proxy.$toast('查询成功')
}

const update = (num, size) => {
  form.value.pageSize = size
  form.value.pageNumber = num - 1
  init()
}

const changeSelect = (value, label, options) => {
  form.value.bucket = label
  init()
}
const timeRange = ref([])

const multyRestore = async () => {
  await objectRestoreBatch(selections.value)
  proxy.$toast('批量恢复成功')
}

const timeChange = (value) => {
  if (proxy.notEmpty(timeRange.value?.[0] && proxy.notEmpty(timeRange.value?.[1]))) {
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
        <g-bucket2 v-model="bucketId" v-model:bucketName="bucketName" @changeSelect="changeSelect" />

        <o-input
          v-model="form.key"
          v-debounce.500="init"
          width="250"
          placeholder="请输入对象名称"
          class="mr2"
          title="对象名称"
          :disabled="!bucketId"
          @clear="init"
        />
        <o-date-range
          v-model="timeRange"
          :disabled="!bucketId"
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
      <o-table
        ref="tableRef"
        :columns="columns"
        :data="data"
        :pageSize="form.pageSize"
        :total="total"
        height="calc(100vh - 240px)"
        @update="update"
        @selection-change="selectionChange"
      >
        <template #name="{ scope, row }">
          <template v-if="proxy.isImage(row.key)">
            <el-button type="primary" text class="p-0" @click="previewImage(row)">{{ row.key }}</el-button>
          </template>
          <span v-else>
            {{ row.key }}
          </span>
        </template>
      </o-table>
    </div>
  </div>
</template>
