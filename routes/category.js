const path = require('path')
const fs = require('fs-extra')
const rimraf = require('rimraf')
const { Router } = require('express')
const sharp = require('sharp')
const GalleryCard = require('../models/GallaryCard')
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


router.post(
  '/get', 
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

router.post(
  '/remove',
  auth,
  async (req, res) => {
    try {
      const { id } = req.body
      const CardCandidate =  await GalleryCard.findById(id)
      const { category, dir, galleryId } = CardCandidate

      const gallaryCandidate = await Gallery.findById(galleryId)
      
      rimraf(path.join(webpPath, category, dir), () => {})
      rimraf(path.join(jpgPath, category, dir), () => {})

      await CardCandidate.remove()
      await gallaryCandidate.remove()
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

      await GalleryCard.updateOne({ _id: id } ,{
        path: {
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
  auth,
  async (req, res) => {
    try {
      const { category, title } = req.body

      let titleUrl = await translate(title, { 
        from: 'ru', to: 'en',
        engine: translateEngine, key: translateKey
      })
      titleUrl = titleUrl.split(' ').join('-').toLowerCase()
      const galleryUrl = `/${category}/${titleUrl}`

      const gallery = new Gallery({
        title, category, titleUrl
      })

      const order = (await GalleryCard.find({ category: category })).length + 1

      const galleryCard = new GalleryCard({
        category, title, galleryUrl, order,
        dir: titleUrl,
        galleryId: gallery.id,
        imgUrl: {
          webp: '',
          jpg: ''
        }
      })

      await gallery.save()
      await galleryCard.save()

      res.json({ id: galleryCard._id })

    } catch (err) {
      console.log(err)
      res.status(500).json({ message: 'Что-то пошло не так' })
    }
  }
  )

module.exports = router