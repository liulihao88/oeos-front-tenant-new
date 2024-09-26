<script setup lang="ts">
import { ref, getCurrentInstance } from 'vue'
const { proxy } = getCurrentInstance()
const message = ref()
import { useRouter, useRoute } from 'vue-router'
const router = useRouter()
const route = useRoute()
proxy.$toast(message.value)
setInterval(() => {
  message.value = proxy.uuid()
}, 1000)
console.log(`04 message.value`, message.value)
function isTest55() {
  router.push({ name: 'T22' })
}
</script>

<template>
  <div>
    <div>test/t2.vue</div>
    <el-button type="primary" @click="isTest55">到测试1</el-button>
  </div>
</template>
