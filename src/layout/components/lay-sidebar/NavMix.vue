<script setup lang="ts">
import { isAllEmpty } from '@pureadmin/utils'
import { useNav } from '@/layout/hooks/useNav'
import { ref, toRaw, watch, onMounted, nextTick } from 'vue'
import { useRenderIcon } from '@/components/ReIcon/src/hooks'
import { getParentPaths, findRouteByPath } from '@/router/utils'
import { usePermissionStoreHook } from '@/store/modules/permission'
import LaySidebarExtraIcon from '../lay-sidebar/components/SidebarExtraIcon.vue'

import RightLayout from '@/layout/components/lay-sidebar/rightLayout.vue'

const menuRef = ref()
const defaultActive = ref(null)

const { route, device, resolvePath, getDivStyle } = useNav()

function getDefaultActive(routePath) {
  const wholeMenus = usePermissionStoreHook().wholeMenus
  /** 当前路由的父级路径 */
  const parentRoutes = getParentPaths(routePath, wholeMenus)[0]
  defaultActive.value = !isAllEmpty(route.meta?.activePath)
    ? route.meta.activePath
    : findRouteByPath(parentRoutes, wholeMenus)?.children[0]?.path
}

onMounted(() => {
  getDefaultActive(route.path)
})

nextTick(() => {
  menuRef.value?.handleResize()
})

watch(
  () => [route.path, usePermissionStoreHook().wholeMenus],
  () => {
    getDefaultActive(route.path)
  },
)
</script>

<template>
  <div
    v-if="device !== 'mobile'"
    v-loading="usePermissionStoreHook().wholeMenus.length === 0"
    class="horizontal-header"
  >
    <el-menu
      ref="menuRef"
      router
      mode="horizontal"
      popper-class="pure-scrollbar"
      class="horizontal-header-menu"
      :default-active="defaultActive"
    >
      <el-menu-item
        v-for="route in usePermissionStoreHook().wholeMenus"
        :key="route.path"
        :index="resolvePath(route) || route.redirect"
      >
        <template #title>
          <div v-if="toRaw(route.meta.icon)" :class="['sub-menu-icon', route.meta.icon]">
            <component :is="useRenderIcon(route.meta && toRaw(route.meta.icon))" />
          </div>
          <div :style="getDivStyle">
            <span class="select-none">
              {{ route.meta.title }}
            </span>
            <LaySidebarExtraIcon :extraIcon="route.meta.extraIcon" />
          </div>
        </template>
      </el-menu-item>
    </el-menu>

    <RightLayout class="horizontal-header-right" />
  </div>
</template>

<style lang="scss" scoped>
:deep(.el-loading-mask) {
  opacity: 0.45;
}

.logout {
  width: 120px;

  ::v-deep(.el-dropdown-menu__item) {
    display: inline-flex;
    flex-wrap: wrap;
    min-width: 100%;
  }
}
</style>
