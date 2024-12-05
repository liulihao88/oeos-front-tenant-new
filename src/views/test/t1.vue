<script setup lang="ts">
import { ref, getCurrentInstance } from 'vue'
const { proxy } = getCurrentInstance()

function map(arr, fn) {
  if (!Array.isArray(arr) || typeof fn !== 'function') {
    throw new Error('invalid params')
  }

  let result = []
  for (let i = 0; i < arr.length; i++) {
    result.push(fn(arr[i], i, arr))
  }
  return result
}

let res = map([1, 3, 5, 7], (item, index, arr) => {
  console.log(`03 item, index, arr`, item, index, arr)
  return Math.pow(item, 2)
})
console.log(`%c35 21行 test/t1.vue res`, 'background:#fff;color:red', res)
</script>

<template>
  <div>
    <div>test/t1.vue</div>
  </div>
</template>
