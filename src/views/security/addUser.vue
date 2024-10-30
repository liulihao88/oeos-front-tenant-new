<script setup lang="ts">
import { ref, getCurrentInstance, computed } from 'vue'
import { omit } from 'lodash-es'
import JSEncrypt from 'jsencrypt'
import { encrypt } from '@/api/login.ts'
import { addUser } from '@/api/securityApi.ts'

const { proxy } = getCurrentInstance()

const form = ref({})
const formRef = ref(null)
const rules = computed(() => {
  return {
    username: [proxy.validate('custom', { message: '3-10位字符且只支持数字、英文', reg: /^[0-9a-zA-Z]{3,10}$/ })],
    fullName: [proxy.validate('length', { min: 3, max: 20 })],
    pwd: [proxy.validate('length', { min: 8, max: 40 }), proxy.validate('same', { value: form.value.confirmPwd })],
    confirmPwd: [proxy.validate('length', { min: 8, max: 40 }), proxy.validate('same', { value: form.value.pwd })],
  }
})

const save = async () => {
  await proxy.validForm(formRef)
  let encRes = await encrypt(form.value.pwd)
  const encryptor = new JSEncrypt()
  const publickKey = encRes.communicationKey
  encryptor.setPublicKey(publickKey)
  const pwd = encryptor.encrypt(form.value.pwd)
  const sendForm = omit(form.value, ['pwd', 'confirmPwd'])
  sendForm.password = pwd
  await addUser(sendForm)
  proxy.$toast('保存成功')
  proxy.jump('/apps/security/user')
}

const devTest = () => {
  if (proxy.$dev) {
    form.value = {
      username: 'andy' + proxy.uuid(),
      fullName: 'andy' + proxy.uuid(),
      pwd: 'adminadmin',
      confirmPwd: 'adminadmin',
      description: 'description' + proxy.uuid(),
    }
  }
}
devTest()
</script>

<template>
  <div>
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

    <el-button type="primary" @click="save">保存</el-button>
  </div>
</template>
