<script setup lang="ts">
import { ref, getCurrentInstance } from 'vue'
const { proxy } = getCurrentInstance()
import KeepTime from '@/views/task/components/KeepTime.vue'

const time = ref('0y0m1d0h')
</script>

<template>
  <div>
    <KeepTime :value="time" />
  </div>
</template>
