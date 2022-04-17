<template>
  <div class="home">
    <canvas id="heatmapcanvas"></canvas>
    <canvas id="heatmapcanvas2"></canvas>
  </div>
</template>
<script>
import { Intensity, Canvas } from '@/utils/heat.js'

export default {
  name: 'Home',
  components: {

  },
  props: {

  },
  data () {
    return {
      dataList: [],
      options: {
        min: 0,
        max: 100,
        size: 13
      },
      canvas: null,
      canvas2: null
    }
  },
  computed: {

  },
  methods: {
    /**
     * 按照一定区间生成随机坐标值 min <= x <= max，min <= y <= max
     */
    getRandomIntInclusive (min, max) {
      min = Math.ceil(min)
      max = Math.floor(max)
      return Math.floor(Math.random() * (max - min + 1)) + min
    },

    /**
     * 生成随机数据
     */
    generateData () {
      this.dataList = []
      const count = 240
      for (let i = 0; i < count; i++) {
        const obj = {}
        obj.x = this.getRandomIntInclusive(10, 390)
        obj.y = this.getRandomIntInclusive(10, 390)
        obj.value = this.getRandomIntInclusive(0, 100)
        this.dataList.push(obj)
      }
    },

    /**
     * 画圆 - 包括阴影
     */
    createCircle (size, isShadow) {
      const shadowBlur = size / 2
      const r2 = size + shadowBlur
      const offsetDistance = 10000

      const circle = new Canvas(r2 * 2, r2 * 2)
      const context = circle.getContext('2d')

      if (isShadow) context.shadowBlur = shadowBlur
      context.shadowColor = 'black'
      context.shadowOffsetX = context.shadowOffsetY = offsetDistance

      context.beginPath()
      context.arc(r2 - offsetDistance, r2 - offsetDistance, size, 0, Math.PI * 2, true)
      context.closePath()
      context.fill()
      return circle
    },
    /**
     * 绘制热力点
     */
    draw (context, data, isShadow) {
      const circle = this.createCircle(this.options.size, isShadow)
      const circleHalfWidth = circle.width / 2
      const circleHalfHeight = circle.height / 2

      // 按透明度分类
      const dataOrderByAlpha = {}
      data.forEach((item, index) => {
        const alpha = Math.min(1, item.value / this.options.max).toFixed(2)
        dataOrderByAlpha[alpha] = dataOrderByAlpha[alpha] || []
        dataOrderByAlpha[alpha].push(item)
      })

      // 绘制不同透明度的圆形
      for (const i in dataOrderByAlpha) {
        if (isNaN(i)) continue
        const _data = dataOrderByAlpha[i]
        context.beginPath()
        context.globalAlpha = i
        _data.forEach(item => {
          context.drawImage(circle, item.x - circleHalfWidth, item.y - circleHalfHeight)
        })
      }
      // 圆形着色
      const intensity = new Intensity()
      const colored = context.getImageData(0, 0, context.canvas.width, context.canvas.height)
      this.colorize(colored.data, intensity.getImageData())

      context.clearRect(0, 0, context.canvas.width, context.canvas.height)
      context.putImageData(colored, 0, 0)
    },
    /**
     * 热力点着色
     */
    colorize (pixels, gradient) {
      const max = this.options.max
      const min = this.options.min
      const diff = max - min
      let range = this.options.range || null

      let jMin = 0
      let jMax = 1024
      if (range && range.length === 2) {
        jMin = (range[0] - min) / diff * 1024
      }

      if (range && range.length === 2) {
        jMax = (range[1] - min) / diff * 1024
      }

      const maxOpacity = this.options.maxOpacity || 0.8
      range = this.options.range

      for (let i = 3, len = pixels.length, j; i < len; i += 4) {
        j = pixels[i] * 4 // get gradient color from opacity value

        if (pixels[i] / 256 > maxOpacity) {
          pixels[i] = 256 * maxOpacity
        }

        if (j && j >= jMin && j <= jMax) {
          pixels[i - 3] = gradient[j]
          pixels[i - 2] = gradient[j + 1]
          pixels[i - 1] = gradient[j + 2]
        } else {
          pixels[i] = 0
        }
      }
    },
    /**
   * 初始化全部
   */
    init () {
      // 获取随机数据
      this.generateData()
      this.$nextTick(() => {
        // 左 - 模糊图
        this.canvas = document.getElementById('heatmapcanvas')
        this.canvas.width = 500
        this.canvas.height = 400
        const context = this.canvas.getContext('2d')
        context.clearRect(0, 0, this.canvas.width, this.canvas.height)
        this.draw(context, this.dataList, true)
        // 右 - 不模糊的图
        this.canvas2 = document.getElementById('heatmapcanvas2')
        this.canvas2.width = 500
        this.canvas2.height = 400
        const context2 = this.canvas2.getContext('2d')
        context2.clearRect(0, 0, this.canvas2.width, this.canvas2.height)
        this.draw(context2, this.dataList, false)
      })
    }

  },
  watch: {

  },
  created () {

  },
  mounted () {
    this.init()
  },
  beforeDestroy () {

  }
}
</script>
<style lang="scss" scoped>
.test {
  canvas {
    vertical-align: middle;
  }
}
</style>
