import { defineStore } from 'pinia'
import { nextTick } from 'vue'

const useNativeRefresh = defineStore('nativeRefresh', {
  state: () => ({
    refresh: true,
  }),

  actions: {
    refreshHandler() {
      this.refresh = false
      nextTick(() => {
        this.refresh = true
      })
    },
  },
})

export default useNativeRefresh
