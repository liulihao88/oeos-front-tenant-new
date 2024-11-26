<script setup lang="ts">
import { ref, getCurrentInstance, computed } from 'vue'
const { proxy } = getCurrentInstance()
const props = defineProps({
  src: {
    type: String,
  },
  path: {
    type: String,
    default: '',
  },
  width: {
    type: [String, Number],
  },
  height: {
    type: [String, Number],
  },
})

const parseStyle = computed(() => {
  if (!props.width && !props.height) {
    return { width: '16px' }
  }
  return {
    width: proxy.processWidth(props.width, true),
    height: proxy.processWidth(props.height, true),
  }
})
</script>

<template>
  <img :src="proxy.formatImg(props.src, props.path)" v-bind="$attrs" class="img-box" :style="parseStyle" />
</template>
