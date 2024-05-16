<script setup lang="ts">
import { ref, getCurrentInstance } from 'vue'
const { proxy } = getCurrentInstance()
const obj = {
  name: 'andy',
  age: 18,
  arr: [1, 2, 3],
}
</script>

<template>
  <div>
    <div>test/t1.vue</div>
  </div>
</template>
