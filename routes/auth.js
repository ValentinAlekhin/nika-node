const { Router } = require('express')
const User = require('../models/User')
const { check, validationResult } = require('express-validator')
const config = require('config')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const auth = require('../middleware/auth')
const router = Router()

router.get(
  '/',
  auth,
  async (req, res) => {
    try {
      res.json({ message: 'Вы успешно вошли' })
    } catch (err) {
      console.log(err)
    }
  } 
)

router.post(
  '/login',
  [
    check('login').not().isEmpty(),
    check('password').isLength({ min: 6 })
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req)

      if(!errors.isEmpty()) {
        return res.status(400).json({
          errors: errors.array(),
          message: 'Некорректные данные'
        })
      }

      const { login, password } = req.body

      const firstLogin = await User.countDocuments()

      if (!firstLogin) {
        const salt = await bcrypt.genSalt(10)
        const hashedPassword = await bcrypt.hash(password, salt)
        const newUser = new User({
          login,
          password: hashedPassword
        })

        await newUser.save()
        res.json({ message: 'Новый пользователь создан' })
      } else {
          const user = await User.findOne({ login })

          const isMatch = await bcrypt.compare(password, user.password)
          if(!isMatch) {
            return res.status(400).json({ message: 'Некорректные данные' })
          }

          const token = jwt.sign(
            { userId: user.id },
            config.get('jwtSecret'),
            { expiresIn: 3600 }
          )

          res.json({ token, userId: user.id, message: 'Вы успешно вошли' })
      }
    } catch (err) {
      console.log(err)
      res.status(500).json({ message: 'Что-то пошло не так, попробуйте снова' })
    }
  } 
)

module.exports = router