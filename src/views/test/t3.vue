<script setup lang="ts">
import { ref, getCurrentInstance } from 'vue'
const { proxy } = getCurrentInstance()
import { ElNotification } from 'element-plus'

const num = ref(0)
setInterval(() => {
  ElNotification({
    message: `正在上传, 进度${num.value++}%`,
    duration: 0,
  })
}, 1000)
</script>

<template>
  <div>
    <div>test/t3.vue</div>
  </div>
</template>
