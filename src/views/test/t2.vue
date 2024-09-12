<script setup lang="ts">
import { ref, getCurrentInstance } from 'vue'
const { proxy } = getCurrentInstance()
const message = ref()
proxy.$toast(message.value)
setInterval(() => {
  message.value = proxy.uuid()
}, 1000)
console.log(`04 message.value`, message.value)
</script>

<template>
  <div>
    <div>test/t2.vue</div>
  </div>
</template>
