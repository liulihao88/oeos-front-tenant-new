<script setup lang="ts">
import { unref, getCurrentInstance, ref } from 'vue'
import { useNav } from '@/layout/hooks/useNav'
import LayNavMix from '../lay-sidebar/NavMix.vue'
import LaySidebarBreadCrumb from '../lay-sidebar/components/SidebarBreadCrumb.vue'
import LaySidebarTopCollapse from '../lay-sidebar/components/SidebarTopCollapse.vue'
import { handleAliveRoute, getTopMenu } from '@/router/utils'
import RightLayout from '@/layout/components/lay-sidebar/rightLayout.vue'

const { proxy } = getCurrentInstance()
const { layout, device, pureApp, toggleSideBar } = useNav()
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

    <RightLayout v-if="layout === 'vertical'" />
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
