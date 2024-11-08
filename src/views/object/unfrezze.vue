<script setup lang="ts">
import { ref, getCurrentInstance, watch, nextTick, computed } from 'vue'
import { restoreList, adjustLevelApi, allCancelUnFreeze, cancelUnFreezeApi } from '@/api/spaceScan.ts'

const { proxy } = getCurrentInstance()
const bucketRef = ref(null)

const bucketId = ref()
const bucketName = ref()
const isShow = ref(false)
const levelValue = ref(0)
const selections = ref([])
const frezzeStatus = ref('unfreezed')
const prefixKey = ref('')
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
  let selectionArr =
    frezzeStatus.value === 'unfreezing'
      ? [
          {
            type: 'selecttion',
          },
        ]
      : []
  return selectionArr.concat([
    {
      label: '桶名称',
      prop: 'bucket',
    },
    {
      label: '对象key',
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
      width: 80,
    },
    {
      label: '注入时间',
      prop: 'injectTime',
      width: proxy.TIME_WIDTH,
      filter: (val) => {
        return proxy.formatTimeByRule(val)
      },
    },
    {
      label: '解冻触发时间',
      prop: 'triggerTime',
      width: proxy.TIME_WIDTH,
      filter: (val) => {
        return proxy.formatTimeByRule(val)
      },
    },
    {
      label: '解冻保留时间',
      prop: 'expireTime',
      width: proxy.TIME_WIDTH,
      filter: (val) => {
        return proxy.formatTimeByRule(val)
      },
    },
    {
      key: 'operation',
      label: '操作',
      btns: [
        {
          content: '下载',
          handler: proxy.gDownload,
        },
      ],
    },
  ])
})

const handleSelectionChange = (val) => {
  selections.value = val
}

const init = async () => {
  if (frezzeStatus.value === 'unfreezed') {
    selections.value = []
  }
  await nextTick()
  const sendData = {
    bucket: bucketName.value,
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
</script>

<template>
  <div>
    <div class="top">
      <div>
        <g-bucket2 ref="bucketRef" v-model="bucketId" v-model:bucketName="bucketName" @change="init" />
        <o-input
          v-model="prefixKey"
          v-throttle.debounce="init"
          title="对象前缀"
          placeholder="请输入对象key的前缀"
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
      @selection-change="handleSelectionChange"
    />

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
