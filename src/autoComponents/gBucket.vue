<script setup lang="ts">
/** @使用方式
  <g-bucket v-model="bucketId" v-model:bucketName="bucketName" ref="bucketRef"></g-bucket>
*/
import { ref, getCurrentInstance, watch } from 'vue'
import { useVModels } from '@vueuse/core'
const { proxy } = getCurrentInstance()
import GetBucketList from '@/hooks/getBucketList.ts'
let getBucketList = GetBucketList()
getBucketList.getBucketList()
const compBucketId = ref(proxy.getStorage('tenant-bucket-id') ?? '')
const compBucketName = ref(proxy.getStorage('tenant-bucket-name') ?? '')

const emits = defineEmits(['update:bucketName', 'update:modelValue'])
const props = defineProps({
  modelValue: {
    required: true,
    type: String,
  },
  bucketName: {
    type: [String, Number],
  },
})
const { modelValue: bucketIdModel, bucketName } = useVModels(props, emits)
console.log(`71 bucketName.value`, bucketName.value)
console.log(`67 bucketIdModel`, bucketIdModel)

const changeSelect = (value, label) => {
  compBucketId.value = value
  compBucketName.value = label
  proxy.setStorage('tenant-bucket-id', value)
  proxy.setStorage('tenant-bucket-name', label)
  bucketIdModel.value = value
  bucketName.value = label
  emits('update:bucketName', label)
}

watch(
  compBucketId,
  (val) => {
    bucketIdModel.value = val
    bucketName.value = compBucketName.value
    emits('update:bucketName', compBucketName.value)
  },
  {
    deep: true,
    immediate: true,
  },
)

const update = () => {
  return {
    bucketId: compBucketId.value,
    bucketName: compBucketName.value,
  }
}

defineExpose({
  update,
})
</script>

<template>
  <o-select
    ref="selectRef"
    v-model="bucketIdModel"
    placeholder="请选择桶名"
    v-bind="$attrs"
    :width="$attrs.width ?? 200"
    class="mr"
    :clearable="false"
    :options="getBucketList.bucketOptions"
    label="name"
    @changeSelect="changeSelect"
  />
</template>
