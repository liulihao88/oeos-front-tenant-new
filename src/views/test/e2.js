function convertStorageToBytes(storage) {
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

// 使用示例
const storage = '100KB'
const bytes = convertStorageToBytes(storage)
console.log(bytes) // 输出 107374182400
