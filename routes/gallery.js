const path = require('path')
const fs = require('fs-extra')
const sharp = require('sharp')
const { Router } = require('express')
const imgMiddleware = require('../middleware/img.js')
const Gallery = require('../models/Gallery')
const Img = require('../models/Img')
const router = Router()

const webpPath = path.join(__dirname, '..', 'data', 'webp')
const jpgPath = path.join(__dirname, '..', 'data', 'jpg')

router.post('/get',
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

router.post('/add-img',
  imgMiddleware.array('images', 50),
  async (req, res) => {
    try {
      const [ category, title ] = req.files[0].originalname.split('_')
      const gallery = await Gallery.findOne({
        category, 
        titleUrl: title 
      })

      const galleryId = gallery.id

      let order = (await Img.find({ galleryId })).length
      console.log(order)

      const imgArr = []

      req.files.forEach(async file => {
        order++

        const { width, height } = await sharp(file.buffer).metadata()
        
        const img = new Img({
          galleryId,
          sizes: { width, height },
          order
        })

        const id = img.id

        // await sharp(file.buffer)
        //   .jpeg({
        //   quality: 80,
        //   chromaSubsampling: '4:2:0'
        //   })
        //   .toFile(path.join(jpgPath, category, title, id + '.jpg'))
        
        // await sharp(file.buffer)
        //   .webp()
        //   .toFile(path.join(webpPath, category, title, id + '.webp'))

        // img.path.webp = `/data/webp/${category}/${title}/${id}.webp`,
        // img.path.jpg = `/data/jpg/${category}/${title}/${id}.jpg`

        imgArr.push(img)

        await img.save()
      })

      console.log(imgArr)
      // await gallery.update({
      //   '$addToSet': { 'images': imgArr }
      // })

      res.json({ message: 'Фото загружены' })
    } catch (err) {
      console.log(err)
      res.status(500).json({ message: 'Что-то пошло не так' })
    }
  }
)

module.exports = router