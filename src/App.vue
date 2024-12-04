<template>
  <el-config-provider :locale="currentLocale">
    <transition name="fade">
      <router-view v-if="useRefresh.refresh" />
    </transition>
    <ReDialog />
  </el-config-provider>
</template>

<script lang="ts" setup>
import { ref } from 'vue'
import { ElConfigProvider } from 'element-plus'
import zhCn from 'element-plus/es/locale/lang/zh-cn'

import useNativeRefresh from '@/store/nativeRefresh'
const useRefresh = useNativeRefresh()
const currentLocale = ref(zhCn)

document.addEventListener('mouseover', function (event) {
  if (event.target && event.target.title) {
    event.target.title = '' // 清空title
    event.preventDefault() // 阻止默认行为
  }
})
</script>
