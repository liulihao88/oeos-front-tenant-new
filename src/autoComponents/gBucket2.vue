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

watch(
  () => [props.modelValue, getBucketList.bucketOptions],
  ([val1, val2]) => {
    sValue.value = val1
    if (!val1) {
      emits('update:bucketName', '')
    } else {
      if (val2.length > 0) {
        let filterItem = val2.filter((v) => v.value === val1)
        if (proxy.notEmpty(filterItem)) {
          emits('update:bucketName', filterItem[0].name)
        }
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
    title="桶名称"
    placeholder="请选择桶名"
    :width="$attrs.width ?? 200"
    class="mr"
    :clearable="false"
    :options="getBucketList.bucketOptions"
    label="name"
  />
</template>
