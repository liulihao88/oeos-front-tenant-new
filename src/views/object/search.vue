<script setup lang="ts">
/**
 * injectTimeBegin: 1725494400000
 injectTimeEnd: 1726012800000
 pageNumber: 0
 pageSize: 30
 bucket: bucketnamemyjw
 key: aaa
 */
import { ref, getCurrentInstance, watch } from 'vue'
import { api as viewerApi } from 'v-viewer'
import { querySimple, getStorageClassList } from '@/api/searchApi.ts'
import { preview } from '@/utils/remoteFunc.ts'
import BucketOverviewHistory from '@/views/bucket/components/bucketOverviewHistory.vue'
import RestoreExpirationInDays from '@/components/restoreExpirationInDays.vue'
import BucketFileDetailsComp from '@/views/bucket/components/bucketFileDetailsComp.vue'

import { objectDownloadBatch, deleteBatch } from '@/api/bucketReview.ts'

const { proxy } = getCurrentInstance()

const bucketId = ref(proxy.getStorage('tenant-easy-bucket-id'))
const bucketName = ref()
const BucketFileDetailsCompRef = ref(null)
const bucketOverviewHistoryRef = ref(null)
const RestoreExpirationInDaysRef = ref(null)

import { useBtns } from '@/hooks/useBtns.ts'
const { btns } = useBtns(RestoreExpirationInDaysRef, bucketOverviewHistoryRef, BucketFileDetailsCompRef, init)

const form = ref({
  key: '',
  injectTimeBegin: '',
  injectTimeEnd: '',
  pageNumber: 0,
  pageSize: 30,
  bucket: bucketName.value,
  storageClass: '',
})
const storageOptions = ref([])
const selections = ref([])

const total = ref(0)

const data = ref([])

const columns = [
  {
    type: 'selection',
    selectable: selectableFn,
  },
  {
    label: '对象键',
    useSlot: true,
    prop: 'key',
  },
  {
    label: '对象大小',
    prop: 'size',
    width: 100,
    filter: proxy.formatBytes,
  },
  {
    label: '对象版本号',
    prop: 'version',
    width: proxy.VERSION_WIDTH,
  },
  {
    label: '存储类型',
    prop: 'storageClass',
    width: 200,
  },
  {
    label: '更新时间',
    prop: 'lastModifiedTime',
    filter: (val) => {
      return proxy.formatTime(val)
    },
    width: proxy.TIME_WIDTH,
    align: 'center',
  },
  {
    label: '写入时间',
    prop: 'injectTime',
    filter: (val, row, prop) => {
      return proxy.formatTime(val)
    },
    width: proxy.TIME_WIDTH,
    align: 'center',
  },
  { ...btns.value },
]

function selectableFn(row, index) {
  return row.size && row.size > 0
}

watch(
  [bucketId, bucketName],
  ([bId, bName], [bOldId, bOldName]) => {
    if (bId && bName && bOldName !== bName) {
      form.value.bucket = bName
      proxy.setStorage('tenant-easy-bucket-id', bId)
      init()
    }
  },
  {
    immediate: true,
  },
)

const multypleDelete = async () => {
  await deleteBatch(selections.value)
  proxy.$toast('删除成功!')
  init()
}

async function init() {
  if (!bucketId.value) {
    return proxy.$toast('请先选择桶名后查询', 'e')
  }
  let res = await querySimple(form.value)
  data.value = res.details
  total.value = res.total
  // proxy.$toast('查询成功')
}

const update = (num, size) => {
  form.value.pageSize = size
  form.value.pageNumber = num - 1
  init()
}

const storageInit = async () => {
  let res = await getStorageClassList()
  storageOptions.value = res
}

storageInit()

const timeRange = ref([])

const timeChange = (value) => {
  if (proxy.notEmpty(timeRange.value?.[0] && proxy.notEmpty(timeRange.value?.[1]))) {
    form.value.injectTimeBegin = new Date(timeRange.value[0]).getTime()
    form.value.injectTimeEnd = new Date(timeRange.value[1]).getTime()
  } else {
    form.value.injectTimeBegin = ''
    form.value.injectTimeEnd = ''
  }
  init()
}
const download = async () => {
  let res = await objectDownloadBatch(selections.value)
  proxy.gDownloadAll(res)
}
const selectionChange = (val, ...a) => {
  selections.value = val
}
</script>

<template>
  <div>
    <div class="f-bt-ct w-100%">
      <div class="w-100% o-a">
        <div class="">
          <g-bucket2
            v-model="bucketId"
            v-model:bucketName="bucketName"
            :titleAttrs="{ width: 80 }"
            width="400"
            class="mb2"
          />
          <o-input
            v-model="form.key"
            v-debounce.500="init"
            width="400"
            class="mr2 mb"
            title="对象名称"
            :titleAttrs="{ width: 80 }"
            :disabled="!bucketId"
            @clear="init"
          />
        </div>
        <div>
          <o-select
            v-model="form.storageClass"
            :options="storageOptions"
            :disabled="!bucketId"
            label="value"
            class="mr mb2"
            :titleAttrs="{ width: 80 }"
            title="存储类型"
            width="400"
            @change="init"
          />
          <o-date-range
            v-model="timeRange"
            title="写入时间"
            width="400"
            class="mb2"
            format="YYYY-MM-DD HH:mm:ss"
            :titleAttrs="{ width: 80 }"
            type="datetimerange"
            :disabled="!bucketId"
            start-placeholder="开始时间"
            end-placeholder="结束时间"
            @change="timeChange"
          />
        </div>
      </div>
      <div class="w-440 f-ed-un">
        <o-popconfirm
          content="确定要批量下载吗? "
          title="批量下载"
          :reConfirm="selections.length > 0"
          class="mr"
          @confirm="download"
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
        <el-button type="primary" icon="el-icon-search" :disabled="!bucketId" @click="init">查询</el-button>
      </div>
    </div>

    <div class="main">
      <o-table
        ref="tableRef"
        :columns="columns"
        :data="data"
        :pageSize="form.pageSize"
        :total="total"
        height="calc(100vh - 286px)"
        @update="update"
        @selection-change="selectionChange"
      >
        <template #key="{ scope, row }">
          <template v-if="row.size > 0">
            <div v-if="proxy.isImage(row.key)" class="link cp" @click="preview(row.bucket, row.key)">
              {{ row.key }}
            </div>
            <template v-else>
              {{ row.key }}
            </template>
          </template>
          <div v-else class="cl-yellow f-st-ct cp" @click="inside(row)">
            <o-icon name="folder" class="mr" />
            {{ row.key }}
          </div>
        </template>
      </o-table>
    </div>

    <BucketOverviewHistory ref="bucketOverviewHistoryRef" :bucket-name="bucketName" />

    <BucketFileDetailsComp ref="BucketFileDetailsCompRef" />

    <RestoreExpirationInDays ref="RestoreExpirationInDaysRef" />
  </div>
</template>
