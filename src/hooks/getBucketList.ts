/**
 *
 import useBucketList from '@/hooks/getBucketList.ts'
 const bucketList = useBucketList()
 */

import { ref } from 'vue'
import { defineStore } from 'pinia'
import { getBucketOptions } from '@/api/bucketReview.ts'
import { getStorage, clearStorage, setStorage } from 'oeos-components'

const useGetBucketList = defineStore('getBucketList', {
  state: () => ({
    bucketOptions: getStorage('tenant-bucket-options') ?? [],
  }),
  actions: {
    async getBucketList() {
      if (this.bucketOptions.length === 0) {
        let res = await getBucketOptions()
        this.bucketOptions = res ?? []
        this._clearEmptyId()
        setStorage('tenant-bucket-options', res ?? [])
      } else {
        this.bucketOptions = getStorage('tenant-bucket-options') ?? []
      }
    },
    async update(config = {}) {
      let res = await getBucketOptions(config)
      this.bucketOptions = res ?? []
      this._clearEmptyId()
      setStorage('tenant-bucket-options', res ?? [])
    },
    _clearEmptyId() {
      let bucketId = getStorage('tenant-bucket-id') ?? ''
      let bucketEasyId = getStorage('tenant-easy-bucket-id') ?? ''
      let bucketFreezeId = getStorage('tenant-freeze-bucket-id') ?? ''
      if (bucketId) {
        let hasId = this.bucketOptions.some((v) => v.value === bucketId)
        if (!hasId) {
          clearStorage('tenant-bucket-id')
        }
      }
      if (bucketEasyId) {
        let hasId = this.bucketOptions.some((v) => v.value === bucketEasyId)
        if (!hasId) {
          clearStorage('tenant-easy-bucket-id')
        }
      }
      if (bucketFreezeId) {
        let hasId = this.bucketOptions.some((v) => v.value === bucketFreezeId)
        if (!hasId) {
          clearStorage('tenant-freeze-bucket-id')
        }
      }
    },
    clear() {
      this.bucketOptions = []
      clearStorage('tenant-bucket-id')
      clearStorage('tenant-easy-bucket-id')
      clearStorage('tenant-freeze-bucket-id')
      clearStorage('tenant-bucket-options')
    },
  },
})

export default useGetBucketList
