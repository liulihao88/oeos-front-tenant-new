<script setup lang="ts">
import { ref, getCurrentInstance } from 'vue'
const { proxy } = getCurrentInstance()
const base = ref([1024 * 1024 * 100, 1024 * 1024])
</script>

<template>
  <div>
    <gBtoMb v-model="base[0]" />
    <gBtoMb v-model="base[1]" />
    我不服啊 ========={{ base }}
  </div>
</template>
