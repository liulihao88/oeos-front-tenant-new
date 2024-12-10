<script setup lang="ts">
import { ref, getCurrentInstance, unref } from 'vue'
const { proxy } = getCurrentInstance()
import { handleAliveRoute } from '@/router/utils'
import RefreshRight from '@iconify-icons/ep/refresh-right'
import { useNav } from '@/layout/hooks/useNav'
import ModifyPassword from '@/layout/components/lay-sidebar/modifyPassword.vue'
import DropdownLayout from '@/layout/components/dropdownLayout.vue'
import LaySidebarFullScreen from '@/layout/components/lay-sidebar/components/SidebarFullScreen.vue'
import LayoutFileList from '@/layout/components/lay-sidebar/layoutFileList.vue'

import Setting from '@iconify-icons/ri/settings-3-line'

import { useRouter, useRoute } from 'vue-router'
const router = useRouter()
const route = useRoute()

const { onPanel } = useNav()
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
  <div class="vertical-header-right">
    <div class="mr">
      <div>
        当前租户: {{ proxy.getStorage('tenant-sysdomain').tenantName }} [
        {{ proxy.getStorage('tenant-sysdomain').tenantId }} ]
      </div>
    </div>
    <!-- 退出登录 -->
    <DropdownLayout />
    <o-tooltip content="刷新">
      <div class="search-container w-[40px] h-[48px] flex-c cursor-pointer navbar-bg-hover" @click="onFresh">
        <IconifyIconOffline :icon="RefreshRight" />
      </div>
    </o-tooltip>

    <LayoutFileList />

    <!-- 全屏 -->
    <LaySidebarFullScreen id="full-screen" />

    <span class="set-icon navbar-bg-hover" title="打开系统配置" @click="onPanel">
      <IconifyIconOffline :icon="Setting" />
    </span>
    <ModifyPassword ref="modifyPasswordRef" />
  </div>
</template>
