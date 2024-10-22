<script setup lang="ts">
import { ref, getCurrentInstance } from 'vue'
const { proxy } = getCurrentInstance()
import HighSettings from '@/views/task/components/highSettings.vue'
</script>

<template>
  <div>
    <div>test/t2.vue</div>
    <HighSettings />
  </div>
</template>
