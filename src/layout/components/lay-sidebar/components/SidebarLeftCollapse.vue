<script setup lang="ts">
import { computed } from 'vue'
import { useGlobal } from '@pureadmin/utils'
import { useNav } from '@/layout/hooks/useNav'

import MenuFold from '@iconify-icons/ri/menu-fold-fill'

interface Props {
  isActive: boolean
}

withDefaults(defineProps<Props>(), {
  isActive: false,
})

const { tooltipEffect } = useNav()

const iconClass = computed(() => {
  return ['w-[16px]', 'h-[16px]', 'inline-block', 'align-middle', 'cursor-pointer', 'duration-[100ms]']
})

const { $storage } = useGlobal<GlobalPropertiesApi>()
const themeColor = computed(() => $storage.layout?.themeColor)

const emit = defineEmits<{
  (e: 'toggleClick'): void
}>()

const toggleClick = () => {
  emit('toggleClick')
}
</script>

<template>
  <div class="left-collapse cp" :style="{ width: isActive ? '50%' : '100%' }" @click="toggleClick">
    <o-tooltip :content="isActive ? '点击折叠' : '点击展开'">
      <IconifyIconOffline
        :icon="MenuFold"
        :class="[iconClass, themeColor === 'light' ? '' : 'text-primary']"
        :style="{ transform: isActive ? 'none' : 'rotateY(180deg)' }"
      />
    </o-tooltip>
  </div>
</template>

<style lang="scss" scoped>
.left-collapse {
  position: absolute;
  bottom: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  height: 40px;
  line-height: 40px;
  cursor: pointer;
  box-shadow: 0 0 6px -3px var(--el-color-primary);
}
</style>
