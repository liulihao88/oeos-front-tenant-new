<script setup lang="ts">
import { ref, getCurrentInstance, computed, nextTick } from 'vue'
import { throttle } from 'lodash-es'
const { proxy } = getCurrentInstance()
import {
  getBucketList,
  getBucketDetail,
  getSpaceHistogram,
  getHistogram,
  getUsage,
  getOverview,
  deleteBucket,
} from '@/api/bucket.js'
import BucketNumPie from '@/views/bucket/bucketNumPie.vue'
import NewAddBucket from '@/views/bucket/newAddBucket.vue'

import BucketCapacityPie from '@/views/bucket/bucketCapacityPie.vue'
const totalCapacity = ref(0)
const currentBucketName = ref('')
const rightTableData = ref([])
const addRef = ref(null)
const rightTableColumns = [
  {
    label: '存储池',
    sortable: true,
    prop: 'name',
  },
  {
    label: '对象总数量',
    sortable: true,
    prop: 'objectCount',
    filter: (value) => proxy.formatThousands(value),
  },
  {
    label: '对象总大小',
    sortable: true,
    prop: 'objectSize',
    filter: (value) => proxy.formatBytes(value),
  },
]
const searchValue = ref()

const topObj = ref([
  {
    title: 'objectCount',
    name: '对象总数',
    icon: 'objNum',
    value: '0',
    storage: '0',
  },
  {
    title: 'objectSize',
    name: '对象总大小',
    value: '0',
    storage: '0',
    icon: 'objChange',
  },
  {
    title: 'bucketObjs',
    name: '桶总数',
    value: '0',
    storage: '0',
    icon: 'bucketsCount',
  },
  {
    title: 'objectsPendingReplicationTotalSize',
    name: '待复制大小',
    icon: 'coping',
    storage: '0',
    value: '0',
  },
  {
    title: 'objectsFailedReplicationTotalSize',
    name: '复制失败大小',
    value: '0',
    storage: '0',
    icon: 'objFail',
  },
  {
    title: 'objectsReplicatedTotalSize',
    name: '已复制大小',
    value: '0',
    storage: '0',
    icon: 'copied',
  },
  {
    title: 'objectsReplicaTotalSize',
    name: '备份大小',
    value: '0',
    storage: '0',
    icon: 'copySize',
  },
])

const capacityData = ref([])

function refresh() {
  console.log('refresh')
}
function add() {
  addRef.value.open()
}
async function handleDelete(row) {
  await deleteBucket(row.bucketName)
  init()
}
function handleView() {
  console.log('handleView')
}
const handleDetail = (row, scope, e) => {
  console.log(`38 e`, e)
  console.log(`68 row`, row)
}
function handleUpdate() {
  console.log('handleUpdate')
}
const total = ref(0)
const currentRow = ref({})
const columns = [
  {
    label: '桶名称',
    prop: 'bucketName',
    handler: handleDetail,
  },
  {
    label: '对象数',
    prop: 'objectCount',
    sortable: true,
    filter: (value) => {
      return proxy.formatThousands(value)
    },
  },
  {
    label: '已用容量',
    prop: 'objectSize',
    sortable: true,
    filter: (value) => {
      return proxy.formatBytes(value)
    },
  },
  {
    label: '总容量',
    prop: 'capacity',
    width: 200,
    filter: (value, row) => {
      return row.quota + row.quotaUnit
    },
  },
  {
    label: '使用容量',
    prop: 'capacity',
    width: 300,
    useSlot: true,
  },
  {
    prop: 'operation',
    label: '操作',
    maxBtns: 4,
    btns: [
      {
        content: '删除',
        reConfirm: proxy.$dev ? false : true,
        handler: handleDelete,
      },
      {
        content: '桶浏览',
        handler: handleView,
      },
    ],
  },
]

const objectNumData = ref([])

const bucketLists = ref([])
const searchHandler = throttle(function () {
  init()
}, 500)
async function getTableList() {
  let params = {
    pageSize: 30,
    pageNumber: 1,
    bucketName: searchValue.value,
  }
  let res = await getBucketList(params)
  bucketLists.value = res
  getBucketDetailByName()
}
async function init() {
  reset()
  await getTableList()
  await getBucketUsed()
  await getSpaceHistogramApi()
}
init()
overviewApi()

async function reset() {
  await nextTick()
  currentRow.value = {}
  currentBucketName.value = ''
  totalCapacity.value = 0
}

async function getSpaceHistogramApi() {
  let histogramRes = await getSpaceHistogram()
  let obj = histogramRes.inCount
  objectNumData.value = Object.entries(obj).map(([name, value]) => {
    return { value: value === 0 ? null : value, name: name }
  })
}

async function overviewApi() {
  let res = await getOverview()
  rightTableData.value = res.spaces
  rightTableData.value = proxy.clone(res.spaces, 10)
}

async function getBucketHistogram(bucketName = 'space') {
  let histogramRes = await getHistogram(bucketName)
  let obj = histogramRes.inCount
  console.log(`48 obj`, obj)
  objectNumData.value = Object.entries(obj).map(([name, value]) => {
    return { value: value === 0 ? null : value, name: name }
  })
}

async function getBucketUsed(bucketName = 'space') {
  let usageRes = await getUsage(bucketName)
  totalCapacity.value = usageRes.quota
  _handleUsedData(usageRes.usedSpace)
}

const objectTitle = computed(() => {
  let showBucketStr = currentBucketName.value ? `(${currentBucketName.value})` : ''
  return `桶${showBucketStr}对象数量统计`
})

const quotaTitle = computed(() => {
  let showBucketStr = currentBucketName.value ? `(${currentBucketName.value})` : ''
  return `桶${showBucketStr}容量信息统计`
})
async function getBucketDetailByName() {
  let queue = []
  for (let i = 0; i < bucketLists.value.length; i++) {
    queue.push(getBucketDetail(bucketLists.value[i].bucketName))
  }
  let detailRes = await Promise.all(queue)
  console.log(`02 detailRes`, detailRes)
  data.value = detailRes.map((v, i) => {
    const item = bucketLists.value[i]
    return { ...v, ...item }
  })
  total.value = data.value.length
}
const data = ref([])
const calcQuota = (num, unit) => {
  return proxy.formatBytesConvert(num + unit)
}

function currentChange(nowRow, oldCurrentRow) {
  console.log(`86 nowRow, oldCurrentRow`, nowRow, oldCurrentRow)
  if (proxy.isEmpty(nowRow)) {
    return
  }
  currentRow.value = nowRow
  const usedSpace = nowRow.objectSize
  currentBucketName.value = nowRow.bucketName
  totalCapacity.value = nowRow.quota + nowRow.quotaUnit
  getBucketHistogram(nowRow.bucketName)
  _handleUsedData(usedSpace)
}
function _handleUsedData(usedSpace) {
  const leaveSpace = proxy.formatBytesConvert(totalCapacity.value) - usedSpace
  capacityData.value = [
    {
      name: '使用量',
      value: usedSpace,
    },
    {
      name: '剩余容量',
      value: leaveSpace,
    },
  ]
}
</script>

<template>
  <div class="content-box">
    <el-row :gutter="24" class="h-100%">
      <el-col :span="16">
        <div class="w-100% h-100%">
          <div class="l-list f w-100%">
            <div v-for="(v, i) in topObj" :key="i" class="c-box f-bt f-c h-200 list-item p-tb-16">
              <div>
                <o-icon name="delete" size="40" />
              </div>
              <div>
                {{ proxy.formatThousands(v.value) }}
              </div>
              <!-- <div class="fs-12">{{ v.name }}</div> -->
              <o-tooltip :content="v.name" class="fs-12" />
            </div>
          </div>

          <div class="c-box bucket-table">
            <o-title title="桶列表" class="mb3">
              <o-input
                v-model="searchValue"
                width="200"
                class="ml"
                placeholder="可筛选桶名"
                @clear="init"
                @input="searchHandler"
              />
              <template #right>
                <el-button type="" icon="el-icon-refresh" @click="init">刷新</el-button>
                <el-button type="primary" icon="el-icon-plus" @click="add">新增桶</el-button>
              </template>
            </o-title>
            <o-table
              ref="tableRef"
              :columns="columns"
              :total="total"
              :data="data"
              highlight-current-row
              @current-change="currentChange"
            >
              <!-- <template #bucketName="{ row }">
                <div class="cl-blue">
                  <o-icon name="plus" size="10" color="blue" />
                  {{ row.bucketName }}
                </div>
              </template> -->
              <template #capacity="{ scope, row }">
                <g-capacity-progress :total="calcQuota(row.quota, row.quotaUnit)" :used="row.objectSize" />
              </template>
            </o-table>
          </div>
        </div>
      </el-col>
      <el-col :span="8">
        <div class="right-box">
          <div class="c-box w-100% f-1">
            <o-title :title="objectTitle" icon="plus" />
            <BucketNumPie :title="title" :data="objectNumData" />
          </div>
          <div class="c-box w-100% mt3 f-1">
            <o-title :title="quotaTitle" icon="plus" />
            <BucketCapacityPie :title="title" :data="capacityData" />
          </div>
          <div class="f-1 w-100% mt3 h-100% o-a">
            <o-table :data="rightTableData" class="h-100% o-a" :columns="rightTableColumns" :showPage="false" />
          </div>
        </div>
      </el-col>
    </el-row>
    <NewAddBucket ref="addRef" @success="init" />
  </div>
</template>

<style lang="scss" scoped>
.content-box {
  height: 100%;

  .l-list {
    margin-bottom: 24px;

    .list-item {
      width: 13%;
      margin: 0;
    }

    .list-item:not(:nth-child(7n)) {
      margin-right: calc(7% / 3);
    }
  }

  .bucket-table {
    height: calc(100% - 224px);
  }

  .right-box {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: space-between;
    height: 100%;
  }
}
</style>
