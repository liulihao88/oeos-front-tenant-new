<script setup lang="ts">
import { ref, getCurrentInstance } from 'vue'
const { proxy } = getCurrentInstance()
import { loading1 } from '@/utils/request.ts'
loading1.value = true

setTimeout(() => {
  loading1.value = false
}, 1000)
</script>

<template>
  <div>
    🏆
    <div>test/t1.vue</div>
    <el-button type="primary" :loading="loading1">测试66</el-button>
  </div>
</template>
