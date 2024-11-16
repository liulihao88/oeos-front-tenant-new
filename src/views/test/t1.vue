<script setup lang="ts">
import { ref, getCurrentInstance } from 'vue'
const { proxy } = getCurrentInstance()

let a = proxy.formatFixed('123.32321KB')
console.log(`69 a`, a)
</script>

<template>
  <div>
    <o-svg name="dark" />
  </div>
</template>
