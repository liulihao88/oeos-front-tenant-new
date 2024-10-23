import { defineStore } from 'pinia'

const useBucketSettings = defineStore('bucketSettings', {
  state: () => ({
    prefixKey: '',
    prevFolderList: [],
  }),
  getters: {
    prefixKeyArr: (state) => {
      if (!state.prefixKey) return []
      let splitArr = state.prefixKey.split('/')
      // splitArr.unshift('根目录')
      console.log(`64 splitArr`, splitArr)
      return splitArr.filter((v) => v)
    },
  },
  actions: {
    changePrefixKey(key) {
      this.prefixKey = key
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
    },
    clear() {
      this.prefixKey = ''
      this.prevFolderList = []
    },
  },
})

export default useBucketSettings
