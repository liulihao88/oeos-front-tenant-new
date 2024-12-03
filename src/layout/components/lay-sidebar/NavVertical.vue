<script setup lang="ts">
import { useRoute } from 'vue-router'
import { emitter } from '@/utils/mitt'
import { useNav } from '@/layout/hooks/useNav'
import { responsiveStorageNameSpace } from '@/config'
import { storageLocal, isAllEmpty } from '@pureadmin/utils'
import { findRouteByPath, getParentPaths } from '@/router/utils'
import { usePermissionStoreHook } from '@/store/modules/permission'
import { ref, computed, watch, onMounted, onBeforeUnmount, getCurrentInstance, nextTick } from 'vue'
// import LaySidebarLogo from '../lay-sidebar/components/SidebarLogo.vue'
import NewSidebarLogo from '@/layout/components/lay-sidebar/newSidebarLogo.vue'

import LaySidebarItem from '../lay-sidebar/components/SidebarItem.vue'
import LaySidebarLeftCollapse from '../lay-sidebar/components/SidebarLeftCollapse.vue'
import LaySidebarCenterCollapse from '../lay-sidebar/components/SidebarCenterCollapse.vue'

const { proxy } = getCurrentInstance()
const route = useRoute()
const isShow = ref(false)
const defaultOpeneds = ref([])
const isToggle = ref(true)
const showLogo = ref(
  storageLocal().getItem<StorageConfigs>(`${responsiveStorageNameSpace()}configure`)?.showLogo ?? true,
)

const { device, pureApp, isCollapse, tooltipEffect, menuSelect, toggleSideBar } = useNav()

const subMenuData = ref([])

const menuData = computed(() => {
  return pureApp.layout === 'mix' && device.value !== 'mobile' ? subMenuData.value : usePermissionStoreHook().wholeMenus
})

const initOpeneds = (type: boolean | '' = '') => {
  if (type === true) {
    let res = menuData.value.map((v) => {
      return v.path
    })

    return res
  } else if (type === false) {
    return []
  }
  if (!proxy.$dev) {
    return []
  }
  return menuData.value.map((v) => {
    return v.path
  })
}
defaultOpeneds.value = initOpeneds()

const loading = computed(() => (pureApp.layout === 'mix' ? false : menuData.value.length === 0 ? true : false))

const defaultActive = computed(() => (!isAllEmpty(route.meta?.activePath) ? route.meta.activePath : route.path))

function getSubMenuData() {
  let path = ''
  path = defaultActive.value
  subMenuData.value = []
  // path的上级路由组成的数组
  const parentPathArr = getParentPaths(path, usePermissionStoreHook().wholeMenus)
  // 当前路由的父级路由信息
  const parenetRoute = findRouteByPath(parentPathArr[0] || path, usePermissionStoreHook().wholeMenus)
  if (!parenetRoute?.children) return
  subMenuData.value = parenetRoute?.children
}

const toggleOpen = async () => {
  isToggle.value = false
  let res = initOpeneds(defaultOpeneds.value.length === 0 ? true : false)
  defaultOpeneds.value = res
  await nextTick()
  isToggle.value = true
}

watch(
  () => [route.path, usePermissionStoreHook().wholeMenus],
  () => {
    if (route.path.includes('/redirect')) return
    getSubMenuData()
    menuSelect(route.path)
  },
)

const openContent = computed(() => {
  return defaultOpeneds.value.length === 0 ? '展开所有菜单' : '折叠所有菜单'
})

const iconTransform = computed(() => {
  const deg = defaultOpeneds.value.length === 0 ? '-90deg' : '0deg'
  return {
    transform: `rotate(${deg})`,
  }
})

onMounted(() => {
  getSubMenuData()

  emitter.on('logoChange', (key) => {
    showLogo.value = key
  })
})

onBeforeUnmount(() => {
  // 解绑`logoChange`公共事件，防止多次触发
  emitter.off('logoChange')
})
</script>

<template>
  <div
    v-loading="loading"
    :class="['sidebar-container', showLogo ? 'has-logo' : 'no-logo']"
    @mouseenter.prevent="isShow = true"
    @mouseleave.prevent="isShow = false"
  >
    <!-- <LaySidebarLogo v-if="showLogo" :collapse="isCollapse" /> -->
    <NewSidebarLogo :collapse="isCollapse" />
    <el-scrollbar wrap-class="scrollbar-wrapper" :class="[device === 'mobile' ? 'mobile' : 'pc']">
      <el-menu
        v-if="isToggle"
        :unique-opened="false"
        mode="vertical"
        :default-openeds="defaultOpeneds"
        popper-class="pure-scrollbar"
        class="outer-most select-none"
        :collapse="isCollapse"
        :collapse-transition="false"
        :popper-effect="tooltipEffect"
        :default-active="defaultActive"
      >
        <LaySidebarItem
          v-for="routes in menuData"
          :key="routes.path"
          :item="routes"
          :base-path="routes.path"
          class="outer-most select-none"
        />
      </el-menu>
    </el-scrollbar>
    <LaySidebarCenterCollapse
      v-if="device !== 'mobile' && (isShow || isCollapse)"
      :is-active="pureApp.sidebar.opened"
      @toggleClick="toggleSideBar"
    />
    <LaySidebarLeftCollapse
      v-if="device !== 'mobile'"
      class="f-1"
      :is-active="pureApp.sidebar.opened"
      @toggleClick="toggleSideBar"
    />
    <div v-if="!isCollapse" class="right-collapse" @click="toggleOpen">
      <o-tooltip :content="openContent" width="100%" style="width: 100%" class="cp">
        <div class="h-40 w-100% f-ct-ct">
          <o-icon name="expand" :style="iconTransform" type="svg" class="icon-el" />
        </div>
      </o-tooltip>
    </div>
  </div>
</template>

<style scoped>
:deep(.el-loading-mask) {
  opacity: 0.45;
}

.bottom-box {
  display: flex;
  width: 100%;
}

.right-collapse {
  position: absolute;
  right: 0;
  bottom: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 50%;
  height: 40px;
  line-height: 40px;
  cursor: pointer;
  box-shadow: 0 0 6px -3px var(--el-color-primary);

  .icon-el {
    transition: all 0.2s ease-out;
  }
}
</style>
