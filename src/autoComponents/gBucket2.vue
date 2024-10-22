<script setup lang="ts">
/** @使用方式
  <g-bucket v-model="bucketId" v-model:bucketName="bucketName" ref="bucketRef"></g-bucket>
*/
import { ref, getCurrentInstance, watch, watchEffect } from 'vue'
import { useVModels } from '@vueuse/core'
const { proxy } = getCurrentInstance()
import GetBucketList from '@/hooks/getBucketList.ts'
let getBucketList = GetBucketList()
getBucketList.getBucketList()

const props = defineProps({
  bucketName: {
    type: [String, Number],
  },
  modelValue: {
    required: true,
  },
})

const emits = defineEmits(['update:bucketName', 'success'])
const sValue = ref()
const sBucketName = ref()
// 只有当下拉选项有值, 且bucketName也有值时, 才传递success的emit
watchEffect(() => {
  if (getBucketList.bucketOptions.length > 0 && sBucketName.value) {
    console.log(`39 getBucketList.bucketOptions.length`, getBucketList.bucketOptions.length)
    emits('success')
  }
})

watch(
  () => props.modelValue,
  (val) => {
    sValue.value = val
    sBucketName.value = ''
    if (!val) {
      emits('update:bucketName', '')
    } else {
      let filterItem = getBucketList.bucketOptions.filter((v) => v.value === val)
      if (proxy.notEmpty(filterItem)) {
        sBucketName.value = filterItem[0].name
        emits('update:bucketName', filterItem[0].name)
      }
    }
  },
  {
    immediate: true,
  },
)
</script>

<template>
  <o-select
    ref="selectRef"
    v-bind="$attrs"
    v-model="sValue"
    placeholder="请选择桶名"
    :width="$attrs.width ?? 200"
    class="mr"
    :clearable="false"
    :options="getBucketList.bucketOptions"
    label="name"
  />
</template>
