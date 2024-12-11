<script setup lang="ts">
import { ref, computed, getCurrentInstance, nextTick, h, watch, unref } from 'vue'
const { proxy } = getCurrentInstance()
import { getObjectList, deleteBatch, objectDownloadBatch } from '@/api/bucketReview'
import UploadFile from '@/views/bucket/components/uploadFile.vue'
import { throttle } from 'lodash-es'
import RestoreExpirationInDays from '@/components/restoreExpirationInDays.vue'

import BucketOverviewHistory from '@/views/bucket/components/bucketOverviewHistory.vue'
import BucketFileDetailsComp from '@/views/bucket/components/bucketFileDetailsComp.vue'
import FolderNav from '@/views/bucket/components/folderNav.vue'

import useBucketSettings from '@/store/modules/bucketSettings.ts'
const bucketSettings = useBucketSettings()

const RestoreExpirationInDaysRef = ref(null)
const bucketOverviewHistoryRef = ref(null)
const BucketFileDetailsCompRef = ref(null)
import { useBtns } from '@/hooks/useBtns.ts'
const { btns } = useBtns(RestoreExpirationInDaysRef, bucketOverviewHistoryRef, BucketFileDetailsCompRef, init)
const emptyText = ref('暂无数据')

import { preview } from '@/utils/remoteFunc.ts'

const bucketId = ref()
bucketId.value = proxy.getStorage('tenant-bucket-id') ?? ''
const bucketName = ref()
const bucketRef = ref(null)
const selections = ref([])
const timer = ref(null)
const pageMarker = ref()

function selectableFn(row, index) {
  return row.injectTime
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
    label: '对象大小',
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
    width: proxy.VERSION_WIDTH,
  },
  {
    label: '更新时间',
    width: proxy.TIME_WIDTH,
    align: 'center',
    prop: 'lastModifiedTime',
    filter: (value) => proxy.formatTime(value),
  },
  {
    label: '写入时间',
    width: proxy.TIME_WIDTH,
    align: 'center',
    prop: 'injectTime',
    filter: (value) => proxy.formatTime(value),
  },
  { ...btns.value },
]
const data = ref([])

proxy.$mitt.on('upload-file', ({ fileList, fileName }) => {
  let unRefFileList = unref(fileList)
  let status = unRefFileList[fileName].status
  if (status === 'done') {
    console.log(`62 timer.value`, timer.value)
    if (timer.value) {
      return
    }
    timer.value = setTimeout(() => {
      init()
      timer.value = null
      clearTimeout(timer.value)
    }, 2000)
  }
})

async function init(isReset: string | boolean = false) {
  if (!bucketName.value) {
    return
  }
  if (isReset === true) {
    bucketSettings.clear()
  }
  if (isReset === 'isNext') {
    emptyText.value = '没有更多数据了~'
  } else {
    emptyText.value = '暂无数据'
  }

  let sendParams = {
    bucket: bucketName.value,
    prefixKey: bucketSettings.prefixKey,
  }
  if (isReset === 'isPrev' || isReset === 'isNext') {
    sendParams.pageMarker = pageMarker.value
  } else {
    bucketSettings.changePrevFolder()
  }
  let res = await getObjectList(sendParams)
  data.value = res.page
  pageMarker.value = res.pageMarker
}

const selectionChange = (val, ...a) => {
  selections.value = val
}
const refresh = () => {
  init()
}
const multypleDelete = async () => {
  await deleteBatch(selections.value)
  proxy.$toast('删除成功!')
  init()
}

const prev = () => {
  let popValue = bucketSettings.changePrevFolder('pop')
  pageMarker.value = popValue
  init('isPrev')
}
const next = () => {
  bucketSettings.changePrevFolder(pageMarker.value)
  init('isNext')
}

const inside = (row) => {
  bucketSettings.changePrefixKey(row.key)
  init()
}

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
</script>

<template>
  <div>
    <div class="top f">
      <g-bucket2 ref="bucketRef" v-model="bucketId" v-model:bucketName="bucketName" />
      <g-upload-file-dialog :bucketName="bucketName">
        <el-button type="primary" icon="el-icon-upload" :disabled="!bucketName">上传文件</el-button>
      </g-upload-file-dialog>
      <el-button type="primary" icon="el-icon-search" @click="proxy.jump({ name: 'Search' })">简单搜索</el-button>
      <el-button type="primary" icon="el-icon-search" @click="proxy.jump({ name: 'AdvanceSearch' })">
        高级搜索
      </el-button>

      <o-popconfirm
        content="确定要批量下载吗? "
        title="批量下载"
        :reConfirm="selections.length > 0"
        class="mlr"
        @confirm="batchDownload"
      >
        <el-button type="primary" icon="el-icon-download" :disabled="selections.length === 0">批量下载</el-button>
      </o-popconfirm>

      <el-button
        type="primary"
        :disabled="selections.length === 0"
        @click="RestoreExpirationInDaysRef.open(selections)"
      >
        <template #icon>
          <o-svg name="restore" />
        </template>
        批量恢复
      </el-button>
      <o-popconfirm
        content="确定要批量删除吗? "
        title="批量删除"
        :reConfirm="selections.length > 0"
        class="mlr"
        @confirm="multypleDelete"
      >
        <el-button type="primary" icon="el-icon-download" :disabled="selections.length === 0">批量删除</el-button>
      </o-popconfirm>
      <el-button type="primary" icon="el-icon-refresh" :disabled="!bucketName" @click="refresh">刷新</el-button>
    </div>

    <div class="m-t-8">
      <FolderNav class="" @change="init" />
    </div>

    <o-table
      :columns="columns"
      :data="data"
      class="m-tb-8"
      :showPage="false"
      height="calc(100vh - 260px)"
      :empty-text="emptyText"
      @selection-change="selectionChange"
    >
      <template #name="{ scope, row }">
        <template v-if="row.injectTime">
          <div v-if="proxy.isImage(row.key)" class="link cp" @click="preview(row.bucket, row.name, row)">
            {{ row.name }}
          </div>
          <template v-else>
            {{ row.name }}
          </template>
        </template>
        <div v-else class="cl-yellow f-st-ct cp" @click="inside(row)">
          <o-icon name="folder" class="mr" />
          {{ row.name }}
        </div>
      </template>
    </o-table>

    <div class="middle f-ed-ct">
      <el-button type="primary" :disabled="bucketSettings.prevFolderList.length === 0" @click="prev">上一页</el-button>
      <el-button type="primary" :disabled="!pageMarker" @click="next">下一页</el-button>
    </div>

    <BucketOverviewHistory ref="bucketOverviewHistoryRef" :bucket-name="bucketName" />
    <BucketFileDetailsComp ref="BucketFileDetailsCompRef" />

    <RestoreExpirationInDays ref="RestoreExpirationInDaysRef" />
  </div>
</template>

<style lang="scss" scoped>
.is-image {
  cursor: pointer;
}

.middle {
  display: flex;
  flex-wrap: nowrap;
  align-items: center;
}
</style>
