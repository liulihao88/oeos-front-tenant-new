export function formatBytes(bytes) {
  let isPositiveInteger = false
  if (Number.isInteger(bytes) && bytes > 0) {
    isPositiveInteger = true
  }
  if (typeof bytes === 'string' && /^\d+$/.test(bytes) && parseInt(bytes) > 0) {
    isPositiveInteger = true
  }
  if (!isPositiveInteger) {
    return bytes
  }
  if (!bytes) {
    return bytes
  }
  if (bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}
/**
 *
 * @param {*} storage
 * @returns
 * @example 使用示例
const storage = '100KB'
const bytes = formatBytes(storage)
console.log(bytes) // 输出 107374182400
 */
export function formatBytesConvert(storage) {
  const storageRegex = /^(\d+(?:\.\d+)?)\s*([BKMGTPEZY]?B)$/i
  const units = {
    B: 1,
    KB: 1024,
    MB: 1024 ** 2,
    GB: 1024 ** 3,
    TB: 1024 ** 4,
    PB: 1024 ** 5,
    EB: 1024 ** 6,
    ZB: 1024 ** 7,
    YB: 1024 ** 8,
  }

  const match = storage.match(storageRegex)
  if (!match) {
    console.log("Invalid storage format. Please provide a valid storage string, like '100GB'.")
    return
  }

  const size = parseFloat(match[1])
  const unit = match[2].toUpperCase()

  if (!units.hasOwnProperty(unit)) {
    console.log(
      "Invalid storage unit. Please provide a valid unit, like 'B', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', or 'YB'.",
    )
    return
  }

  return size * units[unit]
}
