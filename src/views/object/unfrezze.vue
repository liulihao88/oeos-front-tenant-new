<script setup lang="ts">
import { ref, getCurrentInstance, watch, nextTick, computed } from 'vue'
import { restoreList, adjustLevelApi, allCancelUnFreeze, cancelUnFreezeApi } from '@/api/spaceScan.ts'

const { proxy } = getCurrentInstance()
const bucketRef = ref(null)
const pageNumber = ref(0)

const bucketId = ref(proxy.getStorage('tenant-freeze-bucket-id'))
const bucketName = ref()
const isShow = ref(false)
const levelValue = ref(0)
const selections = ref([])
const frezzeStatus = ref('unfreezed')
const prefixKey = ref('')
const prevHisList = ref([])
const emptyText = ref('暂无数据')

const frezzeOptions = [
  { label: '已解冻', value: 'unfreezed' },
  { label: '解冻中', value: 'unfreezing' },
]
const levelOptions = [
  { label: '高', value: 0 },
  { label: '中', value: 1 },
  { label: '低', value: 2 },
  { label: '默认', value: 3 },
]

const data = ref([])
const columns = computed(() => {
  return [
    {
      type: 'selection',
      isShowColumn: frezzeStatus.value === 'unfreezing',
    },
    {
      label: '桶名称',
      prop: 'bucket',
    },
    {
      label: '对象键',
      prop: 'key',
    },
    {
      label: '对象版本号',
      prop: 'version',
    },
    {
      label: '对象大小',
      prop: 'size',
      width: 120,
      filter: (val) => proxy.formatBytes(val),
    },
    {
      label: '优先级',
      prop: 'priority',
      isShowColumn: frezzeStatus.value === 'unfreezing',
      width: 80,
    },
    {
      label: '注入时间',
      prop: 'injectTime',
      width: proxy.TIME_WIDTH,
      align: 'center',
      filter: (val) => {
        return proxy.formatTimeByRule(val)
      },
    },
    {
      label: '解冻触发时间',
      prop: 'triggerTime',
      width: proxy.TIME_WIDTH,
      align: 'center',
      filter: (val) => {
        return proxy.formatTimeByRule(val)
      },
    },
    {
      label: '解冻保留时间',
      prop: 'expireTime',
      width: proxy.TIME_WIDTH,
      align: 'center',
      isShowColumn: frezzeStatus.value !== 'unfreezing',
      filter: (val) => {
        return proxy.formatTimeByRule(val)
      },
    },
    {
      key: 'operation',
      label: '操作',
      isShowColumn: frezzeStatus.value !== 'unfreezing',
      width: 100,
      btns: [
        {
          content: '下载',
          handler: proxy.gDownload,
          comp: 'o-icon',
          attrs: {
            type: 'svg',
            name: 'download',
            content: '下载',
          },
        },
      ],
    },
  ]
})

watch(
  [bucketId, bucketName],
  ([bId, bName], [bOldId, bOldName]) => {
    if (bId && bName && bOldName !== bName) {
      // form.value.bucket = bName
      proxy.setStorage('tenant-freeze-bucket-id', bId)
      init()
    }
  },
  {
    immediate: true,
  },
)

const handleSelectionChange = (val) => {
  selections.value = val
}

const init = async (type = '') => {
  if (frezzeStatus.value === 'unfreezed') {
    selections.value = []
  }
  if (type === 'next' || type === 'prev') {
    emptyText.value = '没有更多数据了'
  } else {
    pageNumber.value = 0
    prevHisList.value = []
    emptyText.value = '暂无数据'
  }
  await nextTick()
  const sendData = {
    bucket: bucketName.value,
    pageNumber: pageNumber.value,
    pageSize: 30,
    prefixKey: prefixKey.value,
    status: frezzeStatus.value,
  }
  let res = await restoreList(sendData)
  data.value = res
}

const adjustLevel = () => {
  levelValue.value = 0
  isShow.value = true
}
const levelConfirm = async () => {
  let sendData = selections.value.map((v) => {
    return {
      bucket: v.bucket,
      key: v.key,
      version: v.version,
    }
  })
  await adjustLevelApi(levelValue.value, sendData)
  proxy.$toast('调整优先级成功')
  isShow.value = false
  init()
}
const allCancel = async () => {
  await proxy.confirm('确定将桶内正在解冻的对象全部取消解冻?')
  await allCancelUnFreeze()
  proxy.$toast('全部取消解冻成功！')
  init()
}
const cancelUnFreeze = async () => {
  let sendData = selections.value.map((v) => {
    return {
      bucket: v.bucket,
      key: v.key,
      version: v.version,
    }
  })
  await cancelUnFreezeApi(sendData)
  proxy.$toast('取消解冻成功')
  init()
}
const prev = () => {
  let popList = prevHisList.value.pop()
  pageNumber.value = popList
  init('prev')
}
const next = () => {
  prevHisList.value.push(pageNumber.value)
  pageNumber.value++
  init('next')
}
</script>

<template>
  <div>
    <div class="top">
      <div>
        <g-bucket2 ref="bucketRef" v-model="bucketId" v-model:bucketName="bucketName" />
        <o-input
          v-model="prefixKey"
          v-debounce.200="init"
          title="对象前缀"
          placeholder="请输入对象键的前缀"
          :disabled="!bucketId"
          width="300"
          class="mr2"
          @clear="init"
        />
        <o-select
          v-model="frezzeStatus"
          :options="frezzeOptions"
          :disabled="!bucketId"
          width="200"
          :clearable="false"
          title="状态"
          @change="init"
        />
      </div>
      <div>
        <el-button type="primary" @click="init">查询</el-button>
        <template v-if="frezzeStatus === 'unfreezing'">
          <el-button type="primary" :disabled="selections.length === 0" @click="cancelUnFreeze">取消解冻</el-button>
          <el-button type="primary" :disabled="data.length === 0" @click="allCancel">全部取消</el-button>
          <el-button type="primary" :disabled="selections.length === 0" @click="adjustLevel">调整优先级</el-button>
        </template>
      </div>
    </div>

    <o-table
      ref="tableRef"
      :columns="columns"
      :data="data"
      class="mt2"
      :showFooter="false"
      height="calc(100vh - 250px)"
      :showPage="false"
      :emptyText="emptyText"
      @selection-change="handleSelectionChange"
    />

    <div class="mt2 f-ed-ct">
      <el-button type="primary" :disabled="prevHisList.length === 0" @click="prev">上一页</el-button>
      <el-button type="primary" :disabled="data.length < 20" @click="next">下一页</el-button>
    </div>

    <o-dialog ref="dialogRef" v-model="isShow" title="调整优先级">
      <o-radio v-model="levelValue" :options="levelOptions" @confirm="levelConfirm" />
    </o-dialog>
  </div>
</template>

<style lang="scss" scoped>
.top {
  display: flex;
  align-items: center;
  justify-content: space-between;
}
</style>
