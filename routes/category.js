const path = require('path')
const fs = require('fs-extra')
const rimraf = require('rimraf')
const { Router } = require('express')
const sharp = require('sharp')
const GalleryCard = require('../models/GallaryCard')
const auth = require('../middleware/auth')
const cardMiddleware = require('../middleware/cardImg.js')
const translate = require('translate')
const config = require('config')
const router = Router()

const translateEngine = config.get('translateEngine')
const translateKey = config.get('translateKey')

const webpPath = path.join(__dirname, '..', 'data', 'webp')
const jpgPath = path.join(__dirname, '..', 'data', 'jpg')


router.post('/get', 
  async (req, res) => {
    try {
      
      const { category } = req.body

      const cards = await GalleryCard.find({ category: category })

      res.json({ cards })

    } catch (err) {
      console.log(err)
      res.status(500).json({ message: 'Что-то пошло не так' })
    }
  }
)

router.post('/remove',
  async (req, res) => {
    try {
      const { id } = req.body
      const candidate =  await GalleryCard.findById(id)
      const { category, dir } = candidate
      
      rimraf(path.join(webpPath, category, dir), err => console.log(err))
      rimraf(path.join(jpgPath, category, dir), err => console.log(err))

      await candidate.remove()
      res.json({ id })
    } catch (err) {
      console.log(err)
      res.status(500).json({ message: 'Что-то пошло не так' })
    }
  }
)

router.post(
  '/add-title-img',
  cardMiddleware.single('img'),
  async (req, res) => {
    try {

      const id = req.file.originalname

      const galleryCard = await GalleryCard.findById(id)
      const [ , category, title ] = galleryCard.galleryUrl.split('/')


      await fs.mkdir(path.join(webpPath, category, title))
      await fs.mkdir(path.join(jpgPath, category, title))

      const { width, height } = await sharp(req.file.buffer).metadata()

      const size = width > height ? height: width

      await sharp(req.file.buffer)
        .resize(size, size)
        .jpeg({
          quality: 80,
          chromaSubsampling: '4:2:0'
        })
        .toFile(path.join(jpgPath, category, title, id + '.jpg'))
        
      await sharp(req.file.buffer)
        .resize(size, size)
        .webp()
        .toFile(path.join(webpPath, category, title, id + '.webp'))

      await galleryCard.update({
        imgUrl: {
          webp: `/data/webp/${category}/${title}/${id}.webp`,
          jpg: `/data/jpg/${category}/${title}/${id}.jpg`
        }
      })

      res.json({ message: 'Saved' })

    } catch (err) {
      console.log(err)
      res.status(500).json({ message: 'Что-то пошло не так' })
    }
  }
)

router.post(
  '/add-card',
  async (req, res) => {
    try {
      const { category, title } = req.body

      let titleToUrl = await translate(title, { 
        from: 'ru', to: 'en',
        engine: translateEngine, key: translateKey
      })
      titleToUrl = titleToUrl.split(' ').join('-').toLowerCase()
      const galleryUrl = `/${category}/${titleToUrl}`

      const galleryCard = new GalleryCard({
        category, title, galleryUrl,
        dir: titleToUrl,
        imgUrl: {
          webp: '',
          jpg: ''
        }
      })

      await galleryCard.save()

      res.json({ id: galleryCard._id })

    } catch (err) {
      console.log(err)
      res.status(500).json({ message: 'Что-то пошло не так' })
    }
  }
  )

module.exports = router