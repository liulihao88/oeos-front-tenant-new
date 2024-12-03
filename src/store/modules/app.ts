import { defineStore } from 'pinia'
import { type appType, store, getConfig, storageLocal, deviceDetection, responsiveStorageNameSpace } from '../utils'
import { getStorage, setStorage, clearStorage } from 'oeos-components'

export const useAppStore = defineStore({
  id: 'pure-app',
  state: (): appType => ({
    sidebar: {
      opened:
        storageLocal().getItem<StorageConfigs>(`${responsiveStorageNameSpace()}layout`)?.sidebarStatus ??
        getConfig().SidebarStatus,
      withoutAnimation: false,
      isClickCollapse: false,
      expand: getStorage('tenant-expand') ?? [], // 要展开的菜单项
    },
    // 这里的layout用于监听容器拖拉后恢复对应的导航模式
    layout:
      storageLocal().getItem<StorageConfigs>(`${responsiveStorageNameSpace()}layout`)?.layout ?? getConfig().Layout,
    device: deviceDetection() ? 'mobile' : 'desktop',
    // 浏览器窗口的可视区域大小
    viewportSize: {
      width: document.documentElement.clientWidth,
      height: document.documentElement.clientHeight,
    },
  }),
  getters: {
    getSidebarStatus(state) {
      return state.sidebar.opened
    },
    getDevice(state) {
      return state.device
    },
    getViewportWidth(state) {
      return state.viewportSize.width
    },
    getViewportHeight(state) {
      return state.viewportSize.height
    },
    getExpand(state) {
      return state.sidebar.expand
    },
  },
  actions: {
    TOGGLE_EXPAND(expandArr: Array<string> | string, isAdd: boolean = true) {
      if (Array.isArray(expandArr)) {
        this.sidebar.expand = expandArr
      } else {
        if (isAdd) {
          this.sidebar.expand = [...new Set([...this.sidebar.expand, expandArr])]
        } else {
          this.sidebar.expand = this.sidebar.expand.filter((item) => item !== expandArr)
        }
      }
      setStorage('tenant-expand', this.sidebar.expand)
    },
    TOGGLE_SIDEBAR(opened?: boolean, resize?: string) {
      const layout = storageLocal().getItem<StorageConfigs>(`${responsiveStorageNameSpace()}layout`)
      if (opened && resize) {
        this.sidebar.withoutAnimation = true
        this.sidebar.opened = true
        layout.sidebarStatus = true
      } else if (!opened && resize) {
        this.sidebar.withoutAnimation = true
        this.sidebar.opened = false
        layout.sidebarStatus = false
      } else if (!opened && !resize) {
        this.sidebar.withoutAnimation = false
        this.sidebar.opened = !this.sidebar.opened
        this.sidebar.isClickCollapse = !this.sidebar.opened
        layout.sidebarStatus = this.sidebar.opened
        // sidebar点击变窄的时候, 将default-openeds的菜单置空
        this.TOGGLE_EXPAND([])
      }
      storageLocal().setItem(`${responsiveStorageNameSpace()}layout`, layout)
    },
    async toggleSideBar(opened?: boolean, resize?: string) {
      await this.TOGGLE_SIDEBAR(opened, resize)
    },
    toggleDevice(device: string) {
      this.device = device
    },
    setLayout(layout) {
      this.layout = layout
    },
    setViewportSize(size) {
      this.viewportSize = size
    },
    setSortSwap(val) {
      this.sortSwap = val
    },
  },
})

export function useAppStoreHook() {
  return useAppStore(store)
}
