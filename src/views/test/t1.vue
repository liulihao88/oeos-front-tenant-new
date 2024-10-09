<script setup lang="ts">
import { ref, getCurrentInstance } from 'vue'
const { proxy } = getCurrentInstance()
</script>

<template>
  <div>
    <div>test/t1.vue</div>
    <div class="w-200">
      <o-tooltip
        content="2024-10-09 17:19:05I want to set some random text, if you like it , please tell me. good wish for you! thank you so much. have a nice day!"
      />
    </div>
    奇怪啊
  </div>
</template>
