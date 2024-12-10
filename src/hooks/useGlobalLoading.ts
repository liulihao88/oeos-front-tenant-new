/**
 * @params
 * showLoading: 'loading' || true
 * <el-button :loading="loading"></el-button>
  import { loading1 } from "@/utils/request.js";
  request({
   showLoading: 'loading',
  })
 */

import { ref } from 'vue'
export function useGlobalLoading() {
  const useLoading = ref(false)
  const useLoading1 = ref(false)
  const useLoading2 = ref(false)
  const loadingNumberObj = ref({})
  const timer = ref(null)

  function loadingTrue(loadingText) {
    if (loadingText === true) {
      clearTimeout(timer.value)
      useLoading.value = true
      loadingNumberObj.value.true = loadingNumberObj.value.true ? loadingNumberObj.value.true + 1 : 1
      console.log(`38  loadingNumberObj.value.true`, loadingNumberObj.value.true)
    }
    if (loadingText === 'loading1') {
      clearTimeout(timer.value)
      useLoading1.value = true
      loadingNumberObj.value.loading1 = loadingNumberObj.value.loading1 ? loadingNumberObj.value.loading1 + 1 : 1
    }
    if (loadingText === 'loading2') {
      clearTimeout(timer.value)
      useLoading2.value = true
      loadingNumberObj.value.loading2 = loadingNumberObj.value.loading2 ? loadingNumberObj.value.loading2 + 1 : 1
    }
  }

  function loadingFalse(loadingText: boolean | string = '') {
    timer.value = setTimeout(() => {
      if (!loadingText) {
        useLoading.value = false
        useLoading1.value = false
        useLoading2.value = false
        loadingNumberObj.value = {}
      }
      if (loadingText === true) {
        if (loadingNumberObj.value.true === 1) {
          useLoading.value = false
          delete loadingNumberObj.value.true
        } else {
          loadingNumberObj.value.true = loadingNumberObj.value.true - 1
        }
        console.log(` loadingNumberObj.value.true`, loadingNumberObj.value.true)
      }
      if (loadingText === 'loading1') {
        if (loadingNumberObj.value.loading1 === 1) {
          useLoading1.value = false
          loadingNumberObj.value.loading1 === ''
          delete loadingNumberObj.value.loading1
        } else {
          loadingNumberObj.value.loading1 = loadingNumberObj.value.loading1 - 1
        }
      }
      if (loadingText === 'loading2') {
        if (loadingNumberObj.value.loading2 === 1) {
          useLoading2.value = false
          loadingNumberObj.value.loading2 === ''
          delete loadingNumberObj.value.loading2
        } else {
          loadingNumberObj.value.loading2 = loadingNumberObj.value.loading2 - 1
        }
      }
    }, 30)
  }

  return {
    useLoading,
    useLoading1,
    useLoading2,
    loadingTrue,
    loadingFalse,
  }
}
