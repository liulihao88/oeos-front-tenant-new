<script setup lang="ts">
import { ref, getCurrentInstance } from 'vue'
import { pick, omit } from 'lodash'
const { proxy } = getCurrentInstance()
let obj = {
  properties: {
    workScheduleExeOpportunity: 'IncludeExecute',
    maxUnfreezingQueueSize: -1,
    objectFilter: {
      keyPrefix: '',
    },
    includeBuckets: [],
    keepRawKey: false,
    rawKeyPrefix: 'BucketID',
    packageSizeThreshold: 1073741824,
    singleSizeRange: [104857600, 1073741824],
    fragmentSizeThreshold: 1073741824,
    workerCount: 2,
    action: 'FREEZE',
    threadOfTransmission: 3,
    injectSelftMeta: false,
    directTransmission: true,
    verifyFreezeContent: true,
    dynamicFragmentSize: true,
    tenant: 'T04',
  },
  name: '3jby',
  action: 'UNFREEZE',
}

let copyForm = proxy.clone(obj)
let copyForm2 = proxy.clone(obj)

copyForm.properties = pick(obj.properties, ['action', 'tenant'])
console.log(`95 copyForm`, copyForm)
copyForm2.properties = omit(obj.properties, ['action', 'tenant'])
console.log(`95 copyForm2.properties`, copyForm2.properties)
</script>

<template>
  <div>
    <div>test/t1.vue</div>
  </div>
</template>
