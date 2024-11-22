<script setup lang="ts">
import { isAllEmpty } from '@pureadmin/utils'
import { ref, nextTick, computed } from 'vue'
import { useNav } from '@/layout/hooks/useNav'
import { usePermissionStoreHook } from '@/store/modules/permission'
import LaySidebarItem from '../lay-sidebar/components/SidebarItem.vue'

import NewSidebarLogo from '@/layout/components/lay-sidebar/newSidebarLogo.vue'

import RightLayout from '@/layout/components/lay-sidebar/rightLayout.vue'

const menuRef = ref()

const { route } = useNav()

const defaultActive = computed(() => (!isAllEmpty(route.meta?.activePath) ? route.meta.activePath : route.path))

nextTick(() => {
  menuRef.value?.handleResize()
})
</script>

<template>
  <div v-loading="usePermissionStoreHook().wholeMenus.length === 0" class="horizontal-header">
    <NewSidebarLogo />
    <el-menu
      ref="menuRef"
      mode="horizontal"
      popper-class="pure-scrollbar"
      class="horizontal-header-menu"
      :default-active="defaultActive"
    >
      <LaySidebarItem
        v-for="route in usePermissionStoreHook().wholeMenus"
        :key="route.path"
        :item="route"
        :base-path="route.path"
      />
    </el-menu>

    <RightLayout class="horizontal-header-right" />
  </div>
</template>

<style lang="scss" scoped>
:deep(.el-loading-mask) {
  opacity: 0.45;
}
</style>
