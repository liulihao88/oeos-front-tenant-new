import { defineStore } from 'pinia'
import { store } from '../utils'

export const useBucketSettings = defineStore({
  id: 'pure-setting',
  state: () => ({
    title: '哈哈',
  }),
  getters: {
    getTitle(state) {
      return state.title
    },
  },
  actions: {
    changeSetting(data) {
      this.title = data
    },
  },
})

export function useSettingStoreHook() {
  return useBucketSettings(store)
}
