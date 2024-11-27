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
