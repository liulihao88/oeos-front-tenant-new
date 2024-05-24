<script setup lang="ts">
import { ref, getCurrentInstance, computed } from 'vue'
const { proxy } = getCurrentInstance()
const props = defineProps({
  total: {
    type: [String, Number],
    required: true,
  },
  used: {
    type: [String, Number],
    required: true,
  },
})
function format(num) {
  return `${percentage.value}%`
}
const percentage = computed(() => {
  let divideNum = Number(props.used / props.total) * 100
  let res = Number(divideNum.toFixed(2))
  return res
})
function formatColor(value) {
  if (value < 90) {
    return 'green'
  } else {
    return 'red'
  }
}
</script>

<template>
  <div>
    <o-progress
      class="progress-box"
      :percentage="percentage"
      type="line"
      :stroke-width="20"
      text-inside
      :format="format"
      :color="formatColor"
    />
  </div>
</template>

<style lang="scss" scoped>
.progress-box :deep(.el-progress-bar__outer) {
  background: #ccc;
}
</style>
