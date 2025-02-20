<script setup lang="ts">
import { ref, getCurrentInstance, computed, nextTick, onMounted } from 'vue'
defineOptions({
  name: 'Management',
})
import { throttle } from 'lodash-es'
import { useRouter, useRoute } from 'vue-router'
const router = useRouter()
const route = useRoute()
const { proxy } = getCurrentInstance()
import {
  getCustomBucketList,
  getBucketDetail,
  getSpaceHistogram,
  getSpace,
  getHistogram,
  getUsage,
  deleteBucket,
} from '@/api/bucket.ts'

import BucketNumPie from '@/views/bucket/bucketNumPie.vue'
import NewAddBucket from '@/views/bucket/newAddBucket.vue'
import GetBucketList from '@/hooks/getBucketList.ts'
const getBucketListHook = GetBucketList()

const PAGE_SIZE = 30
const PAGE_NUMBER = 1

import BucketCapacityPie from '@/views/bucket/bucketCapacityPie.vue'
const totalCapacity = ref(0)
const currentBucketName = ref('')
const addRef = ref(null)
const searchValue = ref()

const topObj = ref([
  {
    title: 'objectCount',
    name: '对象总数',
    icon: 'objNum',
    img: 'bucket/objCount.png',
    value: '0',
    storage: '0',
  },
  {
    title: 'objectSize',
    name: '对象总大小',
    img: 'bucket/objSize.png',
    value: '0',
    storage: '0',
    icon: 'objChange',
  },
  {
    title: 'bucketObjs',
    name: '桶总数',
    img: 'bucket/bucketCount.png',
    value: '0',
    storage: '0',
    icon: 'bucketsCount',
  },
])

const capacityData = ref([])
const tableRef = ref(null)

function add() {
  addRef.value.open()
}

async function deleteRow(row) {
  await deleteBucket(row.bucketName)
  proxy.$toast('删除成功')
  await getBucketListHook.update()
  init()
}
function viewRow(row) {
  router.push({
    name: 'Objectexplorer',
  })
  proxy.setStorage('tenant-bucket-id', row.bucketID)
}
const handleDetail = (row, scope, e) => {
  proxy.jump({
    name: 'ManagementDetail',
  })
  proxy.setStorage('tenant-bucket-details', row)
}

const total = ref(0)
const currentRow = ref({})
const pageSize = ref(PAGE_SIZE)
const pageNumber = ref(PAGE_NUMBER)
const columns = [
  {
    label: '桶名称',
    prop: 'bucketName',
    sortable: true,
    useSlot: true,
  },
  {
    label: '对象数',
    prop: 'objectCount',
    sortable: true,
    width: 100,
    filter: (value) => {
      return proxy.formatThousands(value)
    },
  },
  {
    label: '配额',
    prop: 'capacity',
    width: 100,
    filter: (value, row) => {
      return row.quota.toFixed(2) + row.quotaUnit
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
        comp: 'o-icon',
        attrs: {
          name: 'delete',
          content: '删除',
        },
        reConfirm: !proxy.$dev,
        handler: deleteRow,
      },
      {
        comp: 'o-icon',
        attrs: {
          type: 'svg',
          name: 'detail',
          content: '桶详情',
        },
        handler: handleDetail,
      },
      {
        comp: 'o-icon',
        attrs: {
          name: 'dArrowRight',
          content: '跳转桶浏览',
        },
        handler: viewRow,
      },
    ],
  },
]

const objectNumData = ref([])

const bucketLists = ref([])
async function getTableList() {
  let params = {
    pageSize: pageSize.value,
    pageNumber: pageNumber.value,
    bucketName: searchValue.value,
  }
  let res = await getCustomBucketList(params)
  bucketLists.value = res.details.page
  data.value = res.details.page
  total.value = res.details.total
  topObj.value[2].value = res.details.total
  getBucketDetailByName()
}
async function init(isReset = false) {
  if (isReset) {
    pageSize.value = PAGE_SIZE
    pageNumber.value = PAGE_NUMBER
  }
  reset()
  await getTableList()
  await getBucketUsed()
  await getSpaceHistogramApi()
}

const getSpaceInit = async () => {
  let res = await getSpace()
  topObj.value[0].value = res.objectCount
  topObj.value[1].value = res.objectSize
}

getSpaceInit()

const update = (num, size) => {
  pageSize.value = size
  pageNumber.value = num
  init()
}

const searchBucket = throttle(function () {
  // 在这里执行你的逻辑操作
  init()
}, 500)

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

async function getBucketHistogram(bucketName = 'space') {
  let histogramRes = await getHistogram(bucketName)
  let obj = histogramRes.inCount
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
  Promise.allSettled(queue).then((result) => {
    data.value = result.map((v, i) => {
      const item = bucketLists.value[i]
      if (v.status === 'fulfilled') {
        return { ...v.value, ...item }
      } else {
        return { ...item }
      }
    })
  })
}
const data = ref([])
const calcQuota = (num, unit) => {
  return proxy.formatBytesConvert(num + unit)
}

function currentChange(nowRow, oldCurrentRow) {
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

const rowClick = async (row) => {
  let res = await getBucketDetail(row.bucketName)
  let findIdx = data.value.findIndex((val) => val.bucketName === row.bucketName)
  if (findIdx !== -1) {
    const cloneData = proxy.clone(data.value)
    data.value[findIdx] = { ...cloneData[findIdx], ...res }
    await nextTick()
    let nowItem = data.value.find((item) => item.bucketName === row.bucketName)
    tableRef.value?.$refs?.tableRef?.setCurrentRow?.(nowItem)
  }
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

const parsePercent = (v, t) => {
  return ((v / t) * 100).toFixed(2) + '%'
}

const parseOptions = (opts) => {
  let str = ''
  const total = opts.reduce((acc, cur) => {
    return acc + cur.value || 0
  }, 0)
  opts.forEach((v) => {
    str += `
       <div>
          <span class="m-r-4 cl-green"> ${v.name}: </span>
          <span class="m-r-4"> ${v.value || 0}</span>
          <span class="cl-green m-r-4"> 占比: </span>
          <span>${parsePercent(v.value || 0, total)}</span>
        </div>
      `
  })
  return str
}

const refresh = () => {
  getSpaceInit()
  init()
  getBucketListHook.update()
}

onMounted(() => {
  setTimeout(() => {
    init()
  }, 100)
})
</script>

<template>
  <div class="content-box">
    <el-row :gutter="24" class="h-100%" style="height: 100%">
      <el-col :span="16">
        <div class="w-100% h-100%">
          <div class="l-list f w-100%">
            <div v-for="(v, i) in topObj" :key="i" class="c-box list-item p-tb-16">
              <div>
                <img :src="proxy.formatImg(v.img)" style="height: 50px" alt="" />
              </div>
              <div class="f-st-ct" style="flex-direction: column">
                <div class="cl-45">{{ v.name }}</div>
                <div class="bold">
                  <template v-if="v.title === 'objectSize'">
                    {{ proxy.formatThousands(proxy.formatBytes(v.value)) }}
                  </template>
                  <template v-else>{{ proxy.formatThousands(v.value) }}个</template>
                </div>
              </div>
            </div>
          </div>

          <div class="c-box bucket-table">
            <o-title title="桶列表" class="mb3">
              <o-input
                v-model="searchValue"
                title="桶名称"
                width="200"
                class="ml"
                placeholder="可筛选桶名"
                @input="searchBucket"
                @clear="searchBucket()"
              />
              <template #right>
                <el-button type="" icon="el-icon-refresh" @click="refresh">刷新</el-button>
                <el-button type="primary" icon="el-icon-plus" @click="add">新增桶</el-button>
              </template>
            </o-title>
            <o-table
              ref="tableRef"
              :columns="columns"
              :total="total"
              :pageSize="pageSize"
              :data="data"
              highlight-current-row
              height="calc(100vh - 396px)"
              @update="update"
              @row-click="rowClick"
              @current-change="currentChange"
            >
              <template #bucketName="{ scope, row }">
                <o-tooltip :content="row.bucketID">
                  <div class="link" @click="viewRow(row, scope)">
                    {{ row.bucketName }}
                  </div>
                </o-tooltip>
              </template>
              <template #capacity="{ scope, row }">
                <template v-if="scope.$index !== -1">
                  <g-capacity-progress
                    class="w-100%"
                    :total="calcQuota(row.quota, row.quotaUnit)"
                    :used="row.objectSize"
                    :row="row"
                  >
                    {{ proxy.formatBytes(row.objectSize) }} / {{ row.quota.toFixed(2) + row.quotaUnit }}
                  </g-capacity-progress>
                </template>
              </template>
            </o-table>
          </div>
        </div>
      </el-col>
      <el-col :span="8" style="height: 100%">
        <div class="right-box">
          <div class="c-box w-100% f-1">
            <!-- <o-tooltip
              :content="parseOptions(objectNumData)"
              raw-content
              width="100% "
              :disabled="objectNumData.every((v) => !v.value)"
              placement="left"
              class="w-100% h-100%"
            > -->
            <o-title :title="objectTitle" icon="plus" />
            <BucketNumPie :data="objectNumData" />
            <!-- </o-tooltip> -->
          </div>
          <div class="c-box w-100% mt3 f-1">
            <o-title :title="quotaTitle" icon="plus" />
            <BucketCapacityPie :data="capacityData" />
          </div>
        </div>
      </el-col>
    </el-row>
    <NewAddBucket ref="addRef" @success="init()" />
  </div>
</template>

<style lang="scss" scoped>
.content-box {
  max-height: calc(100vh - 84px);

  .l-list {
    display: flex;
    justify-content: space-between;
    margin-bottom: 24px;

    .list-item {
      display: flex;
      align-items: center;
      justify-content: space-around;
      width: 32%;
      margin: 0;
    }
  }

  .bucket-table {
    height: calc(100% - 110px);
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
