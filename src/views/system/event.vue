<script setup lang="ts">
import { ref, getCurrentInstance, onUnmounted } from 'vue'
const { proxy } = getCurrentInstance()
import { getCustomEventList, getLevels, markHandle, deleteEvent, exportEvent } from '@/api/system.ts'

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

const dateRangeValue = ref([])
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
    align: 'center',
    useSlot: true,
  },
  {
    label: '服务',
    prop: 'appId',
    align: 'center',
    width: 100,
  },
  {
    label: '节点',
    prop: 'nodeId',
    align: 'center',
    width: 100,
  },
  {
    label: '发生时间',
    prop: 'datetime',
    width: proxy.TIME_WIDTH,
    align: 'center',
    filter: (val) => proxy.formatTimeByRule(val),
  },
  {
    label: '状态',
    prop: 'mark',
    align: 'center',
    width: 120,
    filter: (val) => {
      return statusOptions.value.find((v) => v.value === val)?.label || '-'
    },
  },
  {
    key: 'operation',
    label: '操作',
    maxBtns: 10,
    btns: [
      {
        content: '标记确认',
        handler: (row) => markRow(row, 'Awared'),
        comp: 'o-icon',
        attrs: {
          type: 'svg',

          content: '标记确认',
          name: 'tag-confirm',
        },
      },
      {
        content: '确认解决',
        handler: (row) => markRow(row, 'Solved'),
        comp: 'o-icon',
        attrs: {
          type: 'svg',

          content: '确认解决',
          name: 'confirm-resolve',
        },
      },
      {
        content: '取消解决',
        handler: (row) => markRow(row, 'Ignored'),
        comp: 'o-icon',
        attrs: {
          type: 'svg',

          content: '取消解决',
          name: 'cancel-resolve',
        },
      },
      {
        content: '删除',
        handler: deleteRow,
        comp: 'o-icon',
        reConfirm: !proxy.$dev,
        attrs: {
          type: 'svg',
          content: '删除',
          name: 'delete',
        },
      },
    ],
  },
]
const dateChange = (value) => {
  if (!value) {
    searchForm.value.beginDatetime = ''
    searchForm.value.endDatetime = ''
  } else {
    searchForm.value.beginDatetime = value[0]
    searchForm.value.endDatetime = value[1]
  }
  init()
}
const init = async () => {
  const copyForm = proxy.clone(searchForm.value)
  if (!copyForm.mark) {
    copyForm.mark = null
  }
  let res = await getCustomEventList(copyForm)
  data.value = res.details.page
  total.value = res.details.total
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
    mark: searchForm.value.mark || null,
    beginDatetime: searchForm.value.beginDatetime,
    endDatetime: searchForm.value.endDatetime,
  }
  let res = await exportEvent(_data)
  if (res.status !== 200) {
    return proxy.$toast('导出失败', 'e')
  }
  try {
    // 尝试将文本解析为 JSON
    const result = await parseBlobToJson(res.data)
    proxy.$toast(result.message, 'e')
  } catch (e) {
    // 如果无法解析为json, 代表是数据流, 可以下载
    let data = res.data
    const url = URL.createObjectURL(data)
    const link = document.createElement('a')
    link.href = url
    link.download = '租户事件.xls'
    link.click()
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

function parseBlobToJson(blob) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = function (event) {
      try {
        const text = event.target.result // 获取 Blob 的文本内容
        const json = JSON.parse(text) // 将文本解析为 JSON
        resolve(json)
      } catch (error) {
        reject(new Error('无法解析 JSON: ' + error.message))
      }
    }
    reader.onerror = function (error) {
      reject(new Error('读取 Blob 时出错: ' + error.message))
    }
    reader.readAsText(blob) // 以文本形式读取 Blob
  })
}

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
    <div class="top w-100% f-bt-ct m-b-16 o-a">
      <div class="f-1 f-st-ct w-100%">
        <o-select
          v-model="searchForm.levels"
          title="事件等级"
          :options="levelOptions"
          multiple
          label="name"
          placeholder="请选择事件等级"
          class="mr"
          width="350"
          @change="init"
        />
        <o-select
          v-model="searchForm.mark"
          title="状态"
          :options="statusOptions"
          placeholder="请选择状态"
          class="mr"
          width="200"
          @change="init"
        />
        <o-date-range
          v-model="dateRangeValue"
          title="发生时间"
          class="mr"
          value-format="YYYY-MM-DD"
          @change="dateChange"
          @clear="dateChange"
        />
      </div>
      <div class="w-100">
        <o-tooltip content="导出结果为空, 不执行导出操作" :disabled="data.length !== 0">
          <el-button type="primary" :disabled="data.length === 0" @click="exportEventHandle">导出</el-button>
        </o-tooltip>
      </div>
    </div>
    <o-table
      ref="tableRef"
      :columns="columns"
      height="calc(100vh - 250px)"
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
