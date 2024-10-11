<script setup lang="ts">
import { ref, getCurrentInstance } from 'vue'
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
  beginDateTime: '',
  endDateTime: '',
  levels: [],
  mark: '',
})
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
  },
  {
    label: '服务',
    prop: 'appID',
  },
  {
    label: '节点',
    prop: 'nodeID',
  },
  {
    label: '发生时间',
    prop: 'datetime',
    filter: (val) => proxy.formatTimeByRule(val),
  },
  {
    label: '状态',
    prop: 'mark',
  },
  {
    key: 'operation',
    label: '操作',
    maxBtns: 5,
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
        confirm: '您确定删除该事件信息?',
        handler: deleteRow,
      },
    ],
  },
]
const init = async () => {
  await getEventList(searchForm.value)
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
const exportEvent = async () => {
  let _data = {
    apps: [],
    nodes: [],
    levels: searchForm.value.levels,
    mark: searchForm.value.mark,
    beginDatetime: searchForm.value.beginDateTime,
    endDatetime: searchForm.value.endDateTime,
  }
  let res = await exportEvent(_data)
  let data = res
  const url = URL.createObjectURL(data)
  const link = document.createElement('a')
  link.href = url
  link.download = '租户事件.xls'
  link.click()
}

getLevelOptions()
init()
</script>

<template>
  <div>
    <div class="top w-100% f-bt-ct m-b-16">
      <div class="f-1 f-st-ct">
        <o-select
          v-model="searchForm.levels"
          :options="levelOptions"
          multiple
          label="name"
          placeholder="请选择事件等级"
          @change="init"
        />
        <o-select
          v-model="searchForm.mark"
          width="200"
          :options="statusOptions"
          placeholder="请选择状态"
          class="m-lr-8"
        />
        <o-date-range v-model="dateRangeValue" />
      </div>
      <div class="w-100">
        <el-button type="primary" @click="exportEvent">导出</el-button>
      </div>
    </div>
    <o-table ref="tableRef" :columns="columns" :data="data" />
  </div>
</template>
