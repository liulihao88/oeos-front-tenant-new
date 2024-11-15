<script setup lang="ts">
import { ref, getCurrentInstance } from 'vue'
const { proxy } = getCurrentInstance()
import OverviewUsedPie from '@/views/overview/overviewUsedPie.vue'

const used = ref('17.50GB')
const total = ref('1.0TB')
let str = '1023.621321321'
let res = proxy.formatBytes(str, { toFixed: 2 })
console.log(`84 res`, res)
</script>

<template>
  <div>
    <OverviewUsedPie />
  </div>
</template>
