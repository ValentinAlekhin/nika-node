const jwt = require('jsonwebtoken')
const config = require('config')

module.exports = (req, res, next) => {
  if (req.method === 'OPTIONS') return next()

  try {
    const [ , token, userId] = req.headers.authorization.split(' ')
    if (!token) return res.status(401).json({ message: 'Нет авторизации' })

    const decoded = jwt.verify(token, config.get('jwtSecret'))

    if (decoded.userId === userId) return next()

    res.status(401).json({ message: 'Нет авторизации' })
  } catch (err) {
    console.log(err)
    res.status(401).json({ message: 'Нет авторизации' })
  }
}