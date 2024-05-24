<script setup lang="ts">
import { ref, getCurrentInstance, computed } from 'vue'
const { proxy } = getCurrentInstance()
import { getBucketList, getBucketDetail } from '@/api/bucket.js'
import BucketNumPie from '@/views/bucket/bucketNumPie.vue'
const objectNumOptions = ref({})

const topObj = ref([
  {
    title: 'objectCount',
    name: '对象总数',
    icon: 'objNum',
    number: '0',
    storage: '0',
  },
  {
    title: 'objectSize',
    name: '对象总大小',
    number: '0',
    storage: '0',
    icon: 'objChange',
  },
  {
    title: 'bucketObjs',
    name: '桶总数',
    number: '0',
    storage: '0',
    icon: 'bucketsCount',
  },
  {
    title: 'objectsPendingReplicationTotalSize',
    name: '待复制大小',
    icon: 'coping',
    storage: '0',
    number: '0',
  },
  {
    title: 'objectsFailedReplicationTotalSize',
    name: '复制失败大小',
    number: '0',
    storage: '0',
    icon: 'objFail',
  },
  {
    title: 'objectsReplicatedTotalSize',
    name: '已复制大小',
    number: '0',
    storage: '0',
    icon: 'copied',
  },
  {
    title: 'objectsReplicaTotalSize',
    name: '备份大小',
    number: '0',
    storage: '0',
    icon: 'copySize',
  },
])

function refresh() {
  console.log('refresh')
}
function add() {
  console.log('add')
}
function handleDelete(row) {
  console.log('handleDelete')
}
function handleView() {
  console.log('handleView')
}
const handleDetail = (row) => {
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
    useSlot: true,
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
    width: 500,
    useSlot: true,
  },
  {
    prop: 'operation',
    label: '操作',
    maxBtns: 4,
    btns: [
      {
        content: '更新',
        handler: handleUpdate,
      },
      {
        content: '删除',
        reConfirm: true,
        handler: handleDelete,
      },
      {
        content: '桶浏览',
        handler: handleView,
      },
    ],
  },
]
let obj = {
  '<1024B': 15,
  '1K-1MB': 10143,
  '1MB-10MB': 5966,
  '10MB-50MB': 0,
  '50MB-100MB': 0,
  '100MB-500MB': 0,
  '500MB-1GB': 0,
  '1GB-5GB': 0,
  '>5GB': 0,
}

const objectNumData = ref([])
objectNumData.value = Object.entries(obj).map(([name, value]) => {
  return { value: value === 0 ? null : value, name: name }
})
const bucketLists = ref([])
async function init() {
  let params = {
    pageSize: 30,
    pageNumber: 1,
    bucketName: '',
  }
  let res = await getBucketList(params)
  console.log(`45 res`, res)
  bucketLists.value = res
  getBucketDetailByName()
}
init()
const title = computed(() => {
  let bucketName = currentRow.value.bucketName ?? ''
  let braceBucketName = ''
  if (bucketName) {
    braceBucketName = `(${bucketName})`
  }
  return `桶${braceBucketName}对象数量统计`
})
objectNumOptions.value = {
  title: {
    text: title.value,
  },
  series: [
    {
      data: objectNumData.value,
    },
  ],
}
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
const searchValue = ref()
function currentChange(currentRow, oldCurrentRow) {
  console.log(`28 oldCurrentRow`, oldCurrentRow)
  console.log(`11 currentRow`, currentRow)
  currentRow.value = currentRow
}
</script>

<template>
  <div class="content-box">
    <el-row :gutter="24" class="h-90%">
      <el-col :span="16">
        <div class="w-100% h-100%">
          <div class="l-list f w-100%">
            <div v-for="(v, i) in topObj" :key="i" class="c-box f-bt f-c h-100 list-item">
              <div>
                <o-icon name="delete" />
              </div>
              <div>
                {{ proxy.formatThousands(v.num) }}
              </div>
              <!-- <div class="fs-12">{{ v.name }}</div> -->
              <o-tooltip :content="v.name" class="fs-12" />
            </div>
          </div>

          <div class="c-box h-100%">
            <o-title title="桶列表" class="m-b-16">
              <o-input v-model="searchValue" width="200" class="ml" placeholder="可筛选桶名" />
              <template #right>
                <el-button type="" icon="el-icon-refresh" @click="refresh">刷新</el-button>
                <el-button type="primary" icon="el-icon-plus" @click="add">新增桶</el-button>
              </template>
            </o-title>
            <g-table
              ref="tableRef"
              :columns="columns"
              :total="total"
              :data="data"
              highlight-current-row
              @current-change="currentChange"
            >
              <template #bucketName="{ row }">
                <div class="cl-blue">
                  <o-icon name="plus" size="10" color="blue" />
                  {{ row.bucketName }}
                </div>
              </template>
              <template #capacity="{ scope, row }">
                <g-capacity-progress :total="calcQuota(row.quota, row.quotaUnit)" :used="row.objectSize" />
              </template>
            </g-table>
          </div>
        </div>
      </el-col>
      <el-col :span="8">
        <div class="c-box w-100%">
          <o-title title="租户对象数量统计" icon="plus" />
          <BucketNumPie :title="title" :options="objectNumOptions" />

          <g-test />
        </div>
      </el-col>
    </el-row>
  </div>
</template>

<style lang="scss" scoped>
.content-box {
  height: 100%;

  .l-list {
    margin-bottom: 16px;

    .list-item {
      width: 13%;
      margin: 0;
    }

    .list-item:not(:nth-child(7n)) {
      margin-right: calc(7% / 3);
    }
  }
}
</style>
