const { Router } = require('express')
const Gallery = require('../models/Gallery')
const auth = require('../middleware/auth')
const router = Router()

router.get(
  '/index',
  async (req, res) => {
    try {
      const cards = await Gallery.find({ 'index.exist': true })
      res.json({ cards })
    } catch (err) {
      console.log(err)
      res.status(500).json({ message: 'Что-то пошло не так' })
    }
  }
)

router.post(
  '/add-card-to-index',
  auth,
  async (req, res) => {
    try {
      const { id } = req.body

      const order = (await Gallery.find({ 'index.exist': true })).length + 1

      await Gallery.findByIdAndUpdate({ _id: id }, { index: { exist: true, order } })

      res.json({ message: 'Карточка добавлена' })
    } catch (err) {
      console.log(err)
      res.status(500).json({ message: 'Что-то пошло не так' })
    }
  }
)

router.post(
  '/remove-card-from-index',
  auth,
  async (req, res) => {
    try {
      const { id } = req.body

      await Gallery.findByIdAndUpdate({ _id: id }, { index: { exist: false, order: null } })

      res.json({ message: 'Карточка удалена' })
    } catch (err) {
      console.log(err)
      res.status(500).json({ message: 'Что-то пошло не так' })
    }
  }
)

module.exports = router