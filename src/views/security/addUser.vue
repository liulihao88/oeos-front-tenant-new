<script setup lang="ts">
import { ref, getCurrentInstance, computed, onMounted, watch } from 'vue'
import { omit } from 'lodash-es'
import JSEncrypt from 'jsencrypt'

import { encrypt } from '@/api/login.ts'
import { addUser, getBucketPermission, updateBucketPermission, putRoles } from '@/api/securityApi.ts'
import { ROLE_OPTIONS } from '@/assets/globalData.ts'

import BucketPermission from '@/views/security/bucketPermission.vue'

import GetBucketList from '@/hooks/getBucketList.ts'
let getBucketList = GetBucketList()
getBucketList.getBucketList()

import { useRouter, useRoute } from 'vue-router'
const router = useRouter()
const route = useRoute()

const roleValues = ref([])
const { proxy } = getCurrentInstance()

const userDetails = ref(proxy.getStorage('tenant-user-details') || {})
const bucketPermissionRef = ref(null)
roleValues.value = userDetails.value.roles
const roleInfos = `
  <div>
    <span class="mr cl-green">系统管理员: </span>
    <span>负责系统配置、系统维护等权限</span>
  </div>
  <div>
    <span class="mr cl-green">安全管理员: </span>
    <span>负责对用户、组设置桶权限</span>
  </div>
  <div>
    <span class="mr cl-green">监控管理员: </span>
    <span>仅限于系统监控</span>
  </div>
  <div>
    <span class="mr cl-green">数据管理员: </span>
    <span>仅限于数据管理</span>
  </div>
`

const form = ref({})
form.value = proxy.clone(userDetails.value)
const formRef = ref(null)
const rules = computed(() => {
  return {
    username: [proxy.validate('custom', { message: '3-10位字符且只支持数字、英文', reg: /^[0-9a-zA-Z]{3,10}$/ })],
    fullName: [proxy.validate('length', { min: 3, max: 20 })],
    pwd: [
      proxy.validate('length', { min: 8, max: 40, required: false }),
      proxy.validate('same', { value: form.value.confirmPwd, required: false }),
    ],
    confirmPwd: [
      proxy.validate('length', { min: 8, max: 40, required: false }),
      proxy.validate('same', { value: form.value.pwd, required: false }),
    ],
  }
})

const save = async () => {
  await proxy.validForm(formRef)
  const sendForm = omit(form.value, ['pwd', 'confirmPwd'])
  if (form.value.pwd) {
    let encRes = await encrypt(form.value.pwd)
    const encryptor = new JSEncrypt()
    const publickKey = encRes.communicationKey
    encryptor.setPublicKey(publickKey)
    const pwd = encryptor.encrypt(form.value.pwd)
    sendForm.password = pwd
  } else {
    sendForm.password = ''
  }

  await addUser(sendForm)
  proxy.$toast('保存成功')
  await putRoles(userDetails.value.username, roleValues.value)
  let dataRes = await bucketPermissionRef.value.$getData()
  updateBucketPermission(userDetails.value.username, dataRes)
  proxy.jump('/apps/security/user')
}
</script>

<template>
  <div class="">
    <o-title title="用户编辑">
      <el-button type="primary" class="ml2" @click="save">保存</el-button>
      <el-button class="ml2" @click="proxy.jump('/apps/security/user')">取消</el-button>
    </o-title>
    <o-title title="基本信息" type="simple" />
    <el-form ref="formRef" :model="form" :rules="rules" label-width="auto" inline>
      <el-form-item label="名称" prop="username">
        <o-input v-model="form.username" placeholder="3-10位字符且只支持数字、英文" />
      </el-form-item>
      <el-form-item label="用户全称" prop="fullName">
        <o-input v-model="form.fullName" placeholder="1-20位字符" />
      </el-form-item>
      <el-form-item label="密码" prop="pwd">
        <o-input v-model="form.pwd" placeholder="8-40位字符组合、特殊字符可选" />
      </el-form-item>
      <el-form-item label="确认密码" prop="confirmPwd">
        <o-input v-model="form.confirmPwd" placeholder="8-40位字符组合、特殊字符可选" />
      </el-form-item>
      <el-form-item label="描述" prop="description">
        <o-input
          v-model="form.description"
          placeholder="请输入描述信息, 限制50个字符"
          type="textarea"
          :maxlength="50"
        />
      </el-form-item>
    </el-form>

    <o-title title="用户角色" />
    <o-title title="所属角色" type="simple">
      <div class="ml fw-400">修改角色权限保存后, 5分钟后生效</div>
    </o-title>
    <div class="f-st-ct">
      <o-checkbox v-model="roleValues" :options="ROLE_OPTIONS" />
      <o-icon name="warning" raw-content :content="roleInfos" class="ml2" />
    </div>

    <BucketPermission
      ref="bucketPermissionRef"
      :sendName="userDetails.username"
      :src="getBucketPermission"
      tableHeight="calc(100vh - 510px)"
    />
  </div>
</template>
