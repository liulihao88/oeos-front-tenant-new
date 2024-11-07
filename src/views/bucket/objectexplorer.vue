<script setup lang="ts">
import { ref, computed, getCurrentInstance, nextTick, h, watch } from 'vue'
const { proxy } = getCurrentInstance()
import {
  getBucketOptions,
  getObjectList,
  deleteBatch,
  deleteOne,
  objectRestore,
  objectRestoreBatch,
  objectPropertyDetail,
  objectDownloadBatch,
  addDirectory,
} from '@/api/bucketReview'
import UploadFile from '@/views/bucket/components/uploadFile.vue'
import BucketOverviewHistory from '@/views/bucket/components/bucketOverviewHistory.vue'
import BucketFileDetailsComp from '@/views/bucket/components/bucketFileDetailsComp.vue'
import FolderNav from '@/views/bucket/components/folderNav.vue'

import useBucketSettings from '@/store/modules/bucketSettings.ts'
const bucketSettings = useBucketSettings()
import GetBucketList from '@/hooks/getBucketList.ts'
import { preview } from '@/utils/remoteFunc.ts'
import { useI18n } from 'vue-i18n'
let getBucketList = GetBucketList()
import { useRouter, useRoute } from 'vue-router'
const router = useRouter()
const route = useRoute()

const bucketId = ref()
bucketId.value = proxy.getStorage('tenant-bucket-id') ?? ''
const bucketName = ref()
const selectRef = ref(null)
const bucketRef = ref(null)
const selections = ref([])
const bucketOverviewHistoryRef = ref(null)
const BucketFileDetailsCompRef = ref(null)
const isShow = ref(false)
const form = ref({
  name: '',
})
const rules = {
  name: [proxy.validate()],
}
const formRef = ref(null)

function selectableFn(row, index) {
  return row.injectTime
}

const restoreRow = async (row) => {
  let params = {
    bucket: bucketName.value,
    key: row.key,
  }
  let res = await objectRestore(params)
  proxy.$toast(res)
}
const detailRow = async (row) => {
  let params = {
    bucket: bucketName.value,
    key: row.key,
  }
  let res = await objectPropertyDetail(params)
  BucketFileDetailsCompRef.value.open(res)
}

const multyRestore = async () => {
  await objectRestoreBatch(selections.value)
  proxy.$toast('批量恢复成功')
}

const batchDownload = async () => {
  let res = await objectDownloadBatch(selections.value)
  proxy.gDownloadAll(res)
}

const columns = [
  {
    type: 'selection',
    selectable: selectableFn,
  },
  {
    label: '对象名称',
    prop: 'name',
    useSlot: true,
  },
  {
    label: '文件大小',
    prop: 'size',
    width: 100,
    filter: (value, row) => {
      if (value === 0 && row.lastModifiedTime == null) {
        return ''
      }
      return proxy.formatBytes(value)
    },
  },
  {
    label: '存储类型',
    width: 200,
    prop: 'storageClass',
  },
  {
    label: '对象版本号',
    prop: 'version',
    width: 360,
  },
  {
    label: '更新时间',
    width: proxy.TIME_WIDTH,
    prop: 'lastModifiedTime',
    filter: (value) => proxy.formatTime(value),
  },
  {
    label: '写入时间',
    width: proxy.TIME_WIDTH,
    prop: 'lastModifiedTime',
    filter: (value) => proxy.formatTime(value),
  },
  {
    label: '操作',
    prop: 'operation',
    width: 300,
    // maxBtns: proxy.$dev ? 6 : null,
    maxBtns: 10,
    isShow: (row) => (row.injectTime ? true : false),
    btns: [
      { content: '恢复', handler: restoreRow },
      { content: '历史', handler: historyRow },
      { content: '详情', handler: detailRow },
      { content: '删除', handler: deleteRow }, // reConfirm: true,
      { content: '下载', handler: proxy.gDownload },
    ],
  },
]
const data = ref([])

watch(
  [bucketId, bucketName],
  ([bId, bName], [bOldId, bOldName]) => {
    if (bId && bName && bOldName !== bName) {
      proxy.setStorage('tenant-bucket-id', bId)
      init(true)
    }
  },
  {
    immediate: true,
  },
)

const selectDisabled = computed(() => {
  return selections.value.length === 0
})
function easySearch() {}

async function getTableByBucket() {
  let storageBucketValue = proxy.getStorage('tenant-bucket-id')
  if (proxy.notEmpty(storageBucketValue)) {
    await nextTick()
    selectRef.value.$refs.selectRef.$emit('change', storageBucketValue)
  }
}
async function init(isReset = false) {
  if (isReset) {
    bucketSettings.clear()
  }
  let sendParams = {
    bucket: bucketName.value,
    pageMarker: bucketSettings.prevFolderList.at(-1) ?? '',
    prefixKey: bucketSettings.prefixKey,
  }
  let res = await getObjectList(sendParams)
  data.value = proxy.clone(res, 1)
}

const selectionChange = (val, ...a) => {
  console.log(`65 val`, val)
  selections.value = val
}
const addDir = async () => {
  form.value = {}
  isShow.value = true
}
const addDirConfirm = async () => {
  await proxy.validForm(formRef.value)
  let sendData = {
    bucket: bucketName.value,
    dir: form.value.name,
  }
  await addDirectory(sendData)
  isShow.value = false
  init()
}
const refresh = () => {
  init()
}
const multypleDelete = async () => {
  await deleteBatch(selections.value)
  proxy.$toast('删除成功!')
  init()
}
async function deleteRow(row) {
  let params = {
    bucket: bucketName.value,
    key: row.name,
  }
  await deleteOne(params)
  proxy.$toast('删除成功!')
  init()
}
async function historyRow(row) {
  bucketOverviewHistoryRef.value.open(row)
}

const bucketChange = (val) => {
  proxy.setStorage('tenant-bucket-id', val)
  init()
}
const prev = () => {
  bucketSettings.changePrevFolder()
  init()
}
const next = () => {
  let laskKey = data.value.at(-1).key
  bucketSettings.changePrevFolder(laskKey)
  init()
}
const toPrevFolder = () => {
  let nowPrefixKeyArr = bucketSettings.prefixKeyArr
  nowPrefixKeyArr.pop()
  let nowPrefixkey = nowPrefixKeyArr.length > 0 ? nowPrefixKeyArr.join('/') + '/' : ''
  bucketSettings.changePrefixKey(nowPrefixkey)
  init()
}
const inside = (row) => {
  bucketSettings.changePrefixKey(row.key)
  init()
}
</script>

<template>
  <div>
    <div class="top f">
      <g-bucket2 ref="bucketRef" v-model="bucketId" v-model:bucketName="bucketName" />
      <el-button type="primary" class="mr" icon="el-icon-plus" @click="addDir">新建目录</el-button>
      <UploadFile :bucketName="bucketName" @success="init">
        <el-button type="primary" icon="el-icon-upload" :disabled="!bucketName">上传文件</el-button>
      </UploadFile>
      <el-button type="primary" icon="el-icon-search" @click="proxy.jump({ name: 'Search' })">简单搜索</el-button>
      <el-button type="primary" icon="el-icon-search" @click="easySearch">高级搜索</el-button>
      <el-button type="primary" icon="el-icon-download" :disabled="selectDisabled" @click="batchDownload">
        批量下载
      </el-button>
      <el-button type="primary" icon="el-icon-delete" :disabled="selectDisabled" @click="multypleDelete">
        批量删除
      </el-button>
      <el-button type="primary" icon="el-icon-refresh-left" :disabled="selectDisabled" @click="multyRestore">
        批量恢复
      </el-button>
      <el-button type="primary" icon="el-icon-refresh" @click="refresh">刷新</el-button>
    </div>

    <div class="middle m-t-16">
      <el-button type="primary" :disabled="bucketSettings.prevFolderList.length === 0" @click="prev">上一页</el-button>
      <el-button type="primary" :disabled="data.length < 20" @click="next">下一页</el-button>
      <el-button v-if="bucketSettings.prefixKey" type="primary" @click="toPrevFolder">返回上级目录</el-button>
      <FolderNav class="ml2" @change="init" />
    </div>

    <o-table
      :columns="columns"
      :data="data"
      class="m-t-24"
      :showPage="false"
      height="calc(100vh - 230px)"
      @selection-change="selectionChange"
    >
      <template #name="{ scope, row }">
        <template v-if="row.injectTime">
          <div v-if="proxy.isImage(row.key)" class="link cp" @click="preview(row.bucket, row.name)">
            {{ row.name }}
          </div>
          <template v-else>
            {{ row.name }}
          </template>
        </template>
        <div v-else class="cl-green f-st-ct cp" @click="inside(row)">
          <o-icon name="folder" class="mr" />
          {{ row.name }}
        </div>
      </template>
    </o-table>

    <BucketOverviewHistory ref="bucketOverviewHistoryRef" :bucket-name="bucketName" />
    <BucketFileDetailsComp ref="BucketFileDetailsCompRef" />

    <o-dialog ref="dialogRef" v-model="isShow" title="新建目录" @confirm="addDirConfirm">
      <el-form ref="formRef" :model="form" :rules="rules">
        <el-form-item label="目录" prop="name">
          <o-input v-model="form.name" v-focus />
        </el-form-item>
      </el-form>
    </o-dialog>
  </div>
</template>

<style lang="scss" scoped>
.is-image {
  cursor: pointer;
}

.middle {
  display: flex;
  flex-wrap: nowrap;
}
</style>
