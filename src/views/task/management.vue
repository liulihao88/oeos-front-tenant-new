<script setup lang="ts">
import { ref, getCurrentInstance } from 'vue'
import { getBucketTask, toggleTaskStatus } from '@/api/taskApi.ts'

const { proxy } = getCurrentInstance()
const data = ref([])

const editRow = (row) => {}
const deleteRow = (row) => {}
const columns = [
  {
    label: '名称',
    prop: 'name',
  },
  {
    label: '任务类型',
    prop: 'action',
  },
  {
    label: '名称',
    prop: 'name',
  },
  {
    label: '包含桶名',
    prop: 'includeBucketNames',
    filter: (val) => {
      if (val) {
        return val.join(',')
      }
    },
  },
  {
    label: '例外桶名',
    prop: 'excludeBucketNames',
  },
  {
    label: '保留期',
    prop: 'retentionPeriod',
  },
  {
    label: '任务内容',
    prop: 'taskContent',
  },
  {
    label: '创建时间',
    prop: 'createTime',
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
const add = () => {}
const init = async () => {
  let res = await getBucketTask()
  data.value = res
  proxy.$toast('请求成功')
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
  console.log(`63 enabledBoolean`, enabledBoolean)
  let sendEnabled = !enabledBoolean
  if (!sendEnabled) {
    await proxy.confirm('确定关闭此任务嘛?')
  }
  await toggleTaskStatus(row.id, sendEnabled)
  init()
}
</script>

<template>
  <div>
    <div class="mb2 f-ed-ct">
      <el-button type="primary" icon="el-icon-plus" @click="add">添加</el-button>
    </div>

    <o-table ref="tableRef" :columns="columns" :data="data">
      <template #enable="{ scope, row }">
        <el-switch
          v-model="row.enabled"
          inline-prompt
          class="w-60 mr"
          :before-change="() => beforeChange(row.enabled, row)"
          active-text="启用"
          inactive-text="未启用"
        />
        <!-- @change="enableChange(row.enabled, row)" -->
      </template>
    </o-table>
    o-table
  </div>
</template>
