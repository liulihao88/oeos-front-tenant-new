<script setup lang="ts">
import { ref, getCurrentInstance, nextTick, onMounted } from 'vue'
import { getSchedules, deleteSchedule, saveSchedule, getScheduleDetail } from '@/api/taskApi.ts'

const { proxy } = getCurrentInstance()

const searchValue = ref()

const data = ref([
  {
    name: 'andy',
  },
])
const columns = [
  {
    label: '组名',
    prop: 'name',
  },
  {
    key: 'operation',
    label: '操作',
    btns: [
      {
        content: '删除',
        handler: deleteRow,
      },
    ],
  },
]

async function deleteRow(row) {}

const searchHandler = () => {}
const newAdd = () => {
  console.log('newAdd')
}
const handleCurrentChange = () => {
  console.log('handleCurrentChange')
}
</script>

<template>
  <div class="task-container">
    <div class="l">
      <div class="f-st-ct m-tb-16">
        <o-input
          v-model.trim="searchValue"
          v-debounce.300="searchHandler"
          title="组名"
          placeholder="请输入组名"
          @clear="searchHandler"
        />
        <el-button type="primary" class="m-l-16" icon="el-icon-plus" @click="newAdd">新增组</el-button>
      </div>
      <div>
        <o-table
          ref="tableRef"
          :columns="columns"
          :data="data"
          :showPage="false"
          highlight-current-row
          @current-change="handleCurrentChange"
        />
      </div>
    </div>
    <div class="r" />
  </div>
</template>

<style scoped lang="scss">
.task-container {
  display: flex;

  .l {
    position: absolute;
    width: 280px;
    height: 100%;
    height: calc(100vh - 124px);
    padding: 8px;
    margin-right: 20px;
    overflow: auto;
    background-color: #fff;
    border-right: 1px solid #eee;
  }

  .r {
    flex: 1;
    height: calc(100vh - 172px);
    margin-left: 300px;
    // position: absolute;
    .r-top {
      display: flex;
      align-items: center;
      margin-bottom: 16px;
    }

    .r-content {
      display: flex;
      flex: 1;
      justify-content: space-between;
      height: 100%;
      overflow: auto;
      background-color: #fff;

      .item {
        flex: 1;
        height: 100%;
        padding: 8px;
        overflow: auto;
        border-left: 1px solid #eee;
      }

      .item:last-child {
        border-right: 0;
      }
    }
  }
}
</style>
