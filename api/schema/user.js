const mongoose = require('mongoose')

const userSchema = new mongoose.Schema({
  created: Number,
  name: String,
  email: String,
  password: String,
  balance: Number,
  token: String
})

module.exports = mongoose.model('user', userSchema)
