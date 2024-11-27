<script setup lang="ts">
/**
 * @描述
 * 本地按钮进行刷新, 不用按ctrl+r就能直接在浏览器刷新.  方便调试和开发
 * 快捷键 cmd + return
 */
import Mousetrap from 'mousetrap'
import { ref, getCurrentInstance, nextTick, onMounted } from 'vue'
import { useDataThemeChange } from '@/layout/hooks/useDataThemeChange'
import useNativeRefresh from '@/store/nativeRefresh.js'

const { proxy } = getCurrentInstance()
const instance = getCurrentInstance()
const useRefresh = useNativeRefresh()

const { onReset } = useDataThemeChange()

import { useNav } from '@/layout/hooks/useNav'
const { logout } = useNav()

onMounted(() => {
  Mousetrap.bind('command+enter', function () {
    // 执行你想要的操作
    nativeRefresh()
  })
})

function nativeRefresh() {
  console.clear()
  useRefresh.refreshHandler()
}
const isDev = ref(proxy.$dev)
function changeMode() {
  isDev.value = !isDev.value
  instance.appContext.app.config.globalProperties.$dev = isDev.value
  proxy.setStorage('tenant-$dev', isDev.value)
  nativeRefresh()
}
defineExpose({
  nativeRefresh,
})
</script>

<template>
  <el-button
    v-show="isDev"
    id="nativeRefreshBtn"
    type="danger"
    class="po-f r-500 t-8"
    style="right: calc(50% - 0px); z-index: 999"
    size="small"
    @click="logout"
  >
    退出
  </el-button>
  <el-button
    v-show="isDev"
    id="nativeRefreshBtn"
    type="danger"
    class="po-f r-500 t-8"
    style="right: calc(50% - 50px); z-index: 999"
    size="small"
    @click="nativeRefresh"
  >
    刷新
  </el-button>
  <el-button
    id="nativeRefreshBtn"
    :type="isDev ? 'danger' : 'primary'"
    class="po-f t-8 r-550"
    style="right: calc(50% - 100px); z-index: 999"
    size="small"
    @click="changeMode"
  >
    {{ isDev ? '开发' : '生产' }}
  </el-button>
  <el-button
    v-show="isDev"
    class="po-f t-8 r-600"
    size="small"
    style="right: calc(50% - 164px); z-index: 999"
    type="danger"
    @click="onReset"
  >
    清缓存
  </el-button>
</template>
