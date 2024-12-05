<script setup lang="ts">
import { ref, getCurrentInstance } from 'vue'
const { proxy } = getCurrentInstance()
const prev = () => {
  console.log('prev')
}
const next = () => {
  console.log('next')
}
</script>

<template>
  <div>
    <o-icon name="back" @click="prev" />
    <o-icon name="right" disabled @click="next" />
  </div>
</template>
