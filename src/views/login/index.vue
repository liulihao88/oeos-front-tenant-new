<script setup>
import Motion from './utils/motion'
import { useRouter, useRoute } from 'vue-router'
import { useNav } from '@/layout/hooks/useNav'
import { useLayout } from '@/layout/hooks/useLayout'
import { initRouter, getTopMenu } from '@/router/utils'
import { useRenderIcon } from '@/components/ReIcon/src/hooks'
import { ref, reactive, toRaw, onMounted, onBeforeUnmount, getCurrentInstance } from 'vue'
import { useDataThemeChange } from '@/layout/hooks/useDataThemeChange'
import LeftSide from '@/views/login/leftSide.vue'

import { getTenants, encrypt, login, getFormat, getInitLogo, encryptionPassword } from '@/api/login.ts'
import useBucketList from '@/hooks/getBucketList.ts'
const bucketList = useBucketList()

import globalLogoSettings from '@/config/settings.ts'
import Lock from '@iconify-icons/ri/lock-fill'
import User from '@iconify-icons/ri/user-3-fill'

import useLogoSettings from '@/store/modules/logoSettings.ts'
const storeLogoSettings = useLogoSettings()

const { proxy } = getCurrentInstance()

defineOptions({
  name: 'Login',
})
const getTenantSysdomain = ref(proxy.getStorage('tenant-sysdomain')) ?? {}
const router = useRouter()
const route = useRoute()
const isLoading = ref(false)
const ruleFormRef = ref(null)
const tenantOptions = ref([])
const redirectUrl = ref()
const passwordRef = ref(null)

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
  username: getTenantSysdomain.value?.loginName ? getTenantSysdomain.value.loginName : proxy.$dev ? 'admin' : '',
  tenantId: '',
  password: proxy.$dev ? 'adminadmin' : '',
})
async function init() {
  let optionsRes = await getTenants()
  tenantOptions.value = optionsRes
  if (getTenantSysdomain.value?.tenantId) {
    ruleForm.tenantId = getTenantSysdomain.value.tenantId
    passwordRef.value.focus()
    return
  }
  let tenantValue = route.query.tenantValue
  let filterTenantObj = tenantOptions.value.filter((v) => v.value === tenantValue)
  if (proxy.$dev) {
    let matchedTenantIdx = tenantOptions.value.findIndex((v) => {
      if (tenantValue) {
        return v.name === tenantValue
      } else {
        return v.name.includes('liu')
      }
    })
    ruleForm.tenantId = proxy.uuid(tenantOptions.value, 'value', {
      optionsIndex: matchedTenantIdx === -1 ? 0 : matchedTenantIdx,
    })
  }

  if (proxy.notEmpty(filterTenantObj)) {
    ruleForm.tenantId = filterTenantObj[0].value
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

const _login = async () => {
  await proxy.validForm(ruleFormRef.value)
  let genPwdList = await encryptionPassword(ruleForm.password)
  const loginParams = {
    username: ruleForm.username,
    password: genPwdList[0],
    sysdomain: ruleForm.tenantId,
  }
  let loginRes = await login(loginParams)
  let token = `${loginRes.tokenType} ${loginRes.token}`
  proxy.setStorage('tenant-token', token)

  let allSettledArr = [getFormat()].concat(
    loginRes.roles.length === 1 && loginRes.roles[0] == 'ROLE_ADMIN_MONITOR'
      ? []
      : [bucketList.update({ showError: false })],
  )

  Promise.allSettled(allSettledArr).then((res) => {
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

const onLogin = async () => {
  if (isLoading.value) {
    return
  }
  isLoading.value = true
  try {
    await _login()
  } catch (e) {
  } finally {
    isLoading.value = false
  }
}

/** 使用公共函数，避免`removeEventListener`失效 */
function onkeypress(event) {
  if (event.code === 'Enter') {
    onLogin()
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
  <div class="login-box">
    <LeftSide />
    <div class="login-container">
      <div class="login-box">
        <div class="login-form">
          <Motion :delay="100">
            <h4 class="sign-el">Sign in</h4>
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
                <el-input
                  v-model.trim="ruleForm.username"
                  clearable
                  placeholder="账号"
                  :prefix-icon="useRenderIcon(User)"
                />
              </el-form-item>
            </Motion>

            <Motion :delay="150">
              <el-form-item prop="password">
                <el-input
                  ref="passwordRef"
                  v-model.trim="ruleForm.password"
                  clearable
                  show-password
                  placeholder="密码"
                  autocomplete="new-password"
                  :prefix-icon="useRenderIcon(Lock)"
                />
              </el-form-item>
            </Motion>

            <Motion :delay="250">
              <el-button class="w-full mt-4" size="default" type="primary" :loading="isLoading" @click="onLogin()">
                登录
              </el-button>
            </Motion>
          </el-form>
        </div>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
:deep(.el-input-group__append, .el-input-group__prepend) {
  padding: 0;
}

.login-box {
  display: flex;

  @media screen and (width <= 1180px) {
    .login-container {
      grid-gap: 9rem;
    }

    .login-form {
      width: 290px;
    }

    .login-form h2 {
      margin: 8px 0;
      font-size: 2.4rem;
    }

    .img img {
      width: 360px;
    }

    .avatar {
      width: 280px;
      height: 80px;
    }
  }

  @media screen and (width <= 968px) {
    .wave {
      display: none;
    }

    .img {
      display: none;
    }

    .login-container {
      grid-template-columns: 1fr;
    }

    .login-box {
      justify-content: center;
    }
  }

  .login-container {
    display: grid;
    flex: 2;
    grid-gap: 18rem;
    max-width: 100%;
    height: 100vh;
    padding: 0 2rem;
  }

  .login-box {
    display: flex;
    align-items: center;
    justify-content: center;
    overflow: hidden;
    text-align: center;
  }

  .login-form {
    width: 360px;
  }

  .sign-el {
    margin-bottom: 24px;
    font-size: 3.2rem;
    font-weight: 400 !important;
    color: #194bb9;
    text-align: left;
  }
}
</style>
