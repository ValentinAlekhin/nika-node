const { Schema, model, Types } = require('mongoose')

const schema = new Schema({
  title: { type: String, required: true },
  dir: { type: String },
  category: { type: String, required: true },
  imgUrl: {
    webp: { type: String },
    jpg: { type: String },
  },
  galleryUrl: { type: String, required: true },
  owner: { type: Types.ObjectId, ref: 'User' }
})

module.exports = model('GallaryCard', schema)