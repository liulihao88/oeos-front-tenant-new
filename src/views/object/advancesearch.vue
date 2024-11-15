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
import { querySimple, queryAdvance } from '@/api/searchApi.ts'
import { objectDownloadBatch, objectRestoreBatch, objectRestore } from '@/api/bucketReview.ts'
import BucketOverviewHistory from '@/views/bucket/components/bucketOverviewHistory.vue'
import SearchConfigComp from '@/views/object/components/searchConfigComp.vue'
import { preview } from '@/utils/remoteFunc.ts'

const { proxy } = getCurrentInstance()
let getBucketList = GetBucketList()
getBucketList.getBucketList()
const searchConfigCompRef = ref(null)
const expressionValue = ref('')
const options = ref([])
const bucketOverviewHistoryRef = ref(null)
options.value = proxy.getStorage('tenant-advance-expression') ?? []
const searchObj = ref({})

const selections = ref([])

const data = ref([])
const pageSize = ref(30)
const pageNumber = ref(1)
const total = ref(0)

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
    label: '存储类型',
    prop: 'storageClass',
    width: 200,
  },
  {
    label: '所属桶',
    prop: 'bucket',
    width: 150,
  },
  {
    label: '更新时间',
    prop: 'lastModifiedTime',
    width: proxy.TIME_WIDTH,
    filter: (val, row, prop) => {
      return proxy.formatTime(val)
    },
  },
  {
    label: '写入时间',
    prop: 'injectTime',
    width: proxy.TIME_WIDTH,
    filter: (val, row, prop) => {
      return proxy.formatTime(val)
    },
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
      {
        content: '历史',
        handler: historyRow,
      },
    ],
  },
]

function selectableFn(row, index) {
  return row.size && row.size > 0
}

async function historyRow(row) {
  bucketOverviewHistoryRef.value.open(row)
}

const editSearch = async () => {
  searchConfigCompRef.value.open()
}

const init = async () => {
  searchObj.value.pageSize = pageSize.value
  searchObj.value.pageNumber = pageNumber.value
  let res = await queryAdvance(searchObj.value)
  data.value = res.details
  total.value = res.total
}

const success = (sendForm) => {
  searchObj.value = sendForm
  options.value = proxy.getStorage('tenant-advance-expression')
  expressionValue.value = ''
  init()
}

const update = async (num, size) => {
  pageSize.value = size
  pageNumber.value = num
  init()
}

const timeRange = ref([])

const multyRestore = async () => {
  await objectRestoreBatch(selections.value)
  proxy.$toast('批量恢复成功')
}

const download = async () => {
  // 全部下载

  let res = await objectDownloadBatch(selections.value)
  proxy.gDownloadAll(res)
}
const selectionChange = (val, ...a) => {
  selections.value = val
}
const changeSelect = async (val, label, obj) => {
  if (proxy.notEmpty(obj)) {
    searchObj.value = obj
    update(1, 30)
  }
}
</script>

<template>
  <div>
    <div class="f-bt-un w-100% m-b-16">
      <div class="f-1 f-st-ct" />
      <div class="f-1 f-ed-un">
        <template v-if="data.length > 0">
          <el-button
            type="primary"
            icon="el-icon-refresh-left"
            :disabled="selections.length === 0"
            @click="multyRestore"
          >
            批量恢复
          </el-button>
          <el-button type="primary" icon="el-icon-download" :disabled="selections.length === 0" @click="download">
            批量下载
          </el-button>
        </template>
        <el-button type="primary" class="mr" icon="el-icon-search" @click="editSearch">编辑搜索表达式</el-button>

        <o-select
          v-model="expressionValue"
          :options="options"
          label="queryName"
          value="queryName"
          title="搜索表达式"
          :clearable="false"
          @changeSelect="changeSelect"
        />
      </div>
    </div>

    <div class="main">
      <o-table
        ref="tableRef"
        :columns="columns"
        :data="data"
        :total="total"
        :pageSize="pageSize"
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

    <SearchConfigComp ref="searchConfigCompRef" @success="success" />
    <BucketOverviewHistory ref="bucketOverviewHistoryRef" />
  </div>
</template>
