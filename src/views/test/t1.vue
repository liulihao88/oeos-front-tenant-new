<script setup lang="ts">
import { ref, getCurrentInstance } from 'vue'
const { proxy } = getCurrentInstance()
import BucketTagging from '@/views/bucket/components/bucketTagging.vue'

const BucketTaggingRef = ref(null)

let a = proxy.formatToFixed('123kb')
console.log(`72 a`, a)
console.log(`72 typeof a`, typeof a)
const bucketName = ref('aaa')
const isTest64 = () => {
  BucketTaggingRef.value.open()
}
</script>

<template>
  <div>
    <div>test/t1.vue</div>
    <el-button type="primary" @click="isTest64">测试79</el-button>
    <BucketTagging ref="BucketTaggingRef" :bucketName="bucketName" />
  </div>
</template>
