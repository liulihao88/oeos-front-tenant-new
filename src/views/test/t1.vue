<script setup lang="ts">
import { ref, getCurrentInstance } from 'vue'
const { proxy } = getCurrentInstance()
import OutServiceComp from '@/views/overview/outServiceComp.vue'
const data = ref([
  {
    bucket: 'test-read-v',
    key: 'com.amazonaws.services.s3.AmazonS3Client@47c98ee9/2底蝶U群树种怡7透受A美静一好命o色翠-506f2bbae003400cc945accdeaba9068.docx',
    version: '6688368-1c01ebf5-a75f-4ea6-8722-ef20e4e4e988',
    name: '2底蝶U群树种怡7透受A美静一好命o色翠-506f2bbae003400cc945accdeaba9068.docx',
    size: 9945303,
    injectTime: 1732174500505,
    lastModifiedTime: 1732174500505,
    storageClass: 'STANDARD_3IN1',
    chechsum: '506f2bbae003400cc945accdeaba9068',
    username: 'oeosadmin',
    deleteMark: false,
    hasHistoryVersion: false,
  },
])

const columns = [
  {
    label: '名字',
    prop: 'name',
  },
  {
    key: 'operation',
    label: '操作',
    btns: [
      {
        content: '编辑',
      },
    ],
  },
]
</script>

<template>
  <div>
    <div>test/t1.vue</div>
    <o-table ref="tableRef" :columns="columns" :data="data" />
  </div>
</template>
