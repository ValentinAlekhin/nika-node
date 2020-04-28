const { Schema, model, Types } = require('mongoose')

const schema = new Schema({
  title: { type: String, required: true },
  titleUrl: { type: String, required: true },
  description: { type: String },
  category: { type: String, required: true },
  images: { type: Array }
})

module.exports = model('Gallery', schema)