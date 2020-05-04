const path = require('path')
const express = require('express')
const bodyParser = require('body-parser')
const config = require('config')
const mongoose = require('mongoose')

const app = express()
const PORT = config.get('port') || 5000

app.use(express.json({ extended: true }))
app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())

app.use('/data', express.static(path.join(__dirname, 'data')))
app.use(express.static(path.join(__dirname, 'client', 'build')))

app.use('/api/auth', require('./routes/auth'))
app.use('/api/category', require('./routes/category'))
app.use('/api/gallery', require('./routes/gallery'))
app.use('/api/main-pages', require('./routes/mainPages'))

start()

async function start() {
  try {
    await mongoose.connect(config.get('mongoUrl'), {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      useCreateIndex: true,
      useFindAndModify: false
    })

    app.listen(PORT, () => console.log(`Server has been sterted on port: ${PORT}`))
  } catch (err) {
    console.log('Server error:', err)
    process.exit(1)
  }
}

