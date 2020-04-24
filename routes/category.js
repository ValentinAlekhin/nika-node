const { Router } = require('express')
const GalleryCard = require('../models/GallaryCard')
const auth = require('../middleware/auth')
const router = Router()

router.post(
  '/add',
  [],
  async (req, res) => {
    try {
    } catch (err) {
      console.log(err)
      res.status(500).json({ message: 'Что-то пошло не так' })
    }
  }
)

module.exports = router