<script setup lang="ts">
import { ref, getCurrentInstance, computed } from 'vue'
import { getBucketTask, toggleTaskStatus, delTask } from '@/api/taskApi.ts'

import AddTask from '@/views/task/components/addTask.vue'

const { proxy } = getCurrentInstance()
const data = ref([])
const addTaskRef = ref(null)

const editRow = (row) => {
  addTaskRef.value.open(row)
}

const viewRow = (row) => {
  addTaskRef.value.open(row)
}

const columns = computed(() => {
  return [
    {
      label: '名称',
      prop: 'name',
      handler: viewRow,
    },
    {
      label: '任务类型',
      prop: 'action',
      width: 130,
      filter: (val) => {
        if (!val) {
          return '-'
        }
        return proxy.TASK_TYPE_OPTIONS.find((item) => item.value === val).label
      },
    },
    {
      label: '包含桶名',
      prop: 'includeBucketNames',
      filter: (val) => {
        if (proxy.notEmpty(val)) {
          return val.join(',')
        } else {
          return '所有桶'
        }
      },
    },
    {
      label: '例外桶名',
      prop: 'excludeBucketNames',
      filter: (val) => {
        if (proxy.notEmpty(val)) {
          return val.join(',')
        } else {
          return '-'
        }
      },
    },
    {
      label: '保留期',
      prop: 'retentionPeriod',
      width: 80,
      filter: (val) => {
        // 0年0月100.2天0时
        if (val) {
          let matchDays = /(\d+\.?\d*)天/
          let match = val.match(matchDays)

          return match?.[0] ?? '-'
        }
        return '-'
      },
    },
    {
      label: '任务内容',
      prop: 'taskContent',
    },
    {
      label: '创建时间',
      prop: 'createTime',
      width: proxy.TIME_WIDTH,
      align: 'center',
      filter: (val) => {
        return proxy.formatTimeByRule(val)
      },
    },
    {
      label: '更新时间',
      prop: 'lastModifiedTime',
      width: proxy.TIME_WIDTH,
      align: 'center',
      filter: (val) => {
        return proxy.formatTimeByRule(val)
      },
    },
    {
      key: 'operation',
      label: '操作',
      maxBtns: 5,
      btns: [
        {
          prop: 'enable',
          useSlot: true,
        },
        {
          prop: 'viewEdit',
          useSlot: true,
          content: (row) => {
            return row.enabled ? '查看' : '编辑'
          },
          handler: editRow,
          comp: 'o-icon',
          attrs: {
            type: 'svg',
            name: 'edit',
            content: '编辑',
            size: 6,
          },
        },
        {
          content: '删除',
          handler: deleteRow,
          disabled: (row) => row.enabled,
          reConfirm: !proxy.$dev,
          comp: 'o-icon',
          attrs: {
            name: 'delete',
            type: 'svg',
            content: '删除',
            size: 6,
          },
        },
      ],
    },
  ]
})
const add = () => {
  addTaskRef.value.open()
}
const init = async () => {
  let res = await getBucketTask()
  data.value = res
}
init()

const beforeChange = async (enabledBoolean, row) => {
  let sendEnabled = !enabledBoolean
  if (!sendEnabled && !proxy.$dev) {
    await proxy.confirm(`确定关闭任务 ${row.name} 吗?`)
  }
  try {
    await toggleTaskStatus(row.id, sendEnabled)
    if (sendEnabled) {
      proxy.$toast('启动成功!')
    } else {
      proxy.$toast('停止成功!')
    }
    init()
  } catch (e) {
    if (sendEnabled) {
      proxy.$toast('启动失败!', 'e')
    } else {
      proxy.$toast('停止失败!', 'e')
    }
  }
}

async function deleteRow(row) {
  if (row.enabled) {
    return proxy.$toast('已启用的任务不允许删除', 'e')
  }
  await delTask(row.id)
  proxy.$toast('删除成功')
  init()
}
</script>

<template>
  <div>
    <div class="mb2 f-ed-ct">
      <el-button type="primary" icon="el-icon-plus" @click="add">添加</el-button>
    </div>

    <o-table ref="tableRef" :columns="columns" :data="data" :showPage="false" height="calc(100vh - 180px)">
      <template #enable="{ scope, row }">
        <div class="w-64 mr tr">
          <el-switch
            v-model="row.enabled"
            inline-prompt
            :before-change="() => beforeChange(row.enabled, row)"
            active-text="启用"
            inactive-text="未启用"
          />
        </div>
      </template>
      <template #viewEdit="{ scope, row }">
        <template v-if="row.enabled">
          <o-icon name="view" size="16" content="查看" class="mlr2 cp" @click="editRow(row)" />
        </template>
        <template v-else>
          <o-icon name="edit" size="16" content="编辑" class="mlr2 cp" @click="editRow(row)" />
        </template>
      </template>
    </o-table>
    <AddTask ref="addTaskRef" @success="init" />
  </div>
</template>
