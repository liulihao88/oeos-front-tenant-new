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

const props = defineProps({
  bucketName: {
    type: [String, Number],
  },
})

const emits = defineEmits(['update:bucketName'])
const changeSelect = (value, label) => {
  emits('update:bucketName', label)
}
</script>

<template>
  <o-select
    ref="selectRef"
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
