<template>
  <el-date-picker v-model="dateValue" type="date" placeholder="选择日期" />

  <el-time-picker v-model="timeValue" placeholder="选择时间" format="HH:mm:ss" value-format="HH:mm:ss" />

  {{ dateValue }} ??{{ timeValue }}
</template>

<script setup>
import { ref } from 'vue'
import { ElDatePicker, ElTimePicker } from 'element-plus'

const dateValue = ref('')
const timeValue = ref('')
</script>
