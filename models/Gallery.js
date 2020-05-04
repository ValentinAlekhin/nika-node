const { Schema, model, Types } = require('mongoose')

const schema = new Schema({
  title: { type: String, required: true },
  category: { type: String, required: true },
  titleImg: {
    webp: { type: String },
    jpg: { type: String }
  },
  route: { type: String, required: true },
  description: { type: String },
  order: { type: Boolean },
  images: [
    // {
    //   path: {
    //     webp: { type: String },
    //     jpg: { type: String }
    //   },
    //   sizes: {
    //     width: { type: String },
    //     height: { type: String }
    //   },
    //   description: { type: String },
    //   order: { type: Number },
    //   id: { type: Number }
    // }
  ],
  index: {
    order: { type: Number },
    exist: { type: Boolean }
  }
})

module.exports = model('Gallery', schema)