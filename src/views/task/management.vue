<script setup lang="ts">
import { ref, getCurrentInstance } from 'vue'
import { getBucketTask, toggleTaskStatus, delTask } from '@/api/taskApi.ts'

import AddTask from '@/views/task/components/addTask.vue'

const { proxy } = getCurrentInstance()
const data = ref([])
const addTaskRef = ref(null)

const editRow = (row) => {
  addTaskRef.value.open(row)
}

const columns = [
  {
    label: '名称',
    prop: 'name',
  },
  {
    label: '任务类型',
    prop: 'action',
    width: 100,
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
    width: 150,
  },
  {
    label: '任务内容',
    prop: 'taskContent',
  },
  {
    label: '创建时间',
    prop: 'createTime',
    width: proxy.TIME_WIDTH,
    filter: (val) => {
      return proxy.formatTimeByRule(val)
    },
  },
  {
    label: '更新时间',
    prop: 'lastModifiedTime',
    width: proxy.TIME_WIDTH,
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
        content: '编辑',
        handler: editRow,
      },
      {
        content: '删除',
        handler: deleteRow,
      },
    ],
  },
]
const add = () => {
  addTaskRef.value.open()
}
const init = async () => {
  let res = await getBucketTask()
  data.value = res
  proxy.$toast('操作成功')
}
init()

const enableChange = async (enabledBoolean, row) => {
  console.log(`63 enabledBoolean`, enabledBoolean)
  if (!enabledBoolean) {
    await proxy.confirm('确定关闭此任务嘛?')
  }
  await toggleTaskStatus(row.id, enabledBoolean)
  init()
}
const beforeChange = async (enabledBoolean, row) => {
  let sendEnabled = !enabledBoolean
  if (!sendEnabled) {
    await proxy.confirm('确定关闭此任务嘛?')
  }
  await toggleTaskStatus(row.id, sendEnabled)
  init()
}

async function deleteRow(row) {
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

    <o-table ref="tableRef" :columns="columns" :data="data" :showPage="false">
      <template #enable="{ scope, row }">
        <el-switch
          v-model="row.enabled"
          inline-prompt
          class="w-60 mr"
          :before-change="() => beforeChange(row.enabled, row)"
          active-text="启用"
          inactive-text="未启用"
        />
      </template>
    </o-table>
    <AddTask ref="addTaskRef" @success="init" />
  </div>
</template>
