<script setup lang="ts">
import { ref, getCurrentInstance } from 'vue'
const { proxy } = getCurrentInstance()
const data = ref([
  {
    name: 'andy',
  },
  {
    name: 'tom',
  },
])
const columns = [
  {
    label: '名字',
    prop: 'name',
  },
  {
    key: 'operation',
    label: '操作',
    btns: [
      {
        content: '编辑',
        isShow: (row) => {
          return row.name === 'andy'
        },
      },
      {
        content: '删除',
        isShow: (row) => {
          return row.name === 'tom'
        },
      },
    ],
  },
]
</script>

<template>
  <div>
    <o-table ref="tableRef" :columns="columns" :data="data" />
  </div>
</template>
