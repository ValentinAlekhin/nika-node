const multer = require('multer')

const storage = multer.diskStorage({
  destination(req, file, cd) {
    cb(null, 'images')
  },
  filename(req, file, cb) {
    cb(null, new Date().toISOString() + - + file.originalname)
  }
})

const allowedTypes = ['image/png', 'image/jpg', 'image/jpeg']

const fileFilter = (req, file, cb) => {
  if (allowedTypes.includes(file.mimetype)) {
    cd(null, true)
  } else {
    cd(null, false)
  }
}

module .exports = multer({
  storage,
  fileFilter
})