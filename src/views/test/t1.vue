<script setup lang="ts">
import { ref, getCurrentInstance } from 'vue'
const { proxy } = getCurrentInstance()
function clearCacheWithPrefix(prefix) {
  const storage = window.localStorage // 或者 window.sessionStorage
  const keys = Object.keys(storage)
  keys.forEach((key) => {
    if (key.startsWith(prefix)) {
      storage.removeItem(key)
    }
  })
}

// 使用函数清除以'tenant'为前缀的缓存
</script>

<template>
  <div>
    <div>test/t1.vue</div>
    <el-button type="primary" @click="clearCacheWithPrefix('tenant')">测试66</el-button>
  </div>
</template>
