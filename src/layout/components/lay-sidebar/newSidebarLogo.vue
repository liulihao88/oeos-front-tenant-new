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
      <o-tooltip :content="title" :disabled="!props.collapse">
        <img
          :src="
            storeLogoSettings.nativeLogo?.tenantManagementImage || globalLogoSettings.nativeLogo.tenantManagementImage
          "
          :width="props.collapse ? 30 : 50"
          style="object-fit: contain"
        />
      </o-tooltip>

      <div v-if="!collapse" class="title">
        <o-tooltip :content="title" width="100%" />
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.horizontal-header-left {
  display: flex;
  align-items: center;
  width: 100%;
  height: 100%;
  height: 32px;
  padding-left: 10px;
  cursor: pointer;
  transition: all var(--pure-transition-duration) ease;

  img {
    display: inline-block;
  }

  .title {
    display: inline-block;
    // flex: 1;
    width: calc(100% - 50px);
    height: 32px;
    margin: 2px 0 0 12px;
    font-size: 18px;
    font-weight: 600;
    line-height: 32px;
    color: $subMenuActiveText;
    white-space: nowrap;
  }
}
</style>
