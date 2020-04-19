const { Router } = require('express')
const GalleryCard = require('../models/GallaryCard')
const auth = require('../middleware/auth')
const router = Router()

router.post(
  'add',
  [auth],
  async (req, res) => {
    try {

      const { title, } = req.body

      galleryUrl = title
        .toLowerCase()
        .split(' ')
        .join('-')
      
      galleryCard = new GalleryCard({
        title, galleryUrl,
      })
    } catch (err) {
      res.status(500).json({ message: 'Что-то пошло не так' })
    }
  }
)

module.exports = router