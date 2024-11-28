<script setup lang="ts">
import { ref, getCurrentInstance, computed, nextTick } from 'vue'
const { proxy } = getCurrentInstance()
import useBucketSettings from '@/store/modules/bucketSettings.ts'
const bucketSettings = useBucketSettings()

const emits = defineEmits(['change'])
const isEdit = ref(false)
const originPrefixKey = ref()
const isClear = ref(false)

const editFolder = () => {
  if (isEdit.value !== true) {
    originPrefixKey.value = bucketSettings.prefixKey
    isEdit.value = true
  }
}

const changeFolder = (v, i) => {
  if (i === bucketSettings.prefixKeyArr.length - 1) {
    editFolder()
    return
  }
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
const toPrevFolder = () => {
  let nowPrefixKeyArr = bucketSettings.prefixKeyArr
  nowPrefixKeyArr.pop()
  let nowPrefixkey = nowPrefixKeyArr.length > 0 ? nowPrefixKeyArr.join('/') + '/' : ''
  bucketSettings.changePrefixKey(nowPrefixkey)
  emits('change')
}

const editPrefixKey = () => {
  isEdit.value = false
  emits('change')
}
const handleClear = () => {
  isClear.value = true
}
const blurInput = () => {
  if (isClear.value) {
    isClear.value = false
    return
  }
  if (isEdit.value !== false) {
    bucketSettings.changePrefixKey(originPrefixKey.value)
    isEdit.value = false
  }
}
</script>

<template>
  <div v-click-outside="blurInput" class="folder-box" @click="editFolder">
    <div class="inner-box">
      <template v-if="!isEdit">
        <div v-if="bucketSettings.prefixKey" @click.stop="toPrevFolder">
          <o-icon name="arrow-up" size="16" class="mlr2">你好啊</o-icon>
        </div>
        <div v-if="bucketSettings.prefixKeyArr.length !== 0" class="item" @click.stop="toRoot">
          <div class="text">根目录</div>
          <o-icon name="arrow-right" class="mlr" size="12" />
        </div>
        <div v-for="(v, i) in bucketSettings.prefixKeyArr" :key="i" class="item" @click.stop="changeFolder(v, i)">
          <div class="text" :class="{ 'last-text': i === bucketSettings.prefixKeyArr.length - 1 }">
            {{ v }}
          </div>
          <o-icon v-if="i !== bucketSettings.prefixKeyArr.length - 1" name="arrow-right" class="mlr" size="12" />
        </div>
      </template>
      <template v-else>
        <o-input
          v-model="bucketSettings.prefixKey"
          v-focus
          width="100%"
          @keyup.enter="editPrefixKey"
          @clear="handleClear"
        >
          <template #append>
            <o-icon name="search" @click="editPrefixKey" />
          </template>
        </o-input>
      </template>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.folder-box {
  width: 1000px;
  height: 40px;
  padding-left: 16px;
  background: #9db8d8;

  .inner-box {
    display: inline-flex;
    flex-wrap: nowrap;
    align-items: center;
    width: calc(100% - 40px);
    height: 100%;
    // padding: 4px;
    overflow: auto;
    font-size: 14px;
    color: var(--blue);
    border-radius: 4px;
  }

  :deep(.el-input) {
    --el-input-focus-border: none;
    --el-input-focus-border-color: none;

    border-color: none;
  }

  .item {
    display: flex;
    align-items: center;
    height: 100%;
    cursor: pointer;
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
