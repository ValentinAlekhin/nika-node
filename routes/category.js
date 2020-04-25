const path = require('path')
const fs = require('fs-extra')
const { Router } = require('express')
const multer = require('multer')
const sharp = require('sharp')
const GalleryCard = require('../models/GallaryCard')
const auth = require('../middleware/auth')
const cardMiddleware = require('../middleware/cardImg.js')
const router = Router()

router.post(
  '/add',
  cardMiddleware.single('img'),
  async (req, res) => {
    try {
      console.log(req.file.buffer)
      const webpPath = path.join(__dirname, '..', 'data', 'webp', 'title.webp')
      const jpgPath = path.join(__dirname, '..', 'data', 'jpg', 'title.jpg')
      await sharp(req.file.buffer)
        .jpeg({
          quality: 80,
          chromaSubsampling: '4:2:0'
        })
        .toFile(jpgPath)
        
      await sharp(req.file.buffer)
        .webp()
        .toFile(webpPath)

        res.json({ message: 'Saved' })

    } catch (err) {
      console.log(err)
      res.status(500).json({ message: 'Что-то пошло не так' })
    }
  }
)

module.exports = router