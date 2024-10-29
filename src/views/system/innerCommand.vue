<script setup lang="ts">
import { ref, getCurrentInstance, onUnmounted, computed } from 'vue'
const { proxy } = getCurrentInstance()
import { getInnerCommand, startRunning, stopRunning } from '@/api/system.ts'

const timer = ref()

const data = ref([
  {
    name: 'andy',
  },
])

const columns = computed(() => {
  return [
    {
      label: '名称',
      prop: 'cmdName',
    },
    {
      label: '执行节点',
      prop: 'nodes',
    },
    {
      label: '开始运行时间',
      prop: 'startTime',
      filter: (val) => proxy.formatTimeByRule(val),
    },
    {
      label: '运行时长',
      prop: 'upTime',
      filter: (val) => proxy.formatTimeByRule(val, 'uptime'),
    },
    {
      label: '执行描述',
      prop: 'runtimeMessage',
    },
    {
      label: '命令执行状态',
      prop: 'status',
      useSlot: true,
    },
    {
      key: 'operation',
      label: '操作',
      btns: [
        {
          content: '运行',
          disabled: (row) => {
            return row.status === 'Running'
          },
          handler: runningRow,
        },
        {
          content: '终止',
          disabled: (row) => {
            return row.status !== 'Running'
          },
          handler: stopRunningRow,
        },
      ],
    },
  ]
})

const init = async () => {
  let res = await getInnerCommand()
  data.value = res
}
init()
timer.value = setInterval(() => {
  init()
}, 5000)

async function runningRow(row) {
  if (row.status === 'Running') {
    return proxy.$toast('正在运行中!', 'e')
  }
  await startRunning(row.cmdId)
  proxy.$toast('运行成功')
}
async function stopRunningRow(row) {
  await stopRunning(row.cmdId)
  proxy.$toast('终止成功')
}
onUnmounted(() => {
  clearInterval(timer.value)
})
</script>

<template>
  <div>
    <o-table ref="tableRef" :columns="columns" :data="data">
      <template #status="{ row, scope }">
        {{ row.statusTitle }}
      </template>
    </o-table>
  </div>
</template>
