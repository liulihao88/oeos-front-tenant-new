<script setup lang="ts">
import { ref, getCurrentInstance, computed, useAttrs } from 'vue'
import { processWidth } from 'oeos-components'
const { proxy } = getCurrentInstance()
const props = defineProps({
  content: {
    type: String,
    required: true,
  },
  type: {
    type: String,
    default: '', // icon
  },
  width: {
    type: [String, Number],
    default: '100%',
  },
})
</script>

<template>
  <template v-if="type === 'icon'">
    <div class="icon-box">
      <o-icon name="warning" :color="'var(--45)'" v-bind="$attrs" class="icon" />
      <slot name="content">
        <div class="fs-14 cl-45" v-html="content" />
      </slot>
    </div>
  </template>
  <template v-else>
    <div class="warning-box" :style="{ ...processWidth(props.width) }" v-bind="$attrs">
      <img src="@/assets/images/notic.png" class="icon" />
      <span class="warning-box__content">
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
  align-items: baseline;
  min-height: 32px;
  padding: 8px;
  background: #fffaf4;
  border: 1px solid #dfca9e;
  border-radius: 2px;

  .warning-box__content {
    margin-left: 4px;
    font-size: 14px;
    font-weight: 400;
    color: #796551;
  }
}

.icon-box {
  display: flex;
  align-items: baseline;
  min-height: 32px;
  padding: 8px;
  border-radius: 2px;
}

.icon {
  position: relative;
  top: 2px;
  width: 16px;
  height: 16px;
  margin-right: 2px;
}
</style>
