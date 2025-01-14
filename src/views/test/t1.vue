<script setup lang="ts">
import { ref, getCurrentInstance } from 'vue'
import cc, { OTitle } from 'oeos-components'
console.log(`03 cc`, cc)
const { proxy } = getCurrentInstance()
</script>

<template>
  <div>
    <div>test/t1.vue</div>
  </div>
</template>
