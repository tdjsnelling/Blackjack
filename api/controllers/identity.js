const mongoose = require('mongoose')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const crypto = require('crypto')
const User = require('../schema/user')
const config = require('../config.json')

const dbHost = process.env.DOCKER ? '21satoshi-mongo' : 'localhost'
mongoose.connect(`mongodb://${dbHost}/21satoshi`, {
  useNewUrlParser: true
})

module.exports = {
  register: (req, res) => {
    if (req.body.email && req.body.name && req.body.password) {
      const created = Date.now()

      User.findOne({ email: req.body.email }, (err, doc) => {
        if (!err) {
          if (!doc) {
            bcrypt.hash(req.body.password, 10, (err, hash) => {
              if (!err) {
                const token = jwt.sign(
                  { email: req.body.email, created: created },
                  config.userJwtSecret
                )
                const newUser = new User({
                  created: created,
                  name: req.body.name,
                  email: req.body.email,
                  password: hash,
                  balance: 0,
                  token: token
                })

                newUser.save((err, doc) => {
                  if (!err && doc) {
                    res.send({
                      token: doc.token,
                      uid: doc._id,
                      email: doc.email
                    })
                  } else {
                    // mongoose save error
                    res.sendStatus(500)
                  }
                })
              } else {
                // bcrypt error
                res.sendStatus(500)
              }
            })
          } else {
            // user already exists
            res.sendStatus(409)
          }
        } else {
          // mongoose find error
          res.sendStatus(500)
        }
      })
    } else {
      // form not complete
      res.sendStatus(400)
    }
  },

  login: (req, res) => {
    if (req.body.email && req.body.password) {
      User.findOne({ email: req.body.email }, (err, doc) => {
        if (!err) {
          if (doc) {
            bcrypt.compare(req.body.password, doc.password, (err, matches) => {
              if (!err) {
                if (matches) {
                  res.send({
                    token: doc.token,
                    uid: doc._id,
                    email: doc.email
                  })
                } else {
                  // incorrect password
                  res.sendStatus(401)
                }
              } else {
                // bcrypt error
                res.sendStatus(500)
              }
            })
          } else {
            // user does not exist
            res.sendStatus(404)
          }
        } else {
          // mongoose find error
          res.sendStatus(500)
        }
      })
    } else {
      // form not complete
      res.sendStatus(400)
    }
  },

  delete: (req, res) => {
    if (req.body.email && req.body.password) {
      User.findOne({ email: req.body.email }, (err, doc) => {
        if (!err) {
          if (doc) {
            bcrypt.compare(req.body.password, doc.password, (err, matches) => {
              if (!err) {
                if (matches) {
                  User.deleteOne({ email: req.body.email }, err => {
                    if (!err) {
                      res.sendStatus(200)
                    } else {
                      // delete error
                      res.sendStatus(500)
                    }
                  })
                } else {
                  // incorrect password
                  res.sendStatus(401)
                }
              } else {
                // bcrypt error
                res.sendStatus(500)
              }
            })
          } else {
            // user does not exist
            res.sendStatus(404)
          }
        } else {
          // mongoose find error
          res.sendStatus(500)
        }
      })
    } else {
      // form not complete
      res.sendStatus(400)
    }
  },

  changePassword: (req, res) => {
    if (req.body.password && req.body.newPassword) {
      User.findOne({ email: req.email }, (err, doc) => {
        if (!err) {
          if (doc) {
            bcrypt.compare(req.body.password, doc.password, (err, matches) => {
              if (!err) {
                if (matches) {
                  bcrypt.hash(req.body.newPassword, 10, (err, hash) => {
                    if (!err) {
                      User.findOneAndUpdate(
                        { email: req.email },
                        { $set: { password: hash } },
                        (err, doc) => {
                          if (!err) {
                            if (doc) {
                              res.sendStatus(200)
                            } else {
                              // user not found
                              res.sendStatus(404)
                            }
                          } else {
                            // mongoose update error
                            res.sendStatus(500)
                          }
                        }
                      )
                    } else {
                      // bcrypt error
                      res.sendStatus(500)
                    }
                  })
                } else {
                  // password incorrect
                  res.sendStatus(401)
                }
              } else {
                // bcrypt error
                res.sendStatus(500)
              }
            })
          } else {
            // not found
            res.sendStatus(404)
          }
        } else {
          // mongoose find error
          res.sendStatus(500)
        }
      })
    } else {
      // incomplete form
      res.sendStatus(400)
    }
  },

  generatePasswordResetToken: (req, res) => {
    if (req.body.email) {
      User.findOne({ email: req.body.email }, (err, doc) => {
        if (!err) {
          if (doc) {
            const c = crypto.createCipheriv(
              'aes-256-cbc',
              config.cipherKey,
              config.cipherIv
            )
            let token = c.update(
              JSON.stringify({
                email: req.body.email,
                timestamp: new Date().getTime()
              }),
              'utf8',
              'hex'
            )
            token += c.final('hex')

            // TODO: send link by email

            res.send(token)
          } else {
            res.sendStatus(404)
          }
        } else {
          res.sendStatus(500)
        }
      })
    } else {
      // incomplete form
      res.sendStatus(400)
    }
  },

  verifyPasswordResetToken: (req, res) => {
    if (req.body.token) {
      const d = crypto.createDecipheriv(
        'aes-256-cbc',
        config.cipherKey,
        config.cipherIv
      )
      let decrypted

      try {
        decrypted = d.update(req.body.token, 'hex')
        decrypted += d.final()
        decrypted = JSON.parse(decrypted)

        const now = new Date().getTime()
        const diff = now - decrypted.timestamp
        const hours = Math.floor(diff / 1000 / 60 / 60)

        if (hours < 24) {
          res.send({ email: decrypted.email })
        } else {
          // token expired
          res.sendStatus(401)
        }
      } catch (e) {
        // error decrypting
        res.sendStatus(401)
      }
    } else {
      // incomplete form
      res.sendStatus(400)
    }
  },

  resetPassword: (req, res) => {
    if (req.body.email && req.body.newPassword && req.body.token) {
      const d = crypto.createDecipheriv(
        'aes-256-cbc',
        config.cipherKey,
        config.cipherIv
      )
      let decrypted

      try {
        decrypted = d.update(req.body.token, 'hex')
        decrypted += d.final()
        decrypted = JSON.parse(decrypted)

        const now = new Date().getTime()
        const diff = now - decrypted.timestamp
        const hours = Math.floor(diff / 1000 / 60 / 60)

        if (hours < 24 && decrypted.email === req.body.email) {
          bcrypt.hash(req.body.newPassword, 10, (err, hash) => {
            if (!err) {
              User.findOneAndUpdate(
                { email: req.body.email },
                { $set: { password: hash } },
                (err, doc) => {
                  if (!err && doc) {
                    res.sendStatus(200)
                  } else {
                    // mongoose error
                    res.sendStatus(500)
                  }
                }
              )
            } else {
              // bcrypt error
              res.sendStatus(500)
            }
          })
        } else {
          // token expired
          res.sendStatus(401)
        }
      } catch (e) {
        // error decrypting
        res.sendStatus(401)
      }
    } else {
      // incomplete form
      res.sendStatus(400)
    }
  },

  getBalance: (req, res) => {
    User.findOne({ email: req.email }, (err, doc) => {
      if (!err) {
        if (doc) {
          res.send({ balance: doc.balance })
        } else {
          res.sendStatus(404)
        }
      } else {
        res.sendStatus(500)
      }
    })
  }
}
