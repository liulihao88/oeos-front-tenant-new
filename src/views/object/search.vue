<script setup lang="ts">
/**
 * injectTimeBegin: 1725494400000
 injectTimeEnd: 1726012800000
 pageNumber: 0
 pageSize: 30
 bucket: bucketnamemyjw
 key: aaa
 */
import { ref, getCurrentInstance, watch } from 'vue'
import { api as viewerApi } from 'v-viewer'
import { querySimple, getStorageClassList } from '@/api/searchApi.ts'
import { preview } from '@/utils/remoteFunc.ts'

import { objectDownloadBatch, objectRestoreBatch, objectRestore } from '@/api/bucketReview.ts'

const { proxy } = getCurrentInstance()

const bucketId = ref(proxy.getStorage('tenant-bucket-id'))
const bucketName = ref()

const form = ref({
  key: '',
  injectTimeBegin: '',
  injectTimeEnd: '',
  pageNumber: 0,
  pageSize: 30,
  bucket: bucketName.value,
  storageClass: '',
})
const storageOptions = ref([])
const selections = ref([])
const total = ref(0)

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
    selectable: selectableFn,
  },
  {
    label: '对象键',
    useSlot: true,
    prop: 'name',
    useSlot: true,
  },
  {
    label: '对象大小',
    prop: 'size',
    width: 100,
    filter: proxy.formatBytes,
  },
  {
    label: '版本号',
    prop: 'version',
  },
  {
    label: '存储类型',
    prop: 'storageClass',
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
    isShow: (val) => {
      return val.size > 0
    },
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

function selectableFn(row, index) {
  return row.size && row.size > 0
}

watch(
  [bucketId, bucketName],
  ([bId, bName], [bOldId, bOldName]) => {
    if (bId && bName && bOldName !== bName) {
      form.value.bucket = bName
      proxy.setStorage('tenant-bucket-id', bId)
      init()
    }
  },
  {
    immediate: true,
  },
)

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

const storageInit = async () => {
  let res = await getStorageClassList()
  storageOptions.value = res
}

storageInit()

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
      <div class="f-3 f-st-ct w-100%">
        <g-bucket2 v-model="bucketId" v-model:bucketName="bucketName" />

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
        <o-select
          v-model="form.storageClass"
          :options="storageOptions"
          :disabled="!bucketId"
          label="name"
          class="mr"
          title="存储类型"
          @change="init"
        />
        <o-date-range
          v-model="timeRange"
          title="写入时间"
          :disabled="!bucketId"
          type="datetimerange"
          start-placeholder="开始时间"
          end-placeholder="结束时间"
          class="mr"
          @change="timeChange"
        />
      </div>
      <div class="f-1 f-ed-un">
        <el-button type="primary" icon="el-icon-refresh-left" :disabled="selections.length === 0" @click="multyRestore">
          批量恢复
        </el-button>
        <el-button type="primary" icon="el-icon-download" :disabled="data.length === 0" @click="download">
          下载
        </el-button>
        <el-button type="primary" icon="el-icon-search" :disabled="!bucketId" @click="init">查询</el-button>
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
          <template v-if="row.size > 0">
            <div v-if="proxy.isImage(row.key)" class="link cp" @click="preview(row.bucket, row.key)">
              {{ row.name }}
            </div>
            <template v-else>
              {{ row.name }}
            </template>
          </template>
          <div v-else class="cl-yellow f-st-ct cp" @click="inside(row)">
            <o-icon name="folder" class="mr" />
            {{ row.name }}
          </div>
        </template>
      </o-table>
    </div>
  </div>
</template>
