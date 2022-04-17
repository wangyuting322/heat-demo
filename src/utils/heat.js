/**
 * @doc https://juejin.cn/post/6844903713434238983
 * @param {*} options
 */
export function Intensity (options) {
  options = options || {}
  this.gradient = options.gradient || {
    0.25: 'rgba(0, 0, 255, 1)',
    0.55: 'rgba(0, 255, 0, 1)',
    0.85: 'rgba(255, 255, 0, 1)',
    1.0: 'rgba(255, 0, 0, 1)'
  }
  this.maxSize = options.maxSize || 35
  this.minSize = options.minSize || 0
  this.max = options.max || 100
  this.min = options.min || 0
  this.initPalette()
}

Intensity.prototype.setMax = function (value) {
  this.max = value || 100
}

Intensity.prototype.setMin = function (value) {
  this.min = value || 0
}

Intensity.prototype.setMaxSize = function (maxSize) {
  this.maxSize = maxSize || 35
}

Intensity.prototype.setMinSize = function (minSize) {
  this.minSize = minSize || 0
}

Intensity.prototype.initPalette = function () {
  const gradient = this.gradient

  const canvas = new Canvas(256, 1)

  const paletteCtx = this.paletteCtx = canvas.getContext('2d')

  const lineGradient = paletteCtx.createLinearGradient(0, 0, 256, 1)

  for (const key in gradient) {
    lineGradient.addColorStop(parseFloat(key), gradient[key])
  }

  paletteCtx.fillStyle = lineGradient
  paletteCtx.fillRect(0, 0, 256, 1)
}

Intensity.prototype.getColor = function (value) {
  const imageData = this.getImageData(value)

  return 'rgba(' + imageData[0] + ', ' + imageData[1] + ', ' + imageData[2] + ', ' + imageData[3] / 256 + ')'
}

Intensity.prototype.getImageData = function (value) {
  const imageData = this.paletteCtx.getImageData(0, 0, 256, 1).data

  if (value === undefined) {
    return imageData
  }

  const max = this.max
  const min = this.min

  if (value > max) {
    value = max
  }

  if (value < min) {
    value = min
  }

  const index = Math.floor((value - min) / (max - min) * (256 - 1)) * 4

  return [imageData[index], imageData[index + 1], imageData[index + 2], imageData[index + 3]]
}

/**
 * @param Number value
 * @param Number max of value
 * @param Number max of size
 * @param Object other options
 */
Intensity.prototype.getSize = function (value) {
  let size = 0
  const max = this.max
  const min = this.min
  const maxSize = this.maxSize
  const minSize = this.minSize

  if (value > max) {
    value = max
  }

  if (value < min) {
    value = min
  }

  size = minSize + (value - min) / (max - min) * (maxSize - minSize)

  return size
}

Intensity.prototype.getLegend = function (options) {
  const gradient = this.gradient

  const width = options.width || 20
  const height = options.height || 180

  const canvas = new Canvas(width, height)

  const paletteCtx = canvas.getContext('2d')

  const lineGradient = paletteCtx.createLinearGradient(0, height, 0, 0)

  for (const key in gradient) {
    lineGradient.addColorStop(parseFloat(key), gradient[key])
  }

  paletteCtx.fillStyle = lineGradient
  paletteCtx.fillRect(0, 0, width, height)

  return canvas
}
// 构造一个离屏canvas
export function Canvas (width, height) {
  const canvas = document.createElement('canvas')
  canvas.width = width
  canvas.height = height
  return canvas
}
