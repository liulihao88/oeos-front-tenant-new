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
import GetBucketList from '@/hooks/getBucketList.ts'
import { querySimple } from '@/api/searchApi.ts'
import { objectDownloadBatch, objectRestoreBatch, objectRestore } from '@/api/bucketReview.ts'
import { previewImage } from '@/api/spaceScan.ts'
import SearchConfigComp from '@/views/spaceScan/components/searchConfigComp.vue'
import { preview } from '@/utils/remoteFunc.ts'

const { proxy } = getCurrentInstance()
let getBucketList = GetBucketList()
getBucketList.getBucketList()
const searchConfigCompRef = ref(null)

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
    label: '对象版本号',
    prop: 'version',
  },
  {
    label: '所属桶',
    prop: 'bucket',
    width: 150,
  },
  {
    label: '更新时间',
    prop: 'lastModifiedTime',
    width: 180,
    filter: (val, row, prop) => {
      return proxy.formatTime(val)
    },
  },
  {
    label: '写入时间',
    prop: 'injectTime',
    width: 180,
    filter: (val, row, prop) => {
      return proxy.formatTime(val)
    },
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
  searchConfigCompRef.value.open()
}
const success = (sendData) => {
  data.value = sendData
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
      <div class="f-1 f-st-ct" />
      <div class="f-1 f-ed-un">
        <el-button type="primary" icon="el-icon-refresh-left" :disabled="selections.length === 0" @click="multyRestore">
          批量恢复
        </el-button>
        <el-button type="primary" icon="el-icon-download" :disabled="!data.length" @click="download">
          批量下载
        </el-button>
        <el-button type="primary" icon="el-icon-search" @click="init">编辑搜索表达式</el-button>
      </div>
    </div>

    <div class="main">
      <o-table ref="tableRef" :columns="columns" :data="data" @selection-change="selectionChange">
        <template #name="{ scope, row }">
          <template v-if="proxy.isImage(row.key)">
            <el-button type="primary" text class="p-0" @click="preview(row.bucket, row.key)">{{ row.key }}</el-button>
          </template>
          <span v-else>
            {{ row.key }}
          </span>
        </template>
      </o-table>
    </div>

    <SearchConfigComp ref="searchConfigCompRef" @success="success" />
  </div>
</template>
