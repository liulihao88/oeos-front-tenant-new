<script setup lang="ts">
import { ref, getCurrentInstance, watch, nextTick } from 'vue'
import { restoreList } from '@/api/spaceScan.ts'

const { proxy } = getCurrentInstance()
const bucketRef = ref(null)

// nextTick(() => {
//   let a = bucketRef.value.update()
// })

const bucketId = ref()
const bucketName = ref()
const frezzeStatus = ref('unfreezed')
const prefixKey = ref('')
const frezzeOptions = [
  { label: '已解冻', value: 'unfreezed' },
  { label: '解冻中', value: 'unfreezing' },
]

const data = ref([])
const columns = [
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
    filter: proxy.formatSize,
  },
  {
    label: '优先级',
    prop: 'priority',
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
]

const init = async () => {
  const sendData = {
    pageNumber: 0,
    bucket: bucketName.value,
    prefixKey: prefixKey.value,
    status: frezzeStatus.value,
  }
  let res = await restoreList(sendData)
  data.value = res
}
</script>

<template>
  <div>
    <div class="top">
      <div>
        <g-bucket ref="bucketRef" v-model="bucketId" v-model:bucketName="bucketName" @change="init" />
        <o-input
          v-model="prefixKey"
          v-throttle.input="init"
          placeholder="请输入对象key的前缀"
          width="150"
          class="mr2"
          @clear="init"
        />
        <o-select v-model="frezzeStatus" :options="frezzeOptions" width="100" :clearable="false" @change="init" />
      </div>
      <div>
        <el-button type="primary" @click="init">查询</el-button>
        <template v-if="frezzeStatus === 'unfreezing'">
          <el-button type="primary" @click="init">取消解冻</el-button>
          <el-button type="primary" @click="init">全部取消</el-button>
          <el-button type="primary" @click="init">调整优先级</el-button>
        </template>
      </div>
    </div>

    <o-table ref="tableRef" :columns="columns" :data="data" class="mt2" />
  </div>
</template>

<style lang="scss" scoped>
.top {
  display: flex;
  align-items: center;
  justify-content: space-between;
}
</style>
