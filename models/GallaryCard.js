const { Schema, model, Types } = require('mongoose')

const schema = new Schema({
  title: { type: String, required: true },
  dir: { type: String },
  order: { type: Number },
  category: { type: String, required: true },
  path: {
    webp: { type: String },
    jpg: { type: String },
  },
  galleryUrl: { type: String, required: true },
  galleryId: { type: Types.ObjectId, required: true },
  owner: { type: Types.ObjectId, ref: 'User' }
})

module.exports = model('GallaryCard', schema)