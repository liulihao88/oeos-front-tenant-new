<script setup lang="ts">
import { unref, getCurrentInstance, ref } from 'vue'
import { useNav } from '@/layout/hooks/useNav'
import LaySearch from '../lay-search/index.vue'
import LayNavMix from '../lay-sidebar/NavMix.vue'
import LaySidebarFullScreen from '../lay-sidebar/components/SidebarFullScreen.vue'
import LaySidebarBreadCrumb from '../lay-sidebar/components/SidebarBreadCrumb.vue'
import LaySidebarTopCollapse from '../lay-sidebar/components/SidebarTopCollapse.vue'
import ModifyPassword from '@/layout/components/lay-sidebar/modifyPassword.vue'
import { handleAliveRoute, getTopMenu } from '@/router/utils'
import DropdownLayout from '@/layout/components/dropdownLayout.vue'

import LogoutCircleRLine from '@iconify-icons/ri/logout-circle-r-line'
import Setting from '@iconify-icons/ri/settings-3-line'
import RefreshRight from '@iconify-icons/ep/refresh-right'
const { proxy } = getCurrentInstance()
const { layout, device, logout, onPanel, pureApp, username, userAvatar, avatarsStyle, toggleSideBar } = useNav()
import { useRouter, useRoute } from 'vue-router'
const router = useRouter()
const route = useRoute()
const modifyPasswordRef = ref(null)
function onFresh() {
  const { fullPath, query } = unref(route)
  router.replace({
    path: '/redirect' + fullPath,
    query,
  })
  handleAliveRoute(route, 'refresh')
}
</script>

<template>
  <div class="navbar bg-[#fff] shadow-sm shadow-[rgba(0,21,41,0.08)]">
    <LaySidebarTopCollapse
      v-if="device === 'mobile'"
      class="hamburger-container"
      :is-active="pureApp.sidebar.opened"
      @toggleClick="toggleSideBar"
    />

    <LaySidebarBreadCrumb v-if="layout !== 'mix' && device !== 'mobile'" class="breadcrumb-container" />

    <LayNavMix v-if="layout === 'mix'" />

    <div v-if="layout === 'vertical'" class="vertical-header-right">
      <div class="mr">
        <div>
          当前租户: {{ proxy.getStorage('tenant-sysdomain').tenantName }} [
          {{ proxy.getStorage('tenant-sysdomain').tenantId }} ]
        </div>
      </div>
      <o-tooltip content="刷新">
        <div class="search-container w-[40px] h-[48px] flex-c cursor-pointer navbar-bg-hover" @click="onFresh">
          <IconifyIconOffline :icon="RefreshRight" />
        </div>
      </o-tooltip>

      <!-- 全屏 -->
      <LaySidebarFullScreen id="full-screen" />

      <!-- 退出登录 -->
      <DropdownLayout />
      <span class="set-icon navbar-bg-hover" title="打开系统配置" @click="onPanel">
        <IconifyIconOffline :icon="Setting" />
      </span>
    </div>
    <ModifyPassword ref="modifyPasswordRef" />
  </div>
</template>

<style lang="scss" scoped>
.navbar {
  width: 100%;
  height: 48px;
  overflow: hidden;

  .hamburger-container {
    float: left;
    height: 100%;
    line-height: 48px;
    cursor: pointer;
  }

  .vertical-header-right {
    display: flex;
    align-items: center;
    justify-content: flex-end;
    min-width: 280px;
    height: 48px;
    color: #000000d9;
  }

  .breadcrumb-container {
    float: left;
    margin-left: 16px;
  }
}
</style>
