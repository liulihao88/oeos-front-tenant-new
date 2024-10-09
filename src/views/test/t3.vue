<script setup lang="ts">
import { ref, getCurrentInstance, watch } from 'vue'
const { proxy } = getCurrentInstance()
const aa = ref([])
const cc = [
  ['11:22', '13:34'],
  ['11:22', '23:14'],
]
const dd = cc[0]
watch(
  cc,
  (val) => {
    console.log(`28 5行 test/t3.vue val`, val)
  },
  {
    deep: true,
    immediate: true,
  },
)
const bb = [
  {
    id: 'SCHED-46535',
    name: 'andy2',
    fromHH: 11,
    fromMM: 28,
    toHH: 12,
    toMM: 28,
    expressionKeyword: 'wpk:wp24h:',
  },
  {
    fromHH: 19,
    fromMM: 47,
    toHH: 20,
    toMM: 56,
  },
]
</script>

<template>
  <div>
    <div v-for="(v, i) in cc" :key="i">
      {{ v }}
      <!-- <el-time-picker is-range format="HH:mm" value-format="HH:mm" v-model="v"></el-time-picker> -->
    </div>
  </div>
  <el-time-picker v-model="dd" is-range format="HH:mm" value-format="HH:mm" />
</template>
