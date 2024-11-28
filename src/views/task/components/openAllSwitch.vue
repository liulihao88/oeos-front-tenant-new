<script setup lang="ts">
import { ref, getCurrentInstance, h } from 'vue'
const { proxy } = getCurrentInstance()
import GWarning from '@/autoComponents/gWarning.vue'
import { useVModel } from '@vueuse/core'

const TIME_DURATION = 3

const props = defineProps({
  modelValue: {
    required: true,
  },
})
const confirmText = ref('确定')

const isShow = ref(false)
const isLock = ref(true)
const sonIsTargetBucket = useVModel(props)
const num = ref(TIME_DURATION)
const timer = ref(null)

const timerFn = () => {
  num.value--
  confirmText.value = num.value
  if (num.value === 0) {
    clearInterval(timer.value)
    confirmText.value = '确定'
    isLock.value = false
  }
}
const open = async () => {
  isLock.value = true
  isShow.value = true
  num.value = TIME_DURATION
  timerFn()
  timer.value = setInterval(() => {
    timerFn()
  }, 1000)
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
const close = () => {
  clearInterval(timer.value)
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
      :confirmText="confirmText"
      @close="close"
      @confirm="confirmAllBucket"
    >
      <g-warning
        content="开启所有桶配置会导致无法开启其他类型的桶任务, 并且新增的存储桶会自动启动冷冻任务, 请谨慎选择!"
      />
    </o-dialog>
  </div>
</template>

<style lang="scss" scoped></style>
