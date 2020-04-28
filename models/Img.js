const { Schema, Types, model } = require('mongoose')

const schema = new Schema({
  galleryId: { type: Types.ObjectId, required: true },
  path: {
    webp: { type: String, required: true },
    jpg: { type: String, required: true },
  },
  size: {
    with: { type: Number, required: true },
    height: { type: Number, required: true }
  },
  description: { type: String }
})

module.exports = model('Img', schema)