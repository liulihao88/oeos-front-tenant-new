import axios from 'axios'
import { getStorage } from 'oeos-components'
// import JSZip from 'jszip'
// import FileSaver from 'file-saver'
//公共函数s,回到登录页封装
let backLogin = (specialApi, error) => {
  if (specialApi) {
    if (error.data) {
    }
    return false
  }
  localStorage.removeItem('oeos_tenant_token')
  location.reload()
}
let indexNum = 0

const controller = new AbortController()
const axiosCancel = (cancel) => {
  let CancelToken = axios.CancelToken
  let source = CancelToken.source()
  source.cancel('取消')
}
let axiosSource = axios.CancelToken.source() //为了解决接口取消后，再次发起请求，接口不能再次请求canceltoken，会持续取消
const pramasCountFn = (obj) => {
  let pramas = {
    timeout: null, //超时定义
    type: '', //请求类型定义
    responseType: '', //请求方式定义
    callBackFn: null, //回调函数定义
    isSpecial: false, //是否是特殊请求
  }
  if (!obj) {
    return pramas
  }
  Object.keys(pramas).forEach((item) => {
    let isHave = Object.keys(obj).find((el) => item === el)
    if (isHave) {
      pramas[item] = obj[item]
    }
  })
  return pramas
}
const axiosAPP = (obj) => {
  let pramasInfo = pramasCountFn(obj)
  const axiosIns = axios.create({
    baseURL: getStorage('nativeSettings')?.baseUrl ? getStorage('nativeSettings')?.baseUrl + '/v1/admin' : '/v1/admin',
    timeout: pramasInfo.timeout ? pramasInfo.timeout : 600000,
    validateStatus: function (status) {
      return true
    },
    responseType: pramasInfo.responseType ? pramasInfo.responseType : '',
    cancelToken: axiosSource.token,
    signal: controller,
  })
  if (pramasInfo.type == 'form-data') {
    axiosIns.defaults.headers.post['Content-Type'] = 'multipart/form-data'
  } else {
    axiosIns.defaults.headers.post['Content-Type'] = 'application/json'
  }
  // if( obj['Content-Type']){
  //     axiosIns.defaults.headers.get['Content-Type'] = obj['Content-Type']
  // }else{
  //     axiosIns.defaults.headers.get['Content-Type'] = 'application/x-www-form-urlencoded'
  // }
  axiosIns.defaults.headers.get['Content-Type'] = 'application/x-www-form-urlencoded'
  window._axiosPromiseArr = []
  axiosIns.interceptors.request.use(
    (config) => {
      //console.log(config,"====configrequest")
      if (!pramasInfo.timeout) {
        //不是下载的请求，才显示loading
        if (pramasInfo.type != 'noLoading') {
        }
      }
      const accessToken = localStorage.getItem('oeos_tenant_token')
      const tokenType = localStorage.getItem('oeos_tenant_tokenType')

      if (accessToken) {
        config.headers.Authorization = `${tokenType} ${accessToken}`
      }
      if (pramasInfo.callBackFn) {
        pramasInfo.callBackFn()
      }

      return config
    },
    (error) => {
      console.log(error, 'error')
      //报错返回401
      if (error.response.data.status == '401') {
        backLogin(pramasInfo.isSpecial, error)
      }
      Promise.reject(error)
    },
  )
  axiosIns.interceptors.response.use(
    (response) => {
      if (response.status == 401) {
        //回到登录页
        backLogin(pramasInfo.isSpecial, response)
      } else if (response.status >= 500) {
        if (response.data) {
        } else {
        }
        // backLogin(pramasInfo.isSpecial, response)
      } else if (response.status == 200) {
        //console.log(response.status,"response200==",Promise.resolve(response))
        //接口响应正常
        return Promise.resolve(response)
      } else {
        if (!pramasInfo.timeout) {
        } else {
          let str = response.statusText ? response.statusText : '系统服务繁忙，请稍后重试！'
        }
      }
    },
    (error) => {
      //报错返回401
      let obj = JSON.parse(JSON.stringify(error))
      let commonFn = () => {
        console.log(obj, '???errorobj')
      }
      commonFn()
      let errorFn = () => {
        if (indexNum < 3) {
          setTimeout(() => {
            indexNum++
            axiosAPP(pramasInfo)
          }, 3100)
        } else {
          commonFn()
        }
      }
      if (obj.message == 'Network Error' || obj.message == 'cancel') {
        //断网
        errorFn()
      } else {
        if (obj.response.data && obj.response.data.status == '401') {
          backLogin(pramasInfo.isSpecial, obj.response)
        }
        commonFn()
      }
    },
  )
  return axiosIns
}

const axiosSpecil = (obj) => {
  const pramasInfo = pramasCountFn(obj)
  const axiosIns = axios.create({
    baseURL: '/v1/admin',
    timeout: pramasInfo.timeout ? pramasInfo.timeout : 50000,
    validateStatus: function (status) {
      return true
    },
    responseType: pramasInfo.responseType ? pramasInfo.responseType : '',
    // cancelToken: new axios.CancelToken(cancel => {
    // }),
    cancelToken: axiosSource.token,
    signal: controller,
  })
  axiosIns.defaults.headers.post['Content-Type'] = 'application/json'
  axiosIns.defaults.headers.get['Content-Type'] = 'application/x-www-form-urlencoded'
  window._axiosPromiseArr = []
  axiosIns.interceptors.request.use(
    (config) => {
      const accessToken = localStorage.getItem('oeos_tenant_token')
      const tokenType = localStorage.getItem('oeos_tenant_tokenType')
      if (accessToken) {
        config.headers.Authorization = `${tokenType} ${accessToken}`
      }
      if (pramasInfo.fn) {
        pramasInfo.fn()
      }

      console.log(111)
      return config
    },
    (error) => {
      //报错返回401
      Promise.reject(error)
    },
  )
  axiosIns.interceptors.response.use(
    (response) => {
      console.log(`65 response`, response)
      if (response.status == 200) {
        return Promise.resolve(response)
      }
    },
    (error) => {
      console.log(`93 error`, error)
      let obj = JSON.parse(JSON.stringify(error))
      //报错返回401
      let commonFn = () => {
        console.log(obj, '???errorobj')
      }
      commonFn()
      let errorFn = () => {
        if (indexNum < 3) {
          setTimeout(() => {
            indexNum++
            axiosSpecil(pramasInfo)
          }, 3100)
        } else {
          commonFn()
        }
      }
      if (obj.message == 'Network Error') {
        //断网
        errorFn()
      } else {
        commonFn()
      }
    },
  )
  return axiosIns
}
export default { axiosAPP, controller, axiosSpecil }
