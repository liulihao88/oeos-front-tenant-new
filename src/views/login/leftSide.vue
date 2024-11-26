<script setup lang="ts">
import { ref, getCurrentInstance } from 'vue'
const { proxy } = getCurrentInstance()
import Motion from './utils/motion'

import { getVersion } from '@/api/login.ts'

import globalLogoSettings from '@/config/settings.ts'

import useLogoSettings from '@/store/modules/logoSettings.ts'
const storeLogoSettings = useLogoSettings()

const versionText = ref()
const init = async () => {
  let res = await getVersion()
  versionText.value = res
}
init()
</script>

<template>
  <div class="box">
    <Motion :delay="100">
      <img
        :src="
          storeLogoSettings.nativeLogo?.tenantManagementImage || globalLogoSettings.nativeLogo.tenantManagementImage
        "
        class="login-logo-box"
      />
    </Motion>
    <Motion :delay="100">
      <div class="font-box">
        <h2 class="text">
          {{
            storeLogoSettings.nativeLogo?.tenantManagementTitle || globalLogoSettings.nativeLogo.tenantManagementTitle
          }}
        </h2>
        <div class="line" />
        <div class="console-box">
          <g-img :src="'login/font2'" height="40" class="console-img" />
        </div>
      </div>
    </Motion>

    <div class="version-box">
      <Motion :delay="100">
        {{ versionText }}
      </Motion>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.box {
  position: relative;
  flex: 3;
  height: 100vh;
  padding: 24px;
  background: url('@/assets/images/login/bg.png');
  background-size: cover;

  .login-logo-box {
    position: fixed;
    top: 24px;
    left: 24px;
    width: calc(100% - 48px);
  }

  .font-box {
    position: absolute;
    top: 40vh;
    width: 100%;

    .text {
      width: 70%;
      height: 70px;
      font-size: 40px;
      color: #fceea5;
      text-align: right;
    }

    .console-box {
      width: 70%;
      margin-top: 16px;
      text-align: right;
    }

    .line {
      width: 100%;
      height: 2px;
      background: #fceea5;
    }
  }

  .version-box {
    position: absolute;
    right: 24px;
    bottom: 24px;
    display: inline;
    width: 100%;
    font-size: 16px;
    color: rgb(132 151 176);
    text-align: right;
  }
}
</style>
