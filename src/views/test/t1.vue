<script setup lang="ts">
import { ref, getCurrentInstance } from 'vue'
const { proxy } = getCurrentInstance()
import { getInfoOverview } from '@/api/overviewApi.ts'

getInfoOverview()
</script>

<template>
  <div>
    <div>test/t1.vue</div>
  </div>
</template>
