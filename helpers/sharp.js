const path = require('path')
const fs = require('fs-extra')
const rootDir = require('app-root-path').path
const sharp = require('sharp')

class ImageCompressor {
  constructor(img, fileName, options = {
    stepSize: 400,
    steps: 5,
    tags: {
      original: 'original',
      placeholder: 'placeholder',
      factorName: 'w'
    }
  }) {
    this.img = img
    this.steps = options.steps
    this.stepSize = options.stepSize
    this.tags = options.tags
    this.fileName = fileName
    this.buffer = {},
    this.pathToSave = ''
    this.response = {
      main: {},
      original: {},
      placeholder: ''
    }
  }

  async resize(width, height) {
    const webpName = `${this.fileName}_${width + this.tags.factorName}.webp`
    const jpegName = `${this.fileName}_${width + this.tags.factorName}.jpeg`
    await sharp(this.buffer.webp)
      .resize(width, height)
      .toFile(path.join(rootDir, this.pathToSave, webpName))
    await sharp(this.buffer.jpeg)
      .resize(width, height)
      .toFile(path.join(rootDir, this.pathToSave, jpegName))
    this.response.main[width + this.tags.factorName] = {
      webp: `/${this.pathToSave}/${webpName}`,
      jpeg: `/${this.pathToSave}/${jpegName}`,
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
    const fileName = `${this.fileName}_${this.tags.placeholder}.jpeg`
    const pathToSave = path.join(rootDir, this.pathToSave, fileName)
    await sharp(this.buffer.jpeg)
      .resize(800, 800)
      .blur(20)
      .toFile(pathToSave)
    this.response.placeholder = `/${this.pathToSave}/${fileName}`
  }

  async saveOriginal() {
    const webpName = `${this.fileName}_${this.tags.original}.webp`
    const jpegName = `${this.fileName}_${this.tags.original}.jpeg`

    await fs.writeFile(path.join(rootDir, this.pathToSave, webpName), this.buffer.webp)
    await fs.writeFile(path.join(rootDir, this.pathToSave, jpegName), this.buffer.jpeg)

    this.response.original = {
      webp: `/${this.pathToSave}/${webpName}`,
      jpeg: `/${this.pathToSave}/${jpegName}`,
    }

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

  async getGallaryImages(pathToSave) {
    this.pathToSave = pathToSave

    await this.compress()

    const { width, height } = await sharp(this.img).metadata()
    const aspectRatio = height / width

    for (let i = this.steps; i > 0; i--) {
      if (width > i * this.stepSize) {
        for (let step = i; step > 0; step--) {
          let currWidth = this.stepSize * step
          let currHeight = Math.floor(currWidth * aspectRatio)
          await this.resize(currWidth, currHeight)
        }
        break
      }
    }

    await this.saveOriginal()

    await this.blur()

    return this.response
  }
}

module.exports = { ImageCompressor }