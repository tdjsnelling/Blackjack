import React from 'react'
import Cookies from 'universal-cookie'
import Layout from '../../components/Layout'
import Input from '../../components/Input'
import Button from '../../components/Button'
import Modal from '../../components/Modal'

import styles from './Blackjack.module.scss'

class Blackjack extends React.PureComponent {
  constructor() {
    super()
    this.state = {
      gameState: null,
      currentHand: 'right',
      balance: 1000,
      outcome: null
    }
    this.cookies = new Cookies()
    this.handleLogout = this.handleLogout.bind(this)
    this.startGame = this.startGame.bind(this)
    this.performAction = this.performAction.bind(this)
  }

  handleLogout() {
    this.cookies.remove('token', { path: '/' })
    this.props.history.push('/')
  }

  startGame(e) {
    e.preventDefault()
    const form = new FormData(e.target)
    const bet = form.get('bet')

    if (bet > this.state.balance) {
      return false
    }

    this.setState({ outcome: null })

    fetch(`${process.env.REACT_APP_API_BASE}/api/game/start/${bet}`, {
      headers: {
        Authorization: this.props.token
      }
    }).then(response => {
      if (response.ok) {
        response.json().then(body => {
          this.setState({
            gameState: body
          })
        })
      }
    })
  }

  performAction(action, option = null) {
    let queryString = `${process.env.REACT_APP_API_BASE}/api/game/action/${action}`

    if (option) queryString += `/${option}`

    fetch(queryString, {
      headers: {
        Authorization: this.props.token
      }
    }).then(response => {
      if (response.ok) {
        response.json().then(body => {
          this.setState({ gameState: body })

          if (body.stage.startsWith('player-turn-')) {
            this.setState({ currentHand: body.stage.split('-')[2] })
          }

          if (body.stage === 'done') {
            let outcome = ''

            if (body.wonOnLeft + body.wonOnRight > body.finalBet) {
              outcome += '🎉 You won!'

              if (body.handInfo[this.state.currentHand].playerHasBlackjack) {
                outcome += ' You got blackjack.'
              } else if (body.dealerHasBusted) {
                outcome += ' The dealer went bust.'
              }
            } else if (body.wonOnLeft + body.wonOnRight === body.finalBet) {
              outcome += '➡️ Push'
            } else {
              outcome += '😓 You lost.'

              if (body.dealerHasBlackjack) {
                outcome += ' The dealer got blackjack.'
              } else if (
                body.handInfo[this.state.currentHand].playerHasBusted
              ) {
                outcome += ' You went bust.'
              }
            }

            this.setState({
              balance:
                this.state.balance +
                body.wonOnLeft +
                body.wonOnRight -
                body.finalBet,
              outcome: outcome
            })
          }
        })
      }
    })
  }

  render() {
    const { gameState, balance, currentHand, outcome } = this.state
    return (
      <Layout title="Play" balance={balance}>
        {(!gameState || gameState.stage === 'done') && (
          <Modal>
            {outcome && (
              <>
                <h1 className={styles.Outcome}>{outcome}</h1>
                <h3 className={styles.PlayAgain}>Play again?</h3>
              </>
            )}
            <form className={styles.BetForm} onSubmit={this.startGame}>
              <Input
                type="number"
                name="bet"
                label="Place bet to play"
                defaultValue="50"
                required
              />
              <Button>Deal</Button>
            </form>
          </Modal>
        )}
        {gameState && (
          <>
            {gameState.stage !== 'done' && (
              <div className={styles.ActionButtonGroup}>
                {Object.keys(
                  gameState.handInfo[currentHand].availableActions
                ).map(
                  (action, i) =>
                    gameState.handInfo[currentHand].availableActions[
                      action
                    ] && (
                      <Button
                        key={i}
                        onClick={() =>
                          this.performAction(
                            action,
                            action === 'hit' ||
                              action === 'stand' ||
                              action === 'double'
                              ? currentHand
                              : null
                          )
                        }
                      >
                        {action}
                      </Button>
                    )
                )}
              </div>
            )}
            <div className={styles.CardGroup}>
              <h2>
                Dealer’s hand{' '}
                {gameState.dealerValue.hi === gameState.dealerValue.lo
                  ? `(${gameState.dealerValue.hi})`
                  : `(${gameState.dealerValue.lo}/${gameState.dealerValue.hi})`}
              </h2>
              {gameState.dealerHoleCard &&
                !gameState.dealerCards.filter(
                  x =>
                    x.text === gameState.dealerHoleCard.text &&
                    x.suite === gameState.dealerHoleCard.suite
                ).length && (
                  <img
                    className={styles.Card}
                    src={`/asset/image/card/1B.svg`}
                    alt="Card 1B"
                  />
                )}
              {gameState.dealerCards.map((card, i) => {
                const cardId = card.text + card.suite.toUpperCase()[0]
                return (
                  <img
                    className={styles.Card}
                    src={`/asset/image/card/${cardId}.svg`}
                    alt={`Card ${cardId}`}
                    key={i}
                  />
                )
              })}
            </div>
            <div className={styles.CardGroup}>
              <h2>
                Your hand{' '}
                {gameState.handInfo[currentHand].playerValue.hi ===
                gameState.handInfo[currentHand].playerValue.lo
                  ? `(${gameState.handInfo[currentHand].playerValue.hi})`
                  : `(${gameState.handInfo[currentHand].playerValue.lo}/${gameState.handInfo[currentHand].playerValue.hi})`}
              </h2>
              {gameState.handInfo[currentHand].cards.map((card, i) => {
                const cardId = card.text + card.suite.toUpperCase()[0]
                return (
                  <img
                    className={styles.Card}
                    src={`/asset/image/card/${cardId}.svg`}
                    alt={`Card ${cardId}`}
                    key={i}
                  />
                )
              })}
            </div>
            {process.env.DEBUG && (
              <>
                <hr />
                <h2>Full state</h2>
                <pre>{JSON.stringify(gameState, null, 2)}</pre>
              </>
            )}
          </>
        )}
      </Layout>
    )
  }
}

export default Blackjack
