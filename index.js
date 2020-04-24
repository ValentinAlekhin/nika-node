const express = require('express')
const config = require('config')
const mongoose = require('mongoose')
const fileMiddleware = require('./middleware/file')

const app = express()
const PORT = config.get('port') || 5000

app.use(express.json({ extended: true }))

app.use('/api/auth', require('./routes/auth'))
app.use('/api/category', require('./routes/category'))

app.use(fileMiddleware.single('title'))

start()

async function start() {
  try {
    await mongoose.connect(config.get('mongoUrl'), {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      useCreateIndex: true
    })

    app.listen(PORT, () => console.log(`Server has been sterted on port: ${PORT}`))
  } catch (err) {
    console.log('Server error:', err)
    process.exit(1)
  }
}

