<script setup lang="ts">
import { ref, getCurrentInstance } from 'vue'
const { proxy } = getCurrentInstance()
import useBucketSettings from '@/store/modules/bucketSettings.ts'
const bucketSettings = useBucketSettings()

const emits = defineEmits(['change'])

const changeFolder = (v, i) => {
  const getNowIdx = bucketSettings.prefixKeyArr.findIndex((val) => val === v)
  const prefixKeyArr = proxy.clone(bucketSettings.prefixKeyArr)
  let sliceArr = prefixKeyArr.slice(0, getNowIdx + 1)
  bucketSettings.changePrefixKey(sliceArr.join('/') + '/')
  emits('change')
}
const toRoot = () => {
  bucketSettings.clearPrefixKey()
  emits('change')
}
</script>

<template>
  <div class="folder-box">
    <template v-if="bucketSettings.prefixKeyArr.length !== 0">
      <div class="text" @click="toRoot">根目录</div>
      <o-icon name="arrow-right" class="mlr" size="12" />
    </template>
    <div v-for="(v, i) in bucketSettings.prefixKeyArr" :key="i" class="item">
      <div
        class="text"
        :class="{ 'last-text': i === bucketSettings.prefixKeyArr.length - 1 }"
        @click="changeFolder(v, i)"
      >
        {{ v }}
      </div>
      <o-icon v-if="i !== bucketSettings.prefixKeyArr.length - 1" name="arrow-right" class="mlr" size="12" />
    </div>
  </div>
</template>

<style lang="scss" scoped>
.folder-box {
  display: inline-flex;
  flex-wrap: nowrap;
  align-items: center;
  padding: 4px;
  overflow: auto;
  font-size: 14px;
  color: var(--blue);
  background: #e9f3ff;
  border-radius: 4px;

  .item {
    display: flex;
    align-items: center;
  }

  .text {
    white-space: nowrap;
    cursor: pointer;
  }

  .last-text {
    color: #333;
    cursor: unset;
  }
}
</style>
