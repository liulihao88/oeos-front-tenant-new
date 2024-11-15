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
  row: {
    type: Object,
    required: true,
  },
})
function format(num) {
  return `${percentage.value}%`
}
const percentage = computed(() => {
  let divideNum = Number((props.used || 0) / (props.total || 0)) * 100
  let percentRes = Number(divideNum.toFixed(2))
  return percentRes
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
    >
      <template #default="{ percentage }">
        <div class="f-bt-ct w-260">
          <div class="percentage-value">{{ format() }}</div>
          <div>
            {{ proxy.formatBytes(props.row.objectSize) }} / {{ props.row.quota.toFixed(2) + props.row.quotaUnit }}
          </div>
        </div>
      </template>
    </o-progress>
  </div>
</template>

<style lang="scss" scoped>
.progress-box :deep(.el-progress-bar__outer) {
  background: #ccc;
}
</style>
