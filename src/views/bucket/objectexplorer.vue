<script setup lang="ts">
import { ref, computed, getCurrentInstance, nextTick, h } from 'vue'
const { proxy } = getCurrentInstance()
import {
  getBucketOptions,
  getObjectList,
  deleteBatch,
  deleteOne,
  objectRestore,
  objectRestoreBatch,
  objectPropertyDetail,
  objectDownloadBatch,
} from '@/api/bucketReview'
import UploadFile from '@/views/bucket/components/uploadFile.vue'
import BucketOverviewHistory from '@/views/bucket/components/bucketOverviewHistory.vue'
import BucketFileDetailsComp from '@/views/bucket/components/bucketFileDetailsComp.vue'

const bucketId = ref()
const bucketName = ref()
const bucketOptions = ref([])
const selectRef = ref(null)
const selections = ref([])
const bucketOverviewHistoryRef = ref(null)
const BucketFileDetailsCompRef = ref(null)

const restoreRow = async (row) => {
  let params = {
    bucket: bucketName.value,
    key: row.key,
  }
  await objectRestore(params)
}
const detailRow = async (row) => {
  let params = {
    bucket: bucketName.value,
    key: row.key,
  }
  let res = await objectPropertyDetail(params)
  BucketFileDetailsCompRef.value.open(res)
}

const multyRestore = async () => {
  await objectRestoreBatch(selections.value)
  proxy.$toast('批量恢复成功')
}

const batchDownload = async () => {
  let res = await objectDownloadBatch(selections.value)
  proxy.gDownloadAll(res)
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
      { content: '恢复', handler: restoreRow },
      { content: '历史', handler: historyRow },
      { content: '详情', handler: detailRow },
      { content: '删除', handler: deleteRow }, // reConfirm: true,
      { content: '下载', handler: proxy.gDownload },
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
function selectChange(value, label, options) {
  bucketId.value = value
  bucketName.value = label
  proxy.setStorage('tenant-bucket-id', bucketId.value)
  proxy.setStorage('tenant-bucket-name', bucketName.value)
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
        @changeSelect="selectChange"
      />
      <UploadFile :bucketName="bucketName" />
      <el-button type="primary" icon="el-icon-search" @click="proxy.jump({ name: 'Search' })">简单搜索</el-button>
      <el-button type="primary" icon="el-icon-plus" @click="easySearch">高级搜索</el-button>
      <el-button type="primary" icon="el-icon-download" :disabled="selectDisabled" @click="batchDownload">
        批量下载
      </el-button>
      <el-button type="primary" icon="el-icon-delete" :disabled="selectDisabled" @click="multypleDelete">
        批量删除
      </el-button>
      <el-button type="primary" icon="el-icon-refresh-left" :disabled="selectDisabled" @click="multyRestore">
        批量恢复
      </el-button>
      <el-button type="primary" icon="el-icon-refresh" @click="refresh">刷新</el-button>
    </div>

    <o-table :columns="columns" :data="data" class="m-t-24" @selection-change="selectionChange" />

    <BucketOverviewHistory ref="bucketOverviewHistoryRef" :bucket-name="bucketName" />
    <BucketFileDetailsComp ref="BucketFileDetailsCompRef" />
  </div>
</template>
