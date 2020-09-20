const path = require('path')
const fs = require('fs-extra')
const sharp = require('sharp')
const { Router } = require('express')
const shortId = require('shortid')
const imgMiddleware = require('../middleware/img.js')
const Gallery = require('../models/Gallery')
const auth = require('../middleware/auth')
const { ImageCompressor } = require('../helpers/sharp')
const router = Router()

const dataDir = path.join(__dirname, '..', 'data')

router.get('/',
  async (req, res) => {
    try {
      const { _id } = req.query

      const gallery = await Gallery.findById({ _id })

      res.json({ gallery })
    } catch (err) {
      console.log(err)
    }
  }
)

router.post(
  '/add-img',
  auth,
  imgMiddleware.array('images', 50),
  async (req, res) => {
    try {
      const [ id ] = req.files[0].originalname.split('_')
      const gallery = await Gallery.findOne({ _id: id })
      const galleryDir = path.join('data', id)

      let order = gallery.images.length

      const imgArr = []

      const files = req.files
      for (const file of files) {
        order++

        const imageId = shortId.generate()

        const galleryImage = new ImageCompressor(file.buffer, imageId)
        const response = await galleryImage.getGallaryImages(galleryDir)
        const { width, height } = await sharp(file.buffer).metadata()
        
        const img = {
          order,
          sizes: { width, height },
          path: { ...response },
          id: imageId
        }

        imgArr.push(img)
      }

      await Gallery.findOneAndUpdate({ _id: id } ,{
        '$addToSet': { 'images': imgArr }
      })

      res.json({ message: 'Фото загружены' })
    } catch (err) {
      console.log(err)
      res.status(500).json({ message: 'Что-то пошло не так' })
    }
  }
)

router.post(
  '/remove-img',
  auth,
  async (req, res) => {
    try {
      const { id, galleryId } = req.body

      const gallery = await Gallery.findById(galleryId)
      const prevImages = gallery.images

      const nextImages = prevImages
        .filter(img => img.id !== id)
        .sort((a, b) => a.order - b.order)
        .map((img, i) => ({ ...img, order: i + 1 }))

      gallery.images = nextImages

      const galleryDir = path.join(dataDir, galleryId)
      const files = await fs.readdir(galleryDir)
      for (const file of files) {
        const fileId = file.split('_')[0]
        if (fileId == id) {
          await fs.remove(path.join(galleryDir, file))
        }
      }
      
      await gallery.save()

      res.json({ message: 'Изображение удалено' })
    } catch (err) {
      console.log(err)
      res.status(500).json({ message: 'Что-то пошло не так' })
    }
  }
)

module.exports = router