function formatBytesConvert(bytes) {
  let isPositiveInteger = false
  if (Number.isInteger(bytes) && bytes > 0) {
    isPositiveInteger = true
  }
  if (typeof bytes === 'string' && /^\d+$/.test(bytes) && parseInt(bytes) > 0) {
    isPositiveInteger = true
  }
  if (isPositiveInteger) {
    return bytes
  }
  if (!bytes) {
    return bytes
  }
  const bytesRegex = /^(\d+(?:\.\d+)?)\s*([BKMGTPEZY]?B)$/i
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

  const match = bytes.match(bytesRegex)
  if (!match) {
    console.log("Invalid bytes format. Please provide a valid bytes string, like '100GB'.")
    return
  }

  const size = parseFloat(match[1])
  const unit = match[2].toUpperCase()

  if (!units.hasOwnProperty(unit)) {
    console.log(
      "Invalid bytes unit. Please provide a valid unit, like 'B', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', or 'YB'.",
    )
    return
  }

  return size * units[unit]
}

formatBytesConvert('321312')
console.log(`65 formatBytesConvert('321312')`, formatBytesConvert('321312'))
console.log(`65 formatBytesConvert('100KB')`, formatBytesConvert('100KB'))
console.log(`65 formatBytesConvert('200TB')`, formatBytesConvert('200TB'))
