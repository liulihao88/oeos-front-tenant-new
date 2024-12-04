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
      width: proxy.TIME_WIDTH,
      align: 'center',
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
      align: 'center',
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
          comp: 'o-icon',
          attrs: {
            type: 'svg',
            name: 'run',
            content: '运行',
          },
          handler: runningRow,
        },
        {
          content: '终止',
          reConfirm: !proxy.$dev,
          title: '确认终止此任务吗？',
          disabled: (row) => {
            return row.status !== 'Running'
          },
          comp: 'o-icon',
          attrs: {
            type: 'svg',
            name: 'stop',
            content: '终止',
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
    <o-table ref="tableRef" :columns="columns" :data="data" :pageSize="30" :showPage="false">
      <template #status="{ row, scope }">
        {{ row.statusTitle }}
      </template>
    </o-table>
  </div>
</template>
