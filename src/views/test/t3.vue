<script setup lang="ts">
import { ref, getCurrentInstance } from 'vue'
const { proxy } = getCurrentInstance()
</script>

<template>
  <div>
    <div>test/t3.vue</div>
    <div v-for="(v, i) in 200" :key="i">
      <div>{{ v }}</div>
    </div>
  </div>
</template>
