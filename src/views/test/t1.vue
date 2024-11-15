<script setup lang="ts">
import { ref, getCurrentInstance } from 'vue'
const { proxy } = getCurrentInstance()
import OverviewUsedPie from '@/views/overview/overviewUsedPie.vue'

const used = ref('17.50GB')
const total = ref('1.0TB')
</script>

<template>
  <div>
    <OverviewUsedPie />
  </div>
</template>
