const mongoose = require('mongoose')
const blackjack = require('engine-blackjack')
const actions = blackjack.actions
const Game = blackjack.Game
const redis = require('redis')

mongoose.connect(`mongodb://${process.env.DB_HOST}/Bitcoin21`, {
  useNewUrlParser: true
})

const client = redis.createClient()

module.exports = {
  start: (req, res) => {
    const game = new Game()
    const afterDealState = game.dispatch(actions.deal())
    client.set(req.uid.toString(), JSON.stringify(afterDealState))
    res.send(afterDealState)
  },

  end: (req, res) => {
    client.del(req.uid.toString())
    res.sendStatus(200)
  },

  getState: (req, res) => {
    client.get(req.uid.toString(), (err, state) => {
      if (!err) {
        res.send(state)
      } else {
        res.sendStatus(500)
      }
    })
  },

  doAction: (req, res) => {
    client.get(req.uid.toString(), (err, state) => {
      if (!err) {
        const game = new Game(JSON.parse(state))
        let newState

        switch (req.params.action) {
          case 'restore':
            newState = game.dispatch(actions.restore())
            break
          case 'insurance':
            newState = game.dispatch(actions.insurance())
            break
          case 'double':
            newState = game.dispatch(
              actions.double({ position: req.params.option })
            )
            break
          case 'split':
            newState = game.dispatch(actions.split())
            break
          case 'hit':
            newState = game.dispatch(
              actions.hit({ position: req.params.option })
            )
            break
          case 'stand':
            newState = game.dispatch(
              actions.stand({ position: req.params.option })
            )
            break
          default:
            res.sendStatus(404)
        }

        client.set(req.uid.toString(), JSON.stringify(newState))
        res.send(newState)
      } else {
        res.sendStatus(500)
      }
    })
  }
}
