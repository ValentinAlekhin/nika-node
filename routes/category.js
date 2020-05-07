const path = require('path')
const fs = require('fs-extra')
const rimraf = require('rimraf')
const { Router } = require('express')
const sharp = require('sharp')
const Gallery = require('../models/Gallery')
const auth = require('../middleware/auth')
const imgMiddleware = require('../middleware/img.js')
const translate = require('translate')
const config = require('config')
const router = Router()

const translateEngine = config.get('translateEngine')
const translateKey = config.get('translateKey')

const webpPath = path.join(__dirname, '..', 'data', 'webp')
const jpgPath = path.join(__dirname, '..', 'data', 'jpg')


router.get('/', 
  async (req, res) => {
    try {
      
      const { category } = req.query

      const cards = await Gallery.find({ category })

      res.json({ cards })

    } catch (err) {
      console.log(err)
      res.status(500).json({ message: 'Что-то пошло не так' })
    }
  }
)

router.post(
  '/remove',
  auth,
  async (req, res) => {
    try {
      const { id } = req.body

      const candidate = await Gallery.findById(id)
      
      rimraf(path.join(webpPath, id), () => {})
      rimraf(path.join(jpgPath, id), () => {})

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
  auth,
  imgMiddleware.single('img'),
  async (req, res) => {
    try {

      const id = req.file.originalname

      const { width, height } = await sharp(req.file.buffer).metadata()

      await fs.mkdir(path.join(webpPath, id))
      await fs.mkdir(path.join(jpgPath, id))

      const size = width > height ? height: width

      await sharp(req.file.buffer)
        .resize(size, size)
        .jpeg({
          quality: 80,
          chromaSubsampling: '4:2:0'
        })
        .toFile(path.join(jpgPath, id, 'title.jpg'))
        
      await sharp(req.file.buffer)
        .resize(size, size)
        .webp()
        .toFile(path.join(webpPath, id, 'title.webp'))

      await Gallery.updateOne({ _id: id } ,{
        titleImg: {
          webp: `/data/webp/${id}/title.webp`,
          jpg: `/data/jpg/${id}/title.jpg`
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
  auth,
  async (req, res) => {
    try {
      const { category, title } = req.body

      let titleUrl = await translate(title, { 
        from: 'ru', to: 'en',
        engine: translateEngine, key: translateKey
      })
      titleUrl = titleUrl.split(' ').join('-').toLowerCase()
      const route = `/${category}/${titleUrl}`

      const order = await Gallery.countDocuments({ category })

      const gallery = new Gallery({
        title, category, route,
        titleEn: titleUrl, 
        order, titleImg: {
          webp: '',
          jpg: ''
        },
        index: {
          exist: false,
          order: null,
        }
      })

      await gallery.save()

      res.json({ id: gallery._id })

    } catch (err) {
      console.log(err)
      res.status(500).json({ message: 'Что-то пошло не так' })
    }
  }
)

module.exports = router