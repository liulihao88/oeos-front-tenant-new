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
const selections = ref([])
const tenantFileList = ref([])
tenantFileList.value = proxy.getStorage('tenant-file-list')
const columns = [
  // {
  //   type: 'selection',
  //   selectable: selectableFn,
  // },
  {
    label: '名字',
    prop: 'name',
  },
  {
    label: '所属桶',
    prop: 'bucketName',
  },
  {
    label: '文件大小',
    width: 100,
    prop: 'size',
    filter: (value) => {
      return proxy.formatBytes(value)
    },
  },
  {
    label: '上传进度',
    prop: 'permission',
    useSlot: true,
  },
  {
    key: 'operation',
    label: '操作',
    width: 100,
    btns: [
      {
        content: '取消上传',
        isShow: (row) => {
          return row.status !== 'done' && row.status !== 'error'
        },
        comp: 'o-icon',
        attrs: {
          type: 'svg',
          content: '取消上传',
          name: 'cancel',
        },
        handler: cancelUploadRow,
      },
      {
        content: '删除',
        handler: deleteRow,
        isShow: (row) => {
          return row.status === 'done' || row.status === 'error'
        },
        comp: 'o-icon',
        attrs: {
          name: 'delete',
          type: 'svg',
          content: '删除',
        },
      },
    ],
  },
]

proxy.$mitt.on('upload-file', ({ fileList }) => {
  data.value = Object.keys(fileList).map((key) => {
    return {
      name: key,
      bucketName: fileList[key].details.bucketName,
      size: fileList[key].details.size,
      ...fileList[key],
    }
  })
  console.log(`14 data.value `, data.value)
})

const noticesNum = computed(() => {
  if (data.value.length === 0) {
    return 0
  }
  return data.value.filter((v) => v.status === 'pending').length
})

const selectionChange = (val, ...a) => {
  selections.value = val
}

// const batchDelete = () => {
//   let selectionsNames = selections.value.map((v) => v.name)
//   console.log(`93 selectionsNames`, selectionsNames)
//   proxy.$mitt.emit('delete-files', selectionsNames)
// }

function deleteRow(row) {
  proxy.$mitt.emit('delete-files', [row.name])
}

function selectableFn(row, index) {
  return row.status === 'done' || row.status === 'error'
}

function cancelUploadRow(row) {
  console.log(`51 row`, row)
  try {
    row.cancelFileList.cancelToken()
  } catch (e) {
    tenantFileList.value[row.name] = {
      message: `上传失败`,
      status: 'error',
      file: row.name,
      cancelFileList: {},
    }
    proxy.setStorage('tenant-file-list', tenantFileList.value)
    proxy.$mitt.emit('upload-file', { fileList: tenantFileList.value })
  } finally {
  }
}
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
      <div>
        <!-- <el-button
          type="primary"
          icon="el-icon-download"
          class="mb2"
          :disabled="selections.length === 0"
          @click="batchDelete"
        >
          批量删除
        </el-button> -->
        <o-table ref="tableRef" :columns="columns" :data="data" @selection-change="selectionChange">
          <template #permission="{ scope, row }">
            <template v-if="row.status === 'done'">
              <el-tag>
                {{ row.message }}
              </el-tag>
            </template>
            <template v-else-if="row.status === 'error'">
              <el-tag type="danger">
                {{ row.message }}
              </el-tag>
            </template>
            <template v-else>
              <div class="w-90%">
                <o-progress :percentage="row.message" />
              </div>
            </template>
          </template>
        </o-table>
      </div>
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
