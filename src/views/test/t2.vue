<script setup lang="ts">
import { getCurrentInstance } from 'vue'
const { proxy } = getCurrentInstance()
import useBucketList from '@/hooks/getBucketList.ts'
const bucketList = useBucketList()
</script>

<template>
  <div>
    <el-button type="primary" @click="bucketList.clear()">测试07</el-button>

    {{ bucketList.bucketOptions }}
  </div>
</template>
