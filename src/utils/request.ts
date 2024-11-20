import axios from 'axios'
import { getStorage, getType, $toast } from 'oeos-components'
import { devLogin } from '@/utils/local401LoginAgain.ts'
import qs from 'qs'

// import qs from 'qs'
// 关于axios的一些默认配置项，调用接口时，按需要传递
const defaultConfig = {
  // axios支持的请求完整配置：http://www.axios-js.com/zh-cn/docs/#%E8%AF%B7%E6%B1%82%E9%85%8D%E7%BD%AE
  // url: '',
  // method: 'post',
  // headers: {},
  // params:{},
  // data:{},
  // 自定义参数，用于需要在拦截器中处理的全局性事件
  fileName: '', // 下载的文件名
  fileType: '', // 下载的文件类型
  showLoading: false, // 是否在全局(页面级)显示loading
  // loadingText: '',          // loading中的文字提示，默认为空
  // loadingTime: 0,         // loading加载时长，单位ms；0表示请求成功或失败后动关闭
  original: false, // 是否在拦截器中返回服务服的原始数据（response.data）
  showError: true, // 是否把错误信息以message的形式显示在页面上
}

const instance = axios.create({
  baseURL: import.meta.env.VITE_PROXY_API + '/v1/admin/tenant',
  timeout: 60000,
  validateStatus: function (status) {
    return true
  },
  withCredentials: true,
})
let timer = null
// 请求拦截，使用sessionId方式控制权限，
instance.interceptors.request.use((config) => {
  const token = getStorage('tenant-token')
  if (token) {
    config.headers.Authorization = token
  }
  // 对上传类参数，要转换为FormData形式
  if (config.headers['content-type'] === 'multipart/form-data') {
    const formData = new FormData()
    for (let key in config.data) {
      formData.append(key, config.data[key])
    }
    config.data = formData
  }
  let [baseUrl, urlQuery] = config.url.split('?')
  let parseQueryParams = getQueryObject(urlQuery)
  let mergeParams = { ...config.params, ...parseQueryParams }
  let qsParams = qs.stringify(mergeParams)
  if (qsParams) {
    config.url = baseUrl + '?' + qsParams
  } else {
    config.url = baseUrl
  }
  delete config.params
  return config
})
// 响应拦截
instance.interceptors.response.use(
  (response) => {
    if (response.config.customResponse) {
      return Promise.resolve(response)
    }
    // TODO 这里应该判断状态码，待确定
    if (response.status === 200) {
      if (response.data.status !== 200 && response.data.status !== 201) {
        if (response.config.showError) {
          $toast(response.data.message || '请求错误', 'e')
        }
        return Promise.reject(response.data)
      } else {
        // 返回正常数据
        let resolveData = response.config.resolve ? response[response.config.resolve] : response.data.details
        return Promise.resolve(resolveData)
      }
    } else {
      if (response.status === 401) {
        return devLogin()
      }
      if (('' + response.status).startsWith('5')) {
        return $toast('系统繁忙, 请稍后再试', 'e')
      }
      return Promise.reject(response.data)
    }
  },
  (error) => {
    let obj = JSON.parse(JSON.stringify(error))
    if (obj.message?.indexOf('401') !== -1) {
      return devLogin()
    }
  },
)

// 接口报错信息提示
// TODO 使用同一提示框提示多个错误信息
function _errorText(errorMsg) {}
export { instance }
/**
 *
 * @param {*} url 请求url
 * @param {*} method 请求方法, 或者是参数对象
 * @param {*} config 可有可无, 参数对象.
 * @returns
 */
// 定义 method 参数的类型
type MethodType = 'get' | 'post' | 'put' | 'delete'

// 定义 method 参数的类型（可以是 MethodType 或对象）
interface MethodOrConfig {
  method?: MethodType
  [key: string]: any
}
export default function request(url, method?: MethodType | MethodOrConfig = 'get', config = {}) {
  let methodMap = ['get', 'post', 'put', 'delete']
  let methodIsObj = !methodMap.includes(method) && getType(method) === 'object'
  let configObj = methodIsObj ? method : config
  if (configObj.type === 'common') {
    configObj.baseURL = import.meta.env.VITE_PROXY_API + '/v1/admin'
  }
  let mergeConfig = {
    url: url,
    method: methodIsObj ? configObj.method : method,
    ...configObj,
  }

  let finalMergeConfig = Object.assign({}, defaultConfig, mergeConfig)
  return instance(finalMergeConfig)
}
export function requestOld(config) {
  let mergeConfig = Object.assign({}, defaultConfig, config)
  return instance(mergeConfig)
}

function getQueryObject(url) {
  if (!url) {
    return {}
  }
  const search = url.slice(url.indexOf('?') + 1)
  const obj = {}
  const reg = /([^?&=]+)=([^?&=]*)/g
  search.replace(reg, (rs, $1, $2) => {
    const name = $1
    let val = $2
    val = String(val)
    obj[name] = val
    return rs
  })
  return obj
}
