<script setup lang="ts">
import { ref, getCurrentInstance } from 'vue'
const { proxy } = getCurrentInstance()
import OutServiceComp from '@/views/overview/outServiceComp.vue'
</script>

<template>
  <div>
    <div>test/t1.vue</div>
    <OutServiceComp />
  </div>
</template>
