const express = require('express')
const app = express()
const routes = require('./routes')
const morgan = require('morgan')
const chalk = require('chalk')
const bodyParser = require('body-parser')
const cors = require('cors')

app.use(cors())
app.use(bodyParser.json())

// Request logging
const colorizeStatus = status => {
  if (status) {
    if (status.startsWith('2')) {
      return chalk.green(status)
    } else if (status.startsWith('4') || status.startsWith('5')) {
      return chalk.red(status)
    } else {
      return chalk.cyan(status)
    }
  } else {
    return null
  }
}

app.use(
  morgan((tokens, req, res) => {
    return [
      chalk.grey(new Date().toISOString()),
      chalk.yellow(tokens.method(req, res)),
      tokens.url(req, res),
      colorizeStatus(tokens.status(req, res)),
      `(${tokens['response-time'](req, res)} ms)`
    ].join(' ')
  })
)

// API routes
app.use('/api', routes)

// Listen on port
app.listen(6001)
