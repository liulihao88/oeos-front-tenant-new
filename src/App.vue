<template>
  <el-config-provider :locale="currentLocale">
    <router-view v-if="useRefresh.refresh" />
    <ReDialog />
    <nativeRefresh ref="refreshRef" />
  </el-config-provider>
</template>

<script lang="ts" setup>
import Mousetrap from 'mousetrap'
console.log(`08 Mousetrap`, Mousetrap)
import { defineComponent, computed, onMounted } from 'vue'
import { ElConfigProvider } from 'element-plus'
import { ReDialog } from '@/components/ReDialog'
import zhCn from 'element-plus/es/locale/lang/zh-cn'
import nativeRefresh from '@/components/nativeRefresh.vue'
import useNativeRefresh from '@/store/nativeRefresh.js'
const useRefresh = useNativeRefresh()

// export default defineComponent({
//   name: 'app',
//   components: {
//     [ElConfigProvider.name]: ElConfigProvider,
//     ReDialog,
//   },
//   computed: {
//     currentLocale() {
//       return zhCn
//     },
//   },
// })
</script>
