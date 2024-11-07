<script setup lang="ts">
import { ref, getCurrentInstance, watch } from 'vue'
const { proxy } = getCurrentInstance()

const props = defineProps({
  modelValue: {
    required: true,
    type: [String, Number],
  },
})

const data = ref()
const emits = defineEmits(['update:modelValue'])
watch(
  () => props.modelValue,
  (val) => {
    data.value = val / 1024 / 1024
  },
  {
    immediate: true,
  },
)

watch(
  data,
  (val) => {
    emits('update:modelValue', val * 1024 * 1024)
  },
  {
    deep: true,
    immediate: true,
  },
)
</script>

<template>
  <el-input-number v-model="data" v-bind="$attrs" v-number :min="1">
    <template #suffix>MB</template>
  </el-input-number>
</template>
