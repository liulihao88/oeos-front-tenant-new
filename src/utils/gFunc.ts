import { $toast, getStorage, isEmpty, formatTime, formatDurationTime } from 'oeos-components'
import settings from '@/config/settings.ts'
import { router } from '@/router/index.ts'
import { isStringNumber, isNumber } from './types.js'

export function gDownload(item) {
  console.log(`34 item`, item)

  if (!item.bucket) {
    $toast('不是有效数据，不支持下载!', 'w')
    return false
  } else {
    if (item.bucket.length <= 0) {
      $toast('不是有效数据，不支持下载!', 'w')
    }
  }
  let getUrl = `/v1/admin/tenant/object/download` //接口
  let bucketName = item.bucket ? item.bucket : ''
  let objectKey = item.key ? item.key : ''
  let objectVersionID = item.version ? item.version : ''
  let dataUrl = `?bucket=${bucketName}&key=${encodeURIComponent(objectKey)}&version=${objectVersionID}`
  let baseUrl = import.meta.env.DEV ? settings.url : window.origin
  let _href = baseUrl + getUrl + dataUrl + `&Authorization=${getStorage('tenant-token')}`
  console.log(`41 _href`, _href)
  window.location.href = _href
}

export function gDownloadAll(id) {
  let baseUrl = import.meta.env.DEV ? settings.url : window.origin
  let getUrl = `/v1/admin/tenant/object/download/batch`
  let _href = baseUrl + getUrl + `?id=${encodeURIComponent(id)}&Authorization=${getStorage('tenant-token')}`
  window.location.href = _href
}

export function gDownloadUrl(url, params = {}) {
  let baseUrl = import.meta.env.DEV ? settings.url : window.origin
  const token = {
    Authorization: getStorage('tenant-token'),
  }
  const mergeParams = Object.assign(params, token)
  const queryString = Object.keys(mergeParams)
    .map((key) => `${encodeURIComponent(key)}=${encodeURIComponent(mergeParams[key])}`)
    .join('&')
  console.log(`75 queryString`, queryString)
  let _href = baseUrl + url + '?' + queryString
  console.log(`37 _href`, _href)
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

  console.log(`41 matches[1]`, matches[1])
  let numericString = Number(matches[1]).toFixed(toFixed) // 仅保留数字
  let unit = matches[2] || '' // 单位部分，如果没有则为空字符串

  // 拼接数字、小数点、小数部分和单位，并返回结果
  return `${numericString}${unit}`
}
