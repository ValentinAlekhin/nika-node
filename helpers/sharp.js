const path = require('path')
const sharp = require('sharp')

class ImageCompressor {
  constructor(img, fileName, options = {
    stepSize: 400,
    steps: 5,
    tags: {
      original: 'original',
      blur: 'placeholder',
      factorName: 'w'
    }
  }) {
    this.img = img
    this.steps = options.steps
    this.stepSize = options.stepSize
    this.names = this.createFileNames(options.tags, fileName)
    this.tags = options.tags
    this.fileName = fileName
    this.buffer = {},
    this.pathToSave = ''
    this.response = {
      main: {},
      placeholder: ''
    }
  }

  createFileNames(tags, fileName) {
    const { original, blur, factorName } = tags

    const sizesNames = Array(this.steps)
      .fill(factorName)
      .reduce((acc, value, i) => {
        acc['w' + (i + 1)] = value + (i + 1) * this.stepSize
        return acc
      }, {})
    
    return Object.entries({ ...sizesNames, original, blur })
      .reduce((acc, [ key, value ], i) => {
        acc[key] = `${fileName}_${value}`
        return acc
      }, {})
  }

  async resize(width, height) {
    const pathToSave = path.join(this.pathToSave, `${this.fileName}_${this.tags.factorName + width}`)
    await sharp(this.buffer.webp)
      .resize(width, height)
      .toFile(pathToSave + '.webp')
    await sharp(this.buffer.jpeg)
      .resize(width, height)
      .toFile(pathToSave + '.jpeg')
    this.response.main['w' + width] = {
      webp: pathToSave + '.webp',
      jpeg: pathToSave + '.jpeg',
    }
  }

  async compress() {
    this.buffer.jpeg = await sharp(this.img)
      .jpeg({ quality: 80 })
      .toBuffer()

    this.buffer.webp = await sharp(this.img)
      .webp({ quality: 80 })
      .toBuffer()
  }

  async blur() {
    const pathToSave = path.join(this.pathToSave, `${this.fileName}_${this.tags.blur}.jpeg`)
    await sharp(this.buffer.jpeg)
      .resize(800, 800)
      .blur(20)
      .toFile(pathToSave)
    this.response.placeholder = pathToSave
  }

  async getTitleImages(pathToSave) {
    this.pathToSave = pathToSave

    await this.compress()

    const { width, height } = await sharp(this.img).metadata()
    const size = width > height ? height: width

    for (let i = this.steps; i > 0; i--) {
      if (size > i * this.stepSize) {
        for (let step = i; step > 0; step--) {
          let currSize = this.stepSize * step
          await this.resize(currSize, currSize)
        }
        break
      }
    }

    await this.blur()

    return this.response
  }
}

module.exports = { ImageCompressor }