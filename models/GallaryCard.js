const { Schema, model, Types } = require('mongoose')

const schema = new Schema({
  title: { type: String, required: true },
  imgUrl: { type: String, required: true },
  galleryUrl: { type: String, required: true },
  owner: { type: Types.ObjectId, ref: 'User' }
})

module.exports = model('GallaryCard', schema)