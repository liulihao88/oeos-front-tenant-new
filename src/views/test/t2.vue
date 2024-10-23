<script setup lang="ts">
import useUser from '@/store/modules/bucketSettings.ts'

const user = useUser()
</script>

<template>
  <div>
    <h1>{{ user.name }}</h1>
    <h1>{{ user.age }}</h1>
    <h1>{{ user.level }}</h1>
    <h1>{{ user.doubleAge }}</h1>
    <h1>{{ user.addAge(30) }}</h1>
    <el-button type="primary" @click="user.changeName()">测试</el-button>
  </div>
</template>
