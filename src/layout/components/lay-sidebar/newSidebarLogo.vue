<script setup lang="ts">
import { ref, getCurrentInstance } from 'vue'
const { proxy } = getCurrentInstance()
import useLogoSettings from '@/store/modules/logoSettings.ts'
import globalLogoSettings from '@/config/settings.ts'
import { useNav } from '@/layout/hooks/useNav'

const props = defineProps({
  collapse: {
    type: Boolean,
  },
})

const storeLogoSettings = useLogoSettings()
const { title, backTopMenu } = useNav()
</script>

<template>
  <div>
    <div class="horizontal-header-left" @click="backTopMenu">
      <img
        :src="
          storeLogoSettings.nativeLogo?.tenantManagementImage || globalLogoSettings.nativeLogo.tenantManagementImage
        "
        :width="props.collapse ? 30 : 70"
        style="height: 20px; object-fit: contain"
      />

      <div v-if="!collapse" class="title">租户管理平台</div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.horizontal-header-left {
  display: flex;
  align-items: center;
  width: 100%;
  height: 100%;
  height: 48px;
  padding-left: 10px;
  cursor: pointer;
  border-bottom: 1px solid var(--line);
  transition: all var(--pure-transition-duration) ease;

  img {
    display: inline-block;
  }

  .title {
    display: inline-block;
    // flex: 1;
    width: calc(100% - 70px);
    height: 48px;
    margin: 2px 0 0 12px;
    font-size: 18px;
    font-weight: 600;
    line-height: 48px;
    color: $subMenuActiveText;
    white-space: nowrap;
  }
}
</style>
