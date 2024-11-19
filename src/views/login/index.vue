<script setup>
import Motion from './utils/motion'
import { useRouter, useRoute } from 'vue-router'
import { useNav } from '@/layout/hooks/useNav'
import { useLayout } from '@/layout/hooks/useLayout'
import { initRouter, getTopMenu } from '@/router/utils'
import { bg, avatar, illustration } from './utils/static'
import { useRenderIcon } from '@/components/ReIcon/src/hooks'
import JSEncrypt from 'jsencrypt'
import { ref, reactive, toRaw, onMounted, onBeforeUnmount, getCurrentInstance } from 'vue'
import { useDataThemeChange } from '@/layout/hooks/useDataThemeChange'
import { getTenants, encrypt, login, getMenu, getFormat, getInitLogo, encryptionPassword } from '@/api/login.ts'
import useBucketList from '@/hooks/getBucketList.ts'
const bucketList = useBucketList()

import dayIcon from '@/assets/svg/day.svg?component'
import darkIcon from '@/assets/svg/dark.svg?component'
import globalLogoSettings from '@/config/settings.ts'
import Lock from '@iconify-icons/ri/lock-fill'
import User from '@iconify-icons/ri/user-3-fill'

import useLogoSettings from '@/store/modules/logoSettings.ts'
const storeLogoSettings = useLogoSettings()

defineOptions({
  name: 'Login',
})
const { proxy } = getCurrentInstance()
const router = useRouter()
const route = useRoute()
const loading = ref(false)
const ruleFormRef = ref(null)
const tenantOptions = ref([])
const redirectUrl = ref()

redirectUrl.value = route.query.redirect || ''

const { initStorage } = useLayout()
initStorage()

const rules = {
  username: [proxy.validate()],
  password: [proxy.validate()],
  tenantId: [proxy.validate('请选择租户')],
}

const { dataTheme, overallStyle, dataThemeChange } = useDataThemeChange()
dataThemeChange(overallStyle.value)
const { title } = useNav()

const ruleForm = reactive({
  username: 'admin',
  tenantId: '',
  password: 'adminadmin',
})
async function init() {
  let optionsRes = await getTenants()
  tenantOptions.value = optionsRes
  if (proxy.$dev) {
    let nameIndex = tenantOptions.value.findIndex((v) => v.name === 'liu')
    ruleForm.tenantId = proxy.uuid(tenantOptions.value, 'value', { optionsIndex: nameIndex === -1 ? 0 : nameIndex })
  }
}
init()
const logoInit = async () => {
  storeLogoSettings.changeSettings(globalLogoSettings.nativeLogo.favariteIcon)
  let res = await getInitLogo()
  proxy.setStorage('tenant-logo-settings', res)
  storeLogoSettings.changeSettings(res)
}
logoInit()

// 匹配本地缓存的菜单route是否包含在服务器返回的路由中, 如果不包含, 取服务器返回路由的第一个
const _findSubMenu = (menuItems, pathToFind, sendArr = []) => {
  for (const menuItem of menuItems) {
    if (menuItem.path && !sendArr[1]) {
      sendArr[1] = menuItem.path
    }
    if (menuItem.path === pathToFind && pathToFind) {
      sendArr[0] = pathToFind
    } else {
      if (menuItem.children && menuItem.children.length > 0) {
        _findSubMenu(menuItem.children, pathToFind, sendArr)
      }
    }
  }
  return sendArr
}

const onLogin = async (formEl) => {
  await proxy.validForm(formEl)
  let genPwdList = await encryptionPassword(ruleForm.password)
  const loginParams = {
    username: ruleForm.username,
    password: genPwdList[0],
    sysdomain: ruleForm.tenantId,
  }
  let loginRes = await login(loginParams)
  let token = `${loginRes.tokenType} ${loginRes.token}`
  proxy.setStorage('tenant-token', token)

  Promise.allSettled([getFormat(), bucketList.update()]).then((res) => {
    console.log(`06 res`, res)
    if (res[0].status === 'fulfilled') {
      proxy.setStorage('tenant-time-rule', res[0].value)
    } else {
      proxy.setStorage('tenant-time-rule', {
        date: 'YYYY-MM-DD',
        time: 'HH:mm:ss',
        datetime: 'YYYY-MM-DD HH:mm:ss',
        uptime: 'DD 天 HH 时 mm 分 ss 秒',
        speed1s: 'MB/s',
      })
    }
  })
  return initRouter().then((routerRes) => {
    const tenantName = tenantOptions.value.find((v) => v.value === ruleForm.tenantId).name
    if (tenantName !== proxy.getStorage('tenant-sysdomain')?.tenantName) {
      redirectUrl.value = ''
    }
    proxy.setStorage('tenant-sysdomain', {
      tenantId: ruleForm.tenantId,
      tenantName: tenantName,
      loginName: ruleForm.username,
    })
    let matchedRouteArr = _findSubMenu(proxy.getStorage('tenant-async-routes'), redirectUrl.value)
    let jumpPath = matchedRouteArr[0] || matchedRouteArr[1]
    router.push(jumpPath).then(() => {
      proxy.$toast('登录成功')
    })
  })
}

/** 使用公共函数，避免`removeEventListener`失效 */
function onkeypress(code) {
  console.log(`83 code`, code)
  if (code.code === 'Enter') {
    onLogin(ruleFormRef.value)
  }
}
const customTenantLabel = (obj) => {
  return `${obj.name} - ${obj.value}`
}

onMounted(() => {
  window.document.addEventListener('keypress', onkeypress)
})

onBeforeUnmount(() => {
  window.document.removeEventListener('keypress', onkeypress)
})
</script>

<template>
  <div class="select-none">
    <img :src="bg" class="wave" />
    <div class="flex-c absolute right-5 top-3">
      <!-- 主题 -->
      <el-switch
        v-model="dataTheme"
        inline-prompt
        :active-icon="dayIcon"
        :inactive-icon="darkIcon"
        @change="dataThemeChange"
      />
    </div>
    <div class="login-container">
      <div class="img">
        <component :is="toRaw(illustration)" />
      </div>

      <div class="login-box">
        <div class="login-form">
          <!-- <avatar class="avatar" /> -->
          <img
            :src="
              storeLogoSettings.nativeLogo?.tenantManagementImage || globalLogoSettings.nativeLogo.tenantManagementImage
            "
            width="100"
          />
          <Motion>
            <h2 class="outline-none">
              {{
                storeLogoSettings.nativeLogo?.tenantManagementTitle ||
                globalLogoSettings.nativeLogo.tenantManagementTitle
              }}
            </h2>
          </Motion>

          <el-form ref="ruleFormRef" :model="ruleForm" :rules="rules" size="large">
            <Motion :delay="100">
              <el-form-item prop="tenantId">
                <o-select
                  v-model="ruleForm.tenantId"
                  :options="tenantOptions"
                  :customLabel="customTenantLabel"
                  width="100%"
                  placeholder="请选择租户"
                />
              </el-form-item>
            </Motion>
            <Motion :delay="100">
              <el-form-item prop="username">
                <el-input v-model="ruleForm.username" clearable placeholder="账号" :prefix-icon="useRenderIcon(User)" />
              </el-form-item>
            </Motion>

            <Motion :delay="150">
              <el-form-item prop="password">
                <el-input
                  v-model="ruleForm.password"
                  clearable
                  show-password
                  placeholder="密码"
                  :prefix-icon="useRenderIcon(Lock)"
                />
              </el-form-item>
            </Motion>

            <Motion :delay="250">
              <el-button
                class="w-full mt-4"
                size="default"
                type="primary"
                :loading="loading"
                @click="onLogin(ruleFormRef)"
              >
                登录
              </el-button>
            </Motion>
          </el-form>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
@import url('@/style/login.css');
</style>

<style lang="scss" scoped>
:deep(.el-input-group__append, .el-input-group__prepend) {
  padding: 0;
}
</style>
