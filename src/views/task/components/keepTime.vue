<script setup lang="ts">
import { ref, getCurrentInstance, watch } from 'vue'
const { proxy } = getCurrentInstance()

const props = defineProps({
  modelValue: {
    type: String,
  },
})

const emits = defineEmits(['update:modelValue'])
const years = ref(0)
const months = ref(0)
const days = ref(0)
const hours = ref(0)
const minutes = ref(0)

watch(
  () => props.modelValue,
  (val) => {
    const regex = /(\d+)y(\d+)m(\d+)d([\d]*\.[\d]+|[\d]+)h/
    const match = val.match(regex)
    if (match) {
      years.value = match[1]
      months.value = match[2]
      days.value = match[3]
      hours.value = match[4].toString().split('.')[0]
      let smallNumber = match[4].toString().split('.')[1] ?? 0
      console.log(`86 smallNumber`, smallNumber)
      minutes.value = Math.round(('0.' + smallNumber) * 60)
    }
  },
  {
    deep: true,
    immediate: true,
  },
)

const changeInputNumber = () => {
  const mergeHoursNumber = Number(hours.value) + Number((minutes.value / 60).toFixed(2))
  console.log(`35 mergeHoursNumber`, mergeHoursNumber)
  let res = `${years.value}y${months.value}m${days.value}d${mergeHoursNumber}h`
  console.log(`97 res`, res)
  emits('update:modelValue', res)
}
</script>

<template>
  <div>
    <el-input-number v-model="years" :min="0" :max="300" :precision="0" @change="changeInputNumber">
      <template #prefix>
        <span>年</span>
      </template>
    </el-input-number>
    <el-input-number v-model="months" :min="0" :max="12" class="mlr" :precision="0" @change="changeInputNumber">
      <template #prefix>
        <span>月</span>
      </template>
    </el-input-number>
    <el-input-number v-model="days" :min="0" :max="31" class="mr" :precision="0" @change="changeInputNumber">
      <template #prefix>
        <span>日</span>
      </template>
    </el-input-number>
    <el-input-number v-model="hours" :min="0" :max="24" class="mlr" :precision="0" @change="changeInputNumber">
      <template #prefix>
        <span>时</span>
      </template>
    </el-input-number>
    <el-input-number v-model="minutes" :min="0" :max="60" :precision="0" @change="changeInputNumber">
      <template #prefix>
        <span>分</span>
      </template>
    </el-input-number>
  </div>
</template>
