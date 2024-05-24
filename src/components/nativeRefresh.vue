<script setup lang="ts">
/**
 * @描述
 * 本地按钮进行刷新, 不用按ctrl+r就能直接在浏览器刷新.  方便调试和开发
 * 快捷键 cmd + return
 */
import Mousetrap from 'mousetrap'
import { ref, getCurrentInstance, nextTick, onMounted } from 'vue'
const { proxy } = getCurrentInstance()
const instance = getCurrentInstance()
import useNativeRefresh from '@/store/nativeRefresh.js'
const useRefresh = useNativeRefresh()

// addHotKey()
// function addHotKey() {
//   nextTick(() => {
//     let hasBtn = document.getElementById('nativeRefreshBtn')
//     if (!hasBtn) {
//       return
//     }
//     // 通过检查event.metaKey（Mac上的Command键）或event.ctrlKey（Windows上的Ctrl键）以及event.key是否为"Enter"来判断同时按下了Command键和回车键。
//     document.addEventListener('keydown', (event) => {
//       if ((event.metaKey || event.ctrlKey) && event.key === 'Enter') {
//         nativeRefresh()
//       }
//     })
//   })
// }
onMounted(() => {
  Mousetrap.bind('command+enter', function () {
    // 执行你想要的操作
    nativeRefresh()
  })
})

function nativeRefresh() {
  useRefresh.refreshHandler()
}
const isDev = ref(proxy.$dev)
function changeMode() {
  isDev.value = !isDev.value
  instance.appContext.app.config.globalProperties.$dev = isDev.value
  nativeRefresh()
}
defineExpose({
  nativeRefresh,
})
</script>

<template>
  <el-button v-show="isDev" id="nativeRefreshBtn" type="danger" class="po-f r-100 t-8 z-900" @click="nativeRefresh">
    本地刷新
  </el-button>
  <!-- <el-button
    @click="changeMode"
    :type="isDev ? 'danger' : 'primary'"
    class="po-f r-200 t-8 z-900"
    id="nativeRefreshBtn"
  >
    {{ isDev ? '开发模式(便于测试)' : '生产模式' }}
  </el-button> -->
</template>
