<script setup lang="ts">
// 1y2m4d6.13h
import { ref, getCurrentInstance, watch } from 'vue'
const { proxy } = getCurrentInstance()

const props = defineProps({
  value: {
    type: String,
  },
})

const EMPTY_VALUE = '0y0m0d0h'

const emits = defineEmits(['update:modelValue'])
const years = ref(0)
const months = ref(0)
const days = ref(0)
const hours = ref(0)
const minutes = ref(0)

const easyTime = ref()

const timeOptions = [
  { label: '1小时', value: '0y0m0d1h' },
  { label: '1天', value: '0y0m1d0h' },
  { label: '1周', value: '0y0m7d0h' },
  { label: '1月', value: '0y1m0d0h' },
  { label: '1年', value: '1y0m0d0h' },
]

watch(
  () => props.value,
  (val) => {
    const regex = /(\d+)y(\d+)m(\d+)d([\d]*\.[\d]+|[\d]+)h/
    const match = val.match(regex)
    if (match) {
      years.value = match[1]
      months.value = match[2]
      days.value = match[3]
      hours.value = match[4].toString().split('.')[0]
      let smallNumber = match[4].toString().split('.')[1] ?? 0
      minutes.value = Math.round(('0.' + smallNumber) * 60)
      let easyTimeIdx = timeOptions.findIndex((item) => {
        return item.value === match[0]
      })
      if (easyTimeIdx > -1) {
        easyTime.value = timeOptions[easyTimeIdx].value
      } else {
        easyTime.value = ''
      }
    }
  },
  {
    deep: true,
    immediate: true,
  },
)

const changeInputNumber = () => {
  const mergeHoursNumber = Number(hours.value) + Number((minutes.value / 60).toFixed(2))
  let res = `${years.value}y${months.value}m${days.value}d${mergeHoursNumber}h`
  return res
}

const clearValue = () => {
  easyTime.value = ''
  emits('update:modelValue', EMPTY_VALUE)
}

const getValue = () => {
  if (easyTime.value) {
    return easyTime.value
  }
  return changeInputNumber()
}

defineExpose({
  getValue,
})
</script>

<template>
  <div class="f-st-ct w-100% flex-wrap">
    <div class="mr f-st-ct w-100% flex-wrap">
      <el-input-number
        v-model="years"
        :min="0"
        :max="300"
        style="width: 130px"
        :precision="0"
        :disabled="!!easyTime"
        @change="changeInputNumber"
      >
        <template #prefix>
          <span>年</span>
        </template>
      </el-input-number>
      <el-input-number
        v-model="months"
        :min="0"
        :max="12"
        class="m"
        :precision="0"
        style="width: 130px"
        :disabled="!!easyTime"
        @change="changeInputNumber"
      >
        <template #prefix>
          <span>月</span>
        </template>
      </el-input-number>
      <el-input-number
        v-model="days"
        :min="0"
        :max="30"
        class="mr"
        :precision="0"
        style="width: 130px"
        :disabled="!!easyTime"
        @change="changeInputNumber"
      >
        <template #prefix>
          <span>日</span>
        </template>
      </el-input-number>
      <el-input-number
        v-model="hours"
        :min="0"
        :max="23"
        class="m"
        :precision="0"
        style="width: 130px"
        :disabled="!!easyTime"
        @change="changeInputNumber"
      >
        <template #prefix>
          <span>时</span>
        </template>
      </el-input-number>
      <el-input-number
        v-model="minutes"
        :min="0"
        :max="59"
        :precision="0"
        class="mr"
        style="width: 130px"
        :disabled="!!easyTime"
        @change="changeInputNumber"
      >
        <template #prefix>
          <span>分</span>
        </template>
      </el-input-number>

      <o-select v-model="easyTime" :options="timeOptions" width="180" title="简选项" />

      <o-icon name="circle-close" class="ml link" @click="clearValue" />
    </div>
  </div>
</template>
