const express = require('express')
const identity = require('./controllers/identity')
const game = require('./controllers/game')
const auth = require('./middleware/auth')

const router = express.Router()

router.route('/').get((req, res) => {
  res.sendStatus(200)
})

// Identity
router.route('/identity/register').post(identity.register)
router.route('/identity/login').post(identity.login)
router.route('/identity/delete').post(identity.delete)
router
  .use(auth)
  .route('/identity/password/change')
  .post(identity.changePassword)
router
  .route('/identity/password/reset/token')
  .post(identity.generatePasswordResetToken)
router
  .route('/identity/password/reset/verify')
  .post(identity.verifyPasswordResetToken)
router.route('/identity/password/reset').post(identity.resetPassword)

// Game
router
  .use(auth)
  .route('/game/start/:bet')
  .get(game.start)
router
  .use(auth)
  .route('/game/end')
  .get(game.end)
router
  .use(auth)
  .route('/game/state')
  .get(game.getState)
router
  .use(auth)
  .route('/game/action/:action/:option?')
  .get(game.doAction)

module.exports = router
