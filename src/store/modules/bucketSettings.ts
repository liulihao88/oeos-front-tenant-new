import { defineStore } from 'pinia'

const useBucketSettings = defineStore('bucketSettings', {
  state: () => ({
    prefixKey: '',
    prevFolderList: [], // 上一页的列表
    prevList: [''],
    nextList: [''],
  }),
  getters: {
    prefixKeyArr: (state) => {
      if (!state.prefixKey) return []
      let splitArr = state.prefixKey.split('/')
      return splitArr.filter((v) => v)
    },
  },
  actions: {
    changePrefixKey(key) {
      this.prefixKey = key
      this.prevFolderList = []
      this.pushPrev(key)
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
      this.prevList = ['']
      this.nextList = ['']
    },

    // 上一步, 下一步
    pushPrev(folder) {
      if (folder === this.prevList.at(-1)) {
        return
      }
      this.prevList.push(folder)
      // this.prevList = [...new Set(this.prevList)]
    },
    pushNext(folder) {
      this.nextList.push(folder)
      // this.nextList = [...new Set(this.nextList)]
    },
    // 返回上一步
    returnPrev() {
      let pop = this.prevList.pop()
      this.prefixKey = this.prevList.at(-1)
      this.nextList.push(pop)
    },
    // 返回下一步
    returnNext() {
      let pop = this.nextList.pop()
      this.prefixKey = pop
      this.prevList.push(pop)
    },
  },
})

export default useBucketSettings
