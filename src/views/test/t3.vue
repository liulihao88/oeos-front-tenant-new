<script setup lang="ts">
import { ref, getCurrentInstance } from 'vue'
const { proxy } = getCurrentInstance()
import { saveTask } from '@/api/taskApi.ts'

let obj = {
  properties: {
    workScheduleExeOpportunity: 'IncludeExecute',
    MAX_UNFREEZING_QUEUE_SIZE: 1,
    objectFilter: {
      expiredTimeExpress: '0y0m0d0h',
      keyPrefix: '',
    },
    includeBuckets: null,
    KeepRawKey: false,
    rawKeyPrefix: 'BucketID',
    packageSizeThreshold: 1073741824,
    singleSizeRange: [104857600, 1073741824],
    fragmentSizeThreshold: 524288000,
    workerCount: 2,
    action: 'FREEZE',
    threadOfTransmission: 3,
    InjectSelftMeta: false,
    directTransmission: true,
    VerifyFreezeContent: true,
    dynamicFragmentSize: true,
    targetStorageId: 'GLACIER_STORAGE1',
    excludeBuckets: ['1010121729736891015'],
    tenant: 'T03',
  },
  name: 'mhx2',
  action: 'FREEZE',
}

const init = async () => {
  let res = await saveTask(obj)
}
</script>

<template>
  <div>
    <div>志在千里携手必达</div>
    <el-button type="primary" @click="init">测试14</el-button>
  </div>
</template>
