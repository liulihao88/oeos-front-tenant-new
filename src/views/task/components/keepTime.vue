<script setup lang="ts">
// 1y2m4d6.13h
import { ref, getCurrentInstance, watch, computed } from 'vue'
const { proxy } = getCurrentInstance()

const props = defineProps({
  modelValue: {
    type: [Number, String],
  },
  value: {
    type: String,
  },
  isView: {
    type: Boolean,
  },
  inputAttrs: {
    type: Object,
    default: () => {},
  },
  type: {
    type: String,
    default: '', // restore, default
  },
})

const EMPTY_VALUE = '0y0m0d0h'

const emits = defineEmits(['update:modelValue'])
const years = ref(0)
const months = ref(0)
const days = ref(0)
const hours = ref(0)
const minutes = ref(0)

if (props.type === 'default') {
  days.value = props.modelValue
}

const easyTime = ref()

const timeOptions = computed(() => {
  let one = props.type === 'restore' ? [] : [{ label: '1天', value: '0y0m1d0h' }]
  return one.concat([
    { label: '7天', value: '0y0m7d0h' },
    { label: '30天', value: '0y0m30d0h' },
    { label: '90天', value: '0y0m90d0h' },
  ])
})

watch(
  () => props.value,
  (val) => {
    if (val) {
      const regex = /(\d+)y(\d+)m(\d+\.?\d*)d([\d]*\.[\d]+|[\d]+)h/
      const match = val.match(regex)
      if (match) {
        years.value = match[1]
        months.value = match[2]
        days.value = match[3]
        hours.value = match[4].toString().split('.')[0]
        let smallNumber = match[4].toString().split('.')[1] ?? 0
        minutes.value = Math.round(('0.' + smallNumber) * 60)
        let easyTimeIdx = timeOptions.value.findIndex((item) => {
          return item.value === match[0]
        })
        if (easyTimeIdx > -1) {
          easyTime.value = timeOptions.value[easyTimeIdx].value
        } else {
          easyTime.value = ''
        }
      }
    }
  },
  {
    deep: true,
    immediate: true,
  },
)

watch(days, (val) => {
  emits('update:modelValue', val)
})
watch(easyTime, (val) => {
  if (val) {
    const regex = /(\d+)y(\d+)m(\d+\.?\d*)d([\d]*\.[\d]+|[\d]+)h/
    const match = val.match(regex)
    let getDayValue = match[3]
    emits('update:modelValue', Number(getDayValue))
  }
})

const changeInputNumber = () => {
  if (years.value === '') {
    return EMPTY_VALUE
  }
  const mergeHoursNumber = Number(hours.value) + Number((minutes.value / 60).toFixed(2))
  let res = `${years.value}y${months.value}m${days.value}d${mergeHoursNumber}h`
  return res
}

function clearValue() {
  easyTime.value = ''
  years.value = 0
  months.value = 0
  days.value = 0
  hours.value = 0
  minutes.value = 0
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
  <div class="f-st-ct w-100% flex-wrap h-100%">
    <div class="mr f-st-ct w-100% h-100% o-a f-n">
      <el-input-number
        v-model="days"
        class="mr"
        style="width: 180px"
        :disabled="!!easyTime"
        :precision="2"
        :min="0"
        v-bind="inputAttrs"
        @change="changeInputNumber"
      >
        <template #prefix>
          <span>天</span>
        </template>
      </el-input-number>

      <div class="radio-box o-a" style="flex-wrap: nowrap">
        <o-radio v-model="easyTime" :options="timeOptions" />
      </div>

      <o-svg v-if="!isView" name="eraser" size="16" class="ml2 link" @click="clearValue" />
    </div>
  </div>
</template>

<style lang="scss" scoped>
.radio-box {
  box-sizing: border-box;
  height: calc(100%);
  max-height: 34px;
  padding: 0 8px;
  margin-left: 8px;
  line-height: calc(100%);
  border: 1px solid var(--line);
  border-radius: 4px;
  transition: all 0.5s ease-out;

  :deep(.el-radio-group) {
    flex-wrap: nowrap;
  }

  &:hover {
    box-shadow: 0 4px 24px 0 rgb(34 41 47 / 10%);
  }
}
</style>
