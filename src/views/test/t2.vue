<script setup lang="ts">
import { ref, getCurrentInstance, watch, nextTick } from 'vue'
const { proxy } = getCurrentInstance()
const bucketRef = ref(null)

nextTick(() => {
  let a = bucketRef.value.update()
  console.log(`42 a`, a)
})

const bucketId = ref()
const bucketName = ref()

watch(
  [bucketId, bucketName],
  (val) => {
    console.log(`34 17行 test/t2.vue val`, val)
  },
  {
    deep: true,
    immediate: true,
  },
)
</script>

<template>
  <div>
    <g-bucket ref="bucketRef" v-model="bucketId" v-model:bucketName="bucketName" />
  </div>
</template>
