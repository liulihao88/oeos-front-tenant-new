<script setup lang="ts">
import { ref, getCurrentInstance, computed } from 'vue'
import { changePwdApi, encryptionPassword } from '@/api/login.ts'

const { proxy } = getCurrentInstance()
const form = ref({})
const originForm = ref(proxy.clone(form))
const formRef = ref(null)
const isShow = ref(false)

const rules = computed(() => {
  return {
    oldPassword: [proxy.validate('length', { min: 8, max: 40 })],
    newPwd: [
      proxy.validate('length', { min: 8, max: 40 }),
      proxy.validate('same', { value: form.value.confirmNewPwd }),
    ],
    confirmNewPwd: [
      proxy.validate('length', { min: 8, max: 40 }),
      proxy.validate('same', { value: form.value.newPwd }),
    ],
  }
})

const confirm = async () => {
  await proxy.validForm(formRef)
  let genPwdList = await encryptionPassword(form.value.oldPassword, form.value.newPwd)
  let sendData = {
    oldPassword: genPwdList[0],
    password: genPwdList[1],
    username: 'admin',
  }
  await changePwdApi(sendData)
  proxy.$toast('密码修改成功')
  isShow.value = false
}

const open = () => {
  form.value = proxy.clone(originForm)
  isShow.value = true
  if (proxy.$dev) {
    let randomNum = proxy.random(1, 3)
    form.value = {
      oldPassword: 'adminadmin',
      newPwd: 'adminadmin' + randomNum,
      confirmNewPwd: 'adminadmin' + randomNum,
    }
  }
}
const passwordType = computed(() => {
  if (proxy.$dev) {
    return ''
  } else {
    return 'password'
  }
})

defineExpose({
  open,
})
</script>

<template>
  <div>
    <o-dialog v-model="isShow" title="修改密码" @confirm="confirm">
      <el-form ref="formRef" :model="form" :rules="rules" label-width="auto">
        <el-form-item label="旧密码" prop="oldPassword">
          <o-input v-model="form.oldPassword" v-focus :type="passwordType" />
        </el-form-item>
        <el-form-item label="新密码" prop="newPwd">
          <o-input v-model="form.newPwd" :type="passwordType" />
        </el-form-item>
        <el-form-item label="确认新密码" prop="confirmNewPwd">
          <o-input v-model="form.confirmNewPwd" :type="passwordType" />
        </el-form-item>
      </el-form>

      <g-warning type="icon" content="密码规则: 8-40位字符组合、特殊字符可选" />
    </o-dialog>
  </div>
</template>
