<script setup lang="ts">
import { ref, getCurrentInstance } from 'vue'
const { proxy } = getCurrentInstance()
const props = defineProps({
  content: {
    type: String,
    required: true,
  },
  type: {
    type: String,
    default: '',
  },
})
</script>

<template>
  <template v-if="type === 'icon'">
    <div class="f-st-ct">
      <o-icon name="warning" size="16" :color="'var(--45)'" v-bind="$attrs" class="mr" />
      <slot name="content">
        <div class="fs-14 cl-45">{{ content }}</div>
      </slot>
    </div>
  </template>
  <template v-else>
    <div class="warning-box" v-bind="$attrs">
      <img src="@/assets/images/notic.png" class="w-16 h-16" />
      <span class="warning-box__title">
        <slot name="content">
          <span v-html="content" />
        </slot>
      </span>
    </div>
  </template>
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
