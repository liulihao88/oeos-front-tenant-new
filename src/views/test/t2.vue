<script setup lang="ts">
import { getCurrentInstance, watch, ref } from 'vue'
const { proxy } = getCurrentInstance()

const checked = ref()

watch(
  checked,
  (val) => {
    console.log(`53 9行 test/t2.vue val`, val)
  },
  {
    deep: true,
    immediate: true,
  },
)
</script>

<template>
  <div>
    <el-checkbox v-model="checked">备选项</el-checkbox>
  </div>
</template>
