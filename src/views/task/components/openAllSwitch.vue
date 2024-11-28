<script setup lang="ts">
import { ref, getCurrentInstance, h } from 'vue'
const { proxy } = getCurrentInstance()
import GWarning from '@/autoComponents/gWarning.vue'
import { useVModel } from '@vueuse/core'

const props = defineProps({
  modelValue: {
    required: true,
  },
})

const isShow = ref(false)
const isLock = ref(true)
const sonIsTargetBucket = useVModel(props)
const open = async () => {
  isLock.value = true
  isShow.value = true
  setTimeout(() => {
    isLock.value = false
  }, 2000)
}

const beforeAllBucketChange = async () => {
  if (!sonIsTargetBucket.value) {
    open()
    return false
  } else {
    return true
  }
}
const confirmAllBucket = () => {
  isShow.value = false
  sonIsTargetBucket.value = true
}
</script>

<template>
  <div>
    <el-switch
      v-model="sonIsTargetBucket"
      inline-prompt
      :before-change="beforeAllBucketChange"
      active-text="所有桶"
      inactive-text="所有桶"
      class="mr2"
    />
    <o-dialog
      ref="dialogRef"
      v-model="isShow"
      title="开启所有桶配置提示"
      :confirmAttrs="{
        loading: isLock,
      }"
      @confirm="confirmAllBucket"
    >
      <g-warning
        content="开启所有桶配置会导致无法开启其他类型的桶任务, 并且新增的存储桶会自动启动冷冻任务, 请谨慎选择!"
      />
    </o-dialog>
  </div>
</template>

<style lang="scss" scoped></style>
