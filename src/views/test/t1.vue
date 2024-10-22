<script setup lang="ts">
import { ref, getCurrentInstance } from 'vue'
const { proxy } = getCurrentInstance()
let res = proxy.formatBytes(1069446856704)
console.log(`19 res`, res)
</script>

<template>
  <div>
    <div>test/t1.vue</div>
  </div>
</template>
