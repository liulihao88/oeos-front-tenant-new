<script setup lang="ts">
import { ref, getCurrentInstance } from 'vue'
const { proxy } = getCurrentInstance()

let a = proxy.formatToFixed('123kb')
console.log(`72 a`, a)
console.log(`72 typeof a`, typeof a)
</script>

<template>
  <div>
    <div>test/t1.vue</div>
  </div>
</template>
