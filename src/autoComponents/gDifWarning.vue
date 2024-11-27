<script setup lang="ts">
import { ref, getCurrentInstance, watch } from 'vue'
const { proxy } = getCurrentInstance()
const props = defineProps({
  type: {
    type: String,
    default: '', // quota
    required: true,
  },
})

const warningObj = ref({})

const map = {
  quota: {
    content:
      '软配额：用户可以使用超过配额限制的空间大小，并且不会限制存储桶内对象操作。 <br>硬配额：用户可以使用的空间大小不可超过配额限制，超过配额限制后会禁止继续写入数据。',
  },
  version: {
    content:
      '版本控制是将某一对象的多个变体保留在同一存储桶中的一种方法，能够保留、检索以及还原该存储桶中每个对象的每个版本。通过版本控制，您可以轻松地将意外的用户操作和应用程序故障中恢复存储对象。',
  },
}

watch(
  () => props.type,
  (val) => {
    if (val) {
      warningObj.value = map[val]
    }
  },
  {
    deep: true,
    immediate: true,
  },
)
</script>

<template>
  <div>
    <g-warning :type="warningObj.type ?? ''" :content="warningObj.content" />
  </div>
</template>
