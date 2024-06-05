import axios from 'axios'
import { getStorage } from 'oeos-components'
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
  // neetToken:false,  // 是否需要在headers中加入token
  fileName: '', // 下载的文件名
  fileType: '', // 下载的文件类型
  // needToken: true,          // 需要token，大部分接口是需要的，所以默认为false
  showLoading: false, // 是否在全局(页面级)显示loading
  // loadingText: '',          // loading中的文字提示，默认为空
  // loadingTime: 0,         // loading加载时长，单位ms；0表示请求成功或失败后动关闭
  original: false, // 是否在拦截器中返回服务服的原始数据（response.data）
  showError: true, // 是否把错误信息以message的形式显示在页面上
}

const instance = axios.create({
  baseURL: getStorage('nativeSettings')?.baseUrl
    ? getStorage('nativeSettings')?.baseUrl + '/v1/admin/tenant'
    : '/v1/admin/tenant',
  withCredentials: true,
  timeout: 600000,
})
let timer = null
// 请求拦截，使用sessionId方式控制权限，
instance.interceptors.request.use(
  (config) => {
    const accessToken = getStorage('oeos_tenant_token')
    const tokenType = getStorage('oeos_tenant_tokenType')
    if (accessToken) {
      config.headers.Authorization = `${tokenType} ${accessToken}`
    }
    // 对上传类参数，要转换为FormData形式
    if (config.headers['content-type'] === 'multipart/form-data') {
      const formData = new FormData()
      for (let key in config.data) {
        formData.append(key, config.data[key])
      }
      config.data = formData
    }
    // 对application/x-www-form-urlencoded类型时参数处理
    if (config.headers['content-type'] === 'application/x-www-form-urlencoded') {
      config.transformRequest = [
        function (data) {
          let result = ''
          for (let key in data) {
            result += encodeURIComponent(key) + '=' + encodeURIComponent(data[key]) + '&'
          }
          return result.slice(0, result.length - 1)
        },
      ]
    }
    // get请求中的引用类型参数，基本没用，如果有，干死后端
    if (config.method === 'get') {
      config.paramsSerializer = function (params) {
        if (params.queries) {
          return _handleQueries(params)
        } else {
          // return qs.stringify(params, { arrayFormat: 'repeat' })
        }
      }
    }
    console.log(`02 config`, config)
    return config
  },
  function (error) {
    return Promise.reject(error)
  },
)
// 响应拦截
instance.interceptors.response.use(
  (response) => {
    console.log(`response`, response)
    if (response.config.customResponse) {
      return Promise.resolve(response)
    }
    // TODO 这里应该判断状态码，待确定
    if (response.status === 200) {
      if (response.data.status !== 200) {
        return Promise.reject(response.data)
      } else {
        // 返回正常数据
        return Promise.resolve(response.data.details)
      }
    } else {
      return Promise.reject(response.data)
    }
  },
  (error) => {
    let obj = JSON.parse(JSON.stringify(error))
    if (obj.message?.indexOf('401') !== -1) {
      localStorage.removeItem('oeos_sys_token')
    }
  },
)

// 接口报错信息提示
// TODO 使用同一提示框提示多个错误信息
function _errorText(errorMsg) {}
export { instance }
export default function request(config) {
  let mergeRes = Object.assign({}, defaultConfig, config)
  console.log(`11 mergeRes`, mergeRes)

  return instance(Object.assign({}, defaultConfig, config))
}

// 处理get请求时传递复杂参数的场景，暂时不用
function _handleSearchQueries(queryArr) {
  let str = ''
  queryArr.forEach((v, i) => {
    for (let key in v) {
      str += `queries[${i}].${key}=${v[key]}&`
    }
  })
  str = str.slice(0, -1)
  return encodeURI(str)
}

function _handleQueries(params) {
  let searchEncode = _handleSearchQueries(params.queries)
  delete params.queries
  for (let key in params) {
    searchEncode += `&${key}=${params[key]}`
  }
  if (searchEncode.startsWith('&')) {
    searchEncode = searchEncode.slice(1)
  }
  return searchEncode
}
