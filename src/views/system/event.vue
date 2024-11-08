<script setup lang="ts">
import { ref, getCurrentInstance, onUnmounted } from 'vue'
const { proxy } = getCurrentInstance()
import { getEventList, getLevels, markHandle, deleteEvent, exportEvent } from '@/api/system.ts'

/**
 * {
  "levels": [
    "INFO",
    "WARN",
    "ERROR",
    "FATAL",
    "DEBUG"
  ],
  "beginDatetime": "2024-10-08",
  "endDatetime": "2024-10-11",
  "mark": "Awared",
  "pageNumber": 1,
  "pageSize": "30"
}
 */

const searchForm = ref({
  beginDatetime: '',
  endDatetime: '',
  levels: [],
  mark: null,
  pageNumber: 1,
  pageSize: 30,
})
const timer = ref(null)
const total = ref(0)
const levelOptions = ref([])
const dateRangeValue = ref([])
const statusOptions = ref([
  { label: '标记确认', value: 'Awared' },
  { label: '确认解决', value: 'Solved' },
  { label: '取消解决', value: 'Ignored' },
])
const data = ref([
  {
    name: 'andy',
  },
])
const columns = [
  {
    label: '事件信息',
    prop: 'message',
  },
  {
    label: '事件等级',
    prop: 'level',
    width: 100,
    filter: (val) => {
      console.log(`44 val`, val)
    },
    useSlot: true,
  },
  {
    label: '服务',
    prop: 'appId',
    width: 100,
  },
  {
    label: '节点',
    prop: 'nodeId',
    width: 100,
  },
  {
    label: '发生时间',
    prop: 'datetime',
    width: proxy.TIME_WIDTH,
    filter: (val) => proxy.formatTimeByRule(val),
  },
  {
    label: '状态',
    prop: 'mark',
    width: 120,
    filter: (val) => {
      return statusOptions.value.find((v) => v.value === val)?.label || '-'
    },
  },
  {
    key: 'operation',
    label: '操作',
    maxBtns: 10,
    width: 300,
    btns: [
      {
        content: '标记确认',
        handler: (row) => markRow(row, 'Awared'),
      },
      {
        content: '确认解决',
        handler: (row) => markRow(row, 'Solved'),
      },
      {
        content: '取消解决',
        handler: (row) => markRow(row, 'Ignored'),
      },
      {
        content: '删除',
        reConfirm: true,
        handler: deleteRow,
      },
    ],
  },
]
const init = async () => {
  const copyForm = proxy.clone(searchForm.value)
  if (!copyForm.mark) {
    copyForm.mark = null
  }
  let res = await getEventList(copyForm)
  data.value = res.details
  total.value = res.total
}
const getLevelOptions = async () => {
  let res = await getLevels()
  levelOptions.value = res
}
const options = () => {}
async function markRow(row, type) {
  await markHandle(row.id, type)
  proxy.$toast('标记成功')
}
async function deleteRow(row) {
  await deleteEvent(row.id)
  proxy.$toast('删除成功')
}
const exportEventHandle = async () => {
  let _data = {
    apps: [],
    nodes: [],
    levels: searchForm.value.levels,
    mark: searchForm.value.mark,
    beginDatetime: searchForm.value.beginDatetime,
    endDatetime: searchForm.value.endDatetime,
  }
  let res = await exportEvent(_data)
  if (res.status === 200) {
    let data = res.data
    const url = URL.createObjectURL(data)
    const link = document.createElement('a')
    link.href = url
    link.download = '租户事件.xls'
    link.click()
  } else {
    proxy.$toast('导出失败', 'e')
  }
}

const parseLevelType = (level) => {
  const map = {
    INFO: 'success',
    WARN: 'warning',
    ERROR: 'danger',
    FATAL: 'danger',
    DEBUG: 'primary',
  }
  return map[level]
}
/**
[
  {
    "name": "信息",
    "value": "INFO"
  },
  {
    "name": "警告",
    "value": "WARN"
  },
  {
    "name": "错误",
    "value": "ERROR"
  },
  {
    "name": "致命",
    "value": "FATAL"
  },
  {
    "name": "调试",
    "value": "DEBUG"
  }
]
 * @param level
 */
const parseLevel = (level) => {
  let res = levelOptions.value.find((v) => v.value === level)?.name
  return res
}

getLevelOptions()

init()
timer.value = setInterval(() => {
  init()
}, 3000)

const update = (num, size) => {
  searchForm.value.pageNumber = num
  searchForm.value.pageSize = size
  init()
}

onUnmounted(() => {
  clearInterval(timer.value)
})
</script>

<template>
  <div>
    <div class="top w-100% f-bt-ct m-b-16">
      <div class="f-1 f-st-ct">
        <o-select
          v-model="searchForm.levels"
          title="事件等级"
          :options="levelOptions"
          multiple
          label="name"
          placeholder="请选择事件等级"
          class="m-r-16"
          width="510"
          @change="init"
        />
        <o-select
          v-model="searchForm.mark"
          title="状态"
          :options="statusOptions"
          placeholder="请选择状态"
          class="m-r-16"
          @change="init"
        />
        <o-date-range v-model="dateRangeValue" title="发生时间" @change="init" />
      </div>
      <div class="w-100">
        <el-button type="primary" @click="exportEventHandle">导出</el-button>
      </div>
    </div>
    <o-table
      ref="tableRef"
      :columns="columns"
      height="calc(100vh - 240px)"
      :data="data"
      :total="total"
      :pageSize="searchForm.pageSize"
      @update="update"
    >
      <template #level="{ scope, row }">
        <el-tag :type="parseLevelType(row.level)" effect="dark">
          {{ parseLevel(row.level) }}
        </el-tag>
      </template>
    </o-table>
  </div>
</template>
