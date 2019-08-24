const jwt = require('jsonwebtoken')
const mongoose = require('mongoose')
const config = require('../config.json')
const User = require('../schema/user')

const dbHost = process.env.DOCKER ? 'blackjack-mongo:27018' : 'localhost'
mongoose.connect(`mongodb://${dbHost}/Blackjack`, {
  useNewUrlParser: true
})

module.exports = (req, res, next) => {
  if (req.headers.authorization) {
    const token = req.headers.authorization

    jwt.verify(token, config.userJwtSecret, (err, decoded) => {
      if (!err && decoded) {
        User.findOne({ email: decoded.email }, (err, doc) => {
          if (!err && doc) {
            if (token === doc.token) {
              req.uid = doc._id
              req.email = decoded.email
              next()
            } else {
              // token was not correct
              res.sendStatus(401)
            }
          } else {
            // mongoose find error
            res.sendStatus(500)
          }
        })
      } else {
        // token was invalid
        res.sendStatus(401)
      }
    })
  } else {
    // token was not provided
    res.sendStatus(401)
  }
}
