import { $toast, getStorage, isEmpty, formatTime, formatDurationTime } from 'oeos-components'
import settings from '@/config/settings.ts'
import { router } from '@/router/index.ts'
import { ElMessage, ElMessageBox } from 'element-plus'
import { isStringNumber, isNumber } from './types.js'
import request from '@/utils/request.js'

export async function gDownload(item, needVersion = true) {
  if (!item.bucket) {
    $toast('不是有效数据，不支持下载!', 'w')
    return false
  } else {
    if (item.bucket.length <= 0) {
      $toast('不是有效数据，不支持下载!', 'w')
    }
  }
  let bucketName = item.bucket ? item.bucket : ''
  let objectKey = item.key ? item.key : ''
  let objectVersionID = item.version ? item.version : ''

  let parseKey = encodeURIComponent(objectKey)
  // let parseKey = objectKey
  let sendParams = {
    bucket: bucketName,
    key: parseKey,
    Authorization: getStorage('tenant-token'),
  }
  if (needVersion) {
    sendParams.version = objectVersionID
  }
  let res = await request('object/download', 'get', {
    customResponse: true,
    responseType: 'blob',
    params: sendParams,
    stringify: false,
  })
  if (res.status !== 200) {
    return $toast(res.message || '下载失败', 'e')
  }
  try {
    // 尝试将文本解析为 JSON
    const result = await parseBlobToJson(res.data)
    $toast(result.message, 'e')
  } catch (e) {
    // 如果无法解析为json, 代表是数据流, 可以下载
    let data = res.data
    const url = URL.createObjectURL(data)
    const link = document.createElement('a')
    link.href = url
    link.download = item.name
    link.click()
  }

  if (res.data && res.data.status && res.data.status !== 200) {
    $toast(res.data.message, 'e')
    return
  }
  function parseBlobToJson(blob) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = function (event) {
        try {
          const text = event.target.result // 获取 Blob 的文本内容
          const json = JSON.parse(text) // 将文本解析为 JSON
          resolve(json)
        } catch (error) {
          reject(new Error('无法解析 JSON: ' + error.message))
        }
      }
      reader.onerror = function (error) {
        reject(new Error('读取 Blob 时出错: ' + error.message))
      }
      reader.readAsText(blob) // 以文本形式读取 Blob
    })
  }
}

export function gDownloadAll(id) {
  let baseUrl = import.meta.env.DEV ? settings.url : window.origin
  let getUrl = `/v1/admin/tenant/object/download/batch`
  let _href = baseUrl + getUrl + `?id=${encodeURIComponent(id)}&Authorization=${getStorage('tenant-token')}`
  window.location.href = _href
}

export function jump(path) {
  return router.push(path)
}

export function formatTimeByRule(time, timeStr = 'datetime') {
  timeStr = timeStr.toLowerCase()
  if (isEmpty(time)) {
    return '-'
  }
  const rule = getStorage('tenant-time-rule') || {}
  const ruleValue = rule[timeStr]
  if (!ruleValue) {
    return time
  }
  if (timeStr === 'speed1s') {
    return time + ruleValue
  }
  let parseRuleFormat = ruleValue
    .replace('YYYY', '{y}')
    .replace('MM', '{m}')
    .replace('DD', '{d}')
    .replace('HH', '{h}')
    .replace('mm', '{i}')
    .replace('ss', '{s}')
  if (timeStr === 'uptime' || timeStr === 'time') {
    return formatDurationTime(time, parseRuleFormat)
  }
  return formatTime(time, parseRuleFormat)
}

export function isImage(str) {
  // 正则表达式匹配常见的图片文件扩展名
  const imageRegex = /\.(jpg|jpeg|png|gif|bmp|webp|tif|tiff)$/i
  return imageRegex.test(str)
}

export function setFavIcon(icon) {
  let link = document.querySelector("link[rel*='icon']") || document.createElement('link')
  link.type = 'image/x-icon'
  link.rel = 'shortcut icon'
  link.href = icon
  document.getElementsByTagName('head')[0].appendChild(link)
}

/**
 * 将数字或字符串加小数点
 * 123 -> 123.00
 * 123.45678 -> 123.46
 * 123.32321KB -> 123.32KB
 * formatFixed(123,45, 2) -> 123.45
 * @param number
 * @param toFixed
 * @returns
 */
export function formatFixed(number, toFixed = 2) {
  // 提取数字部分、小数点和小数部分
  let matches = ('' + number).match(/^([\d,]+\.?\d+?)(\D+)?$/)
  if (!matches) {
    return number // 如果没有找到匹配，则返回原始输入
  }

  let numericString = Number(matches[1]).toFixed(toFixed) // 仅保留数字
  let unit = matches[2] || '' // 单位部分，如果没有则为空字符串

  // 拼接数字、小数点、小数部分和单位，并返回结果
  return `${numericString}${unit}`
}

export function formatImg(photoName, addPath = '', { basePath = 'assets/images' } = {}) {
  if (photoName.startsWith('http') || photoName.startsWith('https')) {
    return photoName
  }
  if (photoName.indexOf('.') === -1) {
    photoName = photoName + '.png'
  }
  const addLastSlash = addPath.endsWith('/') || !addPath ? addPath : `${addPath}/`
  const addLastBasePathSlash = basePath.endsWith('/') || !basePath ? basePath : `${basePath}/`
  let mergeSrc = `${addLastSlash}${photoName}`
  const finalImg = `${addLastBasePathSlash}${mergeSrc}`
  let res = new URL(`../${finalImg}`, import.meta.url).href
  return res
}

export function formatToFixed(number, fixed = 2) {
  // 提取数字部分、小数点和小数部分
  let matches = ('' + number).match(/^([\d,]+)(\.?)(\d+)?(\D+)?$/)
  if (!matches) {
    return number // 如果没有找到匹配，则返回原始输入
  }

  let numericString = matches[1].replace(/\D/g, '') // 仅保留数字
  let decimalString = matches[3] ? `.${matches[3]}` : '' // 小数部分，如果没有则为空字符串
  let unit = matches[4] || '' // 单位部分，如果没有则为空字符串
  let numTofixed = parseFloat(numericString + decimalString).toFixed(fixed)
  return `${numTofixed}${unit}`
}

export function confirm2(message, options) {
  const baseOptions = {
    title: '提示',
    draggable: true,
    showCancelButton: false,
    confirmButtonText: '确定',
  }
  let mergeOptions = Object.assign({}, baseOptions, options)
  return new Promise((r, j) => {
    const instance = ElMessageBox.confirm(message, mergeOptions)
      .then(() => {
        r(instance)
      })
      .catch(() => {
        j(instance)
      })
  })
}
