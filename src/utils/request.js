import axios from 'axios'
import { getStorage, getType, $toast } from 'oeos-components'

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
  baseURL: 'api/v1/admin/tenant',
  timeout: 50000,
  validateStatus: function (status) {
    return true
  },
  withCredentials: true,
  timeout: 600000,
})
let timer = null
// 请求拦截，使用sessionId方式控制权限，
instance.interceptors.request.use(
  (config) => {
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
    config.headers['Content-Type'] = 'application/json'
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
    return config
  },
  function (error) {
    return Promise.reject(error)
  },
)
// 响应拦截
instance.interceptors.response.use(
  (response) => {
    if (response.config.customResponse) {
      return Promise.resolve(response)
    }
    // TODO 这里应该判断状态码，待确定
    if (response.status === 200) {
      if (response.data.status !== 200 && response.data.status !== 201) {
        $toast(response.data.message || '请求错误', 'e')
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
      localStorage.removeItem('token')
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
export default function request(url, method = 'get', config = {}) {
  let methodMap = ['get', 'post', 'put', 'delete']
  let methodIsObj = !methodMap.includes(method) && getType(method) === 'object'
  let configObj = methodIsObj ? method : config
  if (configObj.type === 'common') {
    configObj.baseURL = 'api/v1/admin'
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
