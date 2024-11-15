/**
import useLogoSettings from "@/store/modules/logoSettings.ts";
const storeLogoSettings = useLogoSettings()

 */

import { defineStore } from 'pinia'
import { getStorage, clone } from 'oeos-components'
import settings from '@/config/settings.ts'
import { setFavIcon } from '@/utils/gFunc.ts'

const useLogoSettings = defineStore(
  'logoSettings',
  {
    state: () => ({
      nativeLogo: getStorage('tenant-logo-settings') ?? {},
    }),

    actions: {
      changeSettings(val) {
        this.nativeLogo = clone(val)
        setFavIcon(val.favariteIcon || settings.nativeLogo.favariteIcon)
        // document.title = val.tenantManagementTitle || settings.nativeLogo.tenantManagementTitle
      },
    },
  },
  {
    persist: {
      storage: sessionStorage,
      paths: ['nativeLogo'],
    },
  },
)

export default useLogoSettings
