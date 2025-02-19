<script setup lang="ts">
import { ref, computed, getCurrentInstance } from 'vue'
import { noticesData } from './data'
import NoticeList from './components/NoticeList.vue'
import GUploadFileDialog from '@/autoComponents/gUploadFileDialog.vue'

import BellIcon from '@iconify-icons/ep/bell'
const { proxy } = getCurrentInstance()

const isShow = ref(false)

const fileRef = ref(null)
const data = ref([])
const columns = [
  {
    label: '名字',
    prop: 'name',
  },
  {
    label: '上传进度',
    prop: 'permission',
    useSlot: true,
  },
  // {
  //   key: 'operation',
  //   label: '操作',
  //   btns: [
  //     {
  //       content: '编辑',
  //     },
  //   ],
  // },
]

proxy.$mitt.on('upload-file', ({ fileList }) => {
  data.value = Object.keys(fileList).map((key) => {
    return {
      name: key,
      permission: fileList[key],
    }
  })
})

const noticesNum = computed(() => {
  if (data.value.length === 0) {
    return 0
  }
  return data.value.filter((v) => v.permission.status === 'pending').length
})
</script>

<template>
  <div>
    <span :class="['dropdown-badge', 'navbar-bg-hover', 'select-none']" @click="isShow = true">
      <GUploadFileDialog />
      <el-badge :value="Number(noticesNum) === 0 ? '' : noticesNum">
        <span class="header-notice-icon">
          <IconifyIconOffline :icon="BellIcon" />
        </span>
      </el-badge>
    </span>

    <o-dialog ref="dialogRef" v-model="isShow" width="60%">
      <template #header>
        上传文件列表
        <el-tag class="v-b" style="vertical-align: bottom">{{ data.length }}</el-tag>
      </template>
      <o-table ref="tableRef" :columns="columns" :data="data" :showPage="false">
        <template #permission="{ scope, row }">
          {{ row.message }}
          <template v-if="row.permission.status === 'done'">
            <el-tag>
              {{ row.permission.message }}
            </el-tag>
          </template>
          <template v-else-if="row.permission.status === 'error'">
            <el-tag type="danger">
              {{ row.permission.message }}
            </el-tag>
          </template>
          <template v-else>
            <div class="w-90%">
              <o-progress :percentage="row.permission.message" />
            </div>
          </template>
        </template>
      </o-table>
    </o-dialog>
  </div>
</template>

<style lang="scss" scoped>
.dropdown-badge {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 48px;
  cursor: pointer;

  .header-notice-icon {
    font-size: 18px;
  }
}

.dropdown-tabs {
  .noticeList-container {
    padding: 15px 24px 0;
  }

  :deep(.el-tabs__header) {
    margin: 0;
  }

  :deep(.el-tabs__nav-wrap)::after {
    height: 1px;
  }

  :deep(.el-tabs__nav-wrap) {
    padding: 0 36px;
  }
}
</style>
