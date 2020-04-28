const path = require('path')
const fs = require('fs-extra')
const { Router } = require('express')
const Gallery = require('../models/Gallery')
const router = Router()

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

module.exports = router