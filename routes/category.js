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
const { ImageCompressor } = require('../helpers/sharp')
const router = Router()

const translateEngine = config.get('translateEngine')
const translateKey = config.get('translateKey')

const dataDir = path.join(__dirname, '..', 'data')

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
      
      rimraf(path.join(dataDir, id), () => {})

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
      const galleryDir = path.join(dataDir, id)

      await fs.mkdir(galleryDir)

      const titleImage = new ImageCompressor(req.file.buffer, id)

      const response = await titleImage.getTitleImages(path.join('data', id))

      await Gallery.updateOne({ _id: id } ,{
        titleImg: { ...response }
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

      const route = `/${category}/${title.toLowerCase()}`

      const order = await Gallery.countDocuments({ category })

      const gallery = new Gallery({
        title, category, route,
        titleEn: title, 
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