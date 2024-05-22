<script setup lang="ts">
import { ref, getCurrentInstance } from 'vue'
const { proxy } = getCurrentInstance()
const total = ref(0)
const used = ref(0)
let num = 100
let unit = 'GB'
let mergeNum = num + unit
total.value = proxy.formatBytesConvert(mergeNum)
// total.value = 107374182400 * 24
used.value = 24164037547
// 107374182400
</script>

<template>
  <div>
    <div>test/t2.vue</div>
    <g-capacity-progress :total="total" :used="used" />
  </div>
</template>
