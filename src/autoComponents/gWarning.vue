<script setup lang="ts">
import { ref, getCurrentInstance } from 'vue'
const { proxy } = getCurrentInstance()
const props = defineProps({
  title: {
    type: String,
    required: true,
  },
})
</script>

<template>
  <div class="warning-box" v-bind="$attrs">
    <img src="@/assets/images/notic.png" class="w-16 h-16" />
    <span class="warning-box__title">
      <slot name="title">
        <span v-html="title" />
      </slot>
    </span>
  </div>
</template>

<style lang="scss" scoped>
.warning-box {
  display: flex;
  align-items: top;
  width: 100%;
  min-height: 32px;
  padding: 8px 16px;
  background: #fffaf4;
  border: 1px solid #dfca9e;
  border-radius: 2px;

  .warning-box__title {
    margin-left: 4px;
    font-size: 13px;
    font-weight: 400;
    color: #796551;
  }
}
</style>
