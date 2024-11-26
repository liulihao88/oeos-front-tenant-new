<script setup lang="ts">
import { ref, getCurrentInstance, computed, useAttrs } from 'vue'
const { proxy } = getCurrentInstance()

const offsetNum = computed(() => {
  let getOffsetNum = Number(`${window.innerHeight - 100}`)
  return getOffsetNum
})
</script>

<template>
  <el-affix class="affix-global-box" v-bind="$attrs" :offset="offsetNum" :z-index="300" position="top">
    <slot />
  </el-affix>
</template>

<style scoped lang="scss">
:deep(.el-affix) {
  height: 0 !important;
}

.affix-global-box {
  height: 0 !important;
}
</style>
