const path = require('path')
const fs = require('fs-extra')
const sharp = require('sharp')
const { Router } = require('express')
const shortId = require('shortid')
const imgMiddleware = require('../middleware/img.js')
const Gallery = require('../models/Gallery')
const auth = require('../middleware/auth')
const router = Router()

const webpPath = path.join(__dirname, '..', 'data', 'webp')
const jpgPath = path.join(__dirname, '..', 'data', 'jpg')

router.post(
  '/get',
  async (req, res) => {
    try {
      const { category, titleUrl } = req.body

      const gallery = await Gallery.findOne({ category, titleUrl })

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
      const [ category, title ] = req.files[0].originalname.split('_')
      const gallery = await Gallery.findOne({
        category, 
        titleUrl: title 
      })

      const galleryId = gallery.id

      let order = gallery.images.length

      const imgArr = []

      for (let i = 0; i < req.files.length; i++) {
        const file = req.files[i]

        order++

        const { width, height } = await sharp(file.buffer).metadata()

        const id = shortId.generate()

        const webp = `/data/webp/${category}/${title}/${id}.webp`
        const jpg = `/data/jpg/${category}/${title}/${id}.jpg`
        
        const img = {
          galleryId,
          sizes: { width, height },
          path: { webp, jpg },
          order,
          id
        }

        await sharp(file.buffer)
          .jpeg({
          quality: 80,
          chromaSubsampling: '4:2:0'
          })
          .toFile(path.join(jpgPath, category, title, id + '.jpg'))
        
        await sharp(file.buffer)
          .webp()
          .toFile(path.join(webpPath, category, title, id + '.webp'))

        imgArr[i] = img
      }

      await gallery.update({
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
      const { id, galleryId, category, titleUrl } = req.body

      const gallery = await Gallery.findById(galleryId)
      const prevImages = gallery.images

      const nextImages = prevImages
        .filter(img => img.id !== id)
        .sort((a, b) => a.order - b.order)
        .map((img, i) => ({ ...img, order: i + 1 }))

      gallery.images = nextImages

      const pathToWebp = path.join(webpPath, category, titleUrl, id + '.webp')
      const pathToJpg = path.join(jpgPath, category, titleUrl, id + '.jpg')

      await fs.remove(pathToJpg)
      await fs.remove(pathToWebp)

      await gallery.save()

      res.json({ message: 'Изображение удалено' })
    } catch (err) {
      console.log(err)
      res.status(500).json({ message: 'Что-то пошло не так' })
    }
  }
)

module.exports = router