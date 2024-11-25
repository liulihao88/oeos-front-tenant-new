<script setup lang="ts">
import { ref, getCurrentInstance, computed } from 'vue'
const { proxy } = getCurrentInstance()
import { getHistory, deleteOne, deleteBatch, objectDownloadBatch } from '@/api/bucketReview.ts'
const isShow = ref(false)
const data = ref([])
const RestoreExpirationInDaysRef = ref(null)
import RestoreExpirationInDays from '@/components/restoreExpirationInDays.vue'
const props = defineProps({
  bucketName: {
    type: String,
  },
})

const selections = ref([])
const rowDetails = ref({})
const prevHisList = ref([])
const pageMarker = ref()
const versionIdMarker = ref()

const selectDisabled = computed(() => {
  return selections.value.length === 0
})
const init = async (isReset = false) => {
  if (isReset) {
  }
  let params = {
    key: rowDetails.value.name,
    bucket: props.bucketName || rowDetails.value.bucket,
    pageMarker: pageMarker.value,
    versionIdMarker: versionIdMarker.value,
  }
  let res = await getHistory(params)
  data.value = res
}
const open = async (row) => {
  rowDetails.value = row
  await init()
  isShow.value = true
}
const deleteRow = async (row) => {
  let params = {
    bucket: props.bucketName,
    key: row.name,
  }
  await deleteOne(params)
  proxy.$toast('删除成功!')
  init()
}

const selectionChange = (val, ...a) => {
  selections.value = val
}
const batchDownload = async () => {
  let res = await objectDownloadBatch(selections.value)
  proxy.gDownloadAll(res)
}
const multypleDelete = async () => {
  await deleteBatch(selections.value)
  proxy.$toast('删除成功!')
  init()
}
const columns = [
  {
    type: 'selection',
  },
  {
    label: '文件名',
    prop: 'name',
  },
  {
    label: '文件大小',
    prop: 'size',
    filter: proxy.formatBytes,
  },
  {
    label: '存储类型',
    prop: 'storageClass',
  },
  {
    label: '对象内容md5值',
    prop: 'chechsum',
  },
  {
    label: '版本',
    prop: 'version',
  },
  {
    label: '更新时间',
    prop: 'lastModifiedTime',
    filter: (val) => proxy.formatTime(val),
  },
  {
    label: '操作',
    prop: 'operation',
    maxBtns: 4,
    btns: [
      { content: '下载', handler: proxy.gDownload },
      {
        content: '恢复',
        handler: (row) => {
          RestoreExpirationInDaysRef.value.open(row)
        },
      },
      { content: '删除', handler: deleteRow },
    ],
  },
]
const prev = () => {
  let popList = prevHisList.value.pop()
  pageMarker.value = popList.key
  versionIdMarker.value = popList.version
  init()
}
const next = () => {
  pageMarker.value = data.value.at(-1).key
  versionIdMarker.value = data.value.at(-1).version
  prevHisList.value.push({
    pageMaker: pageMarker.value,
    versionIdMarker: versionIdMarker.value,
  })
  init()
}
defineExpose({
  open,
})
</script>

<template>
  <div>
    <o-dialog ref="dialogRef" v-model="isShow" title="历史版本" width="80%">
      <div class="mb2 f-ed-ct">
        <el-button type="primary" icon="el-icon-download" :disabled="selectDisabled" @click="batchDownload">
          批量下载
        </el-button>

        <el-button type="primary" :disabled="selectDisabled" @click="RestoreExpirationInDaysRef.open(selections)">
          <template #icon>
            <o-svg name="restore" />
          </template>
          批量恢复
        </el-button>
        <el-button type="primary" icon="el-icon-delete" :disabled="selectDisabled" @click="multypleDelete">
          批量删除
        </el-button>
      </div>
      <o-table
        :columns="columns"
        :data="data"
        height="calc(100vh - 500px)"
        class="mb2"
        :showPage="false"
        @selection-change="selectionChange"
      />

      <div class="mt2">
        <el-button type="primary" :disabled="prevHisList.length === 0" @click="prev">上一页</el-button>
        <el-button type="primary" :disabled="data.length < 20" @click="next">下一页</el-button>
      </div>
    </o-dialog>
    <RestoreExpirationInDays ref="RestoreExpirationInDaysRef" />
  </div>
</template>
