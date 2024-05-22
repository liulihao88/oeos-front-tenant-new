<script setup lang="ts">
import { ref, getCurrentInstance } from 'vue'
const { proxy } = getCurrentInstance()
import { getBucketList, getBucketDetail } from '@/api/bucket.js'

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
      console.log(`33 value`, value)
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
    label: '容量',
    prop: 'capacity',
    width: 500,
    useSlot: true,
  },
  {
    prop: 'operation',
    label: '操作',
    btns: [
      {
        content: '查看',
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
</script>

<template>
  <div class="box">
    <div class="l">
      <div class="l-list f">
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
          <o-input v-model="search" width="200" class="ml" placeholder="可筛选桶名" />
          <template #right>
            <el-button type="" icon="el-icon-refresh" @click="refresh">刷新</el-button>
            <el-button type="primary" icon="el-icon-plus" @click="add">新增桶</el-button>
          </template>
        </o-title>
        <g-table ref="tableRef" :columns="columns" :total="total" :data="data">
          <template #capacity="{ scope, row }">
            <g-capacity-progress :total="calcQuota(row.quota, row.quotaUnit)" :used="row.objectSize" />
          </template>
        </g-table>
      </div>
    </div>
    <div class="r">右侧</div>
  </div>
</template>

<style lang="scss" scoped>
.box {
  display: flex;
  height: 100%;

  .l {
    flex: 2;

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

  .r {
    flex: 1;
  }
}
</style>
