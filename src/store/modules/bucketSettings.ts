import { defineStore } from 'pinia'

const useBucketSettings = defineStore('bucketSettings', {
  state: () => ({
    prefixKey: '',
    prevFolderList: [], // 上一页的列表
  }),
  getters: {
    prefixKeyArr: (state) => {
      if (!state.prefixKey) return []
      let splitArr = state.prefixKey.split('/')
      console.log(`64 splitArr`, splitArr)
      return splitArr.filter((v) => v)
    },
  },
  actions: {
    changePrefixKey(key) {
      this.prefixKey = key
      this.prevFolderList = []
    },
    changePrevFolder(key = '') {
      if (!key) {
        this.prevFolderList.pop()
      } else {
        this.prevFolderList.push(key)
      }
    },
    clearPrefixKey() {
      this.prefixKey = ''
      this.prevFolderList = []
    },
    clear() {
      this.prefixKey = ''
      this.prevFolderList = []
    },
  },
})

export default useBucketSettings
