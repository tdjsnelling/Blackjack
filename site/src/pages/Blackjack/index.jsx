import React from 'react'
import Cookies from 'universal-cookie'
import classnames from 'classnames'
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
    this.playAgain = this.playAgain.bind(this)
  }

  handleLogout() {
    this.cookies.remove('token', { path: '/' })
    this.props.history.push('/')
  }

  checkForFinish(state) {
    if (state.stage === 'done') {
      let outcome = ''

      if (state.wonOnLeft + state.wonOnRight > state.finalBet) {
        outcome += '🎉 You won!'

        if (state.handInfo[this.state.currentHand].playerHasBlackjack) {
          outcome += ' You got blackjack.'
        } else if (state.dealerHasBusted) {
          outcome += ' The dealer went bust.'
        }
      } else if (state.wonOnLeft + state.wonOnRight === state.finalBet) {
        outcome += '➡️ Push'
      } else {
        outcome += '😓 You lost.'

        if (state.dealerHasBlackjack) {
          outcome += ' The dealer got blackjack.'
        } else if (state.handInfo[this.state.currentHand].playerHasBusted) {
          outcome += ' You went bust.'
        }
      }

      let newBalance = this.state.balance + state.wonOnLeft + state.wonOnRight

      if (state.wonOnLeft === 0 && state.wonOnRight === 0) {
        newBalance -= state.finalBet
      }

      this.setState({
        balance: newBalance,
        outcome: outcome
      })
    }
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

          this.checkForFinish(body)
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

          this.checkForFinish(body)
        })
      }
    })
  }

  playAgain() {
    this.setState({
      gameState: null
    })
  }

  render() {
    const { gameState, balance, currentHand } = this.state
    return (
      <Layout title="Play" balance={balance}>
        {!gameState && (
          <Modal toggle={this.dismissModal}>
            <h1>New bet</h1>
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
                    src={`/asset/image/card/B${gameState.dealerHoleCard.color}.svg`}
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
            {gameState.handInfo.left.cards && gameState.handInfo.right.cards ? (
              <div className={styles.CardGroupGrid}>
                <div
                  className={classnames(
                    styles.CardGroup,
                    gameState.stage.startsWith('player-turn-') &&
                      gameState.stage !== 'player-turn-left' &&
                      styles.disabled
                  )}
                >
                  {gameState.stage === 'done' && (
                    <div className={styles.DoneOverlay}>
                      {gameState.wonOnLeft > 0 ? (
                        <h1 className={styles.OutcomeText}>
                          🎉 You won! (+{gameState.wonOnLeft})
                        </h1>
                      ) : (
                        <h1 className={styles.OutcomeText}>😓 You lost</h1>
                      )}
                    </div>
                  )}
                  <h2>
                    Your hand{' '}
                    {gameState.handInfo.left.playerValue.hi ===
                    gameState.handInfo.left.playerValue.lo
                      ? `(${gameState.handInfo.left.playerValue.hi})`
                      : `(${gameState.handInfo.left.playerValue.lo}/${gameState.handInfo.left.playerValue.hi})`}
                  </h2>
                  {gameState.handInfo.left.cards.map((card, i) => {
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
                <div
                  className={classnames(
                    styles.CardGroup,
                    gameState.stage.startsWith('player-turn-') &&
                      gameState.stage !== 'player-turn-right' &&
                      styles.disabled
                  )}
                >
                  {gameState.stage === 'done' && (
                    <div className={styles.DoneOverlay}>
                      {gameState.wonOnRight > 0 ? (
                        <h1 className={styles.OutcomeText}>
                          🎉 You won! (+{gameState.wonOnRight})
                        </h1>
                      ) : (
                        <h1 className={styles.OutcomeText}>😓 You lost</h1>
                      )}
                    </div>
                  )}
                  <h2>
                    Your hand{' '}
                    {gameState.handInfo.right.playerValue.hi ===
                    gameState.handInfo.right.playerValue.lo
                      ? `(${gameState.handInfo.right.playerValue.hi})`
                      : `(${gameState.handInfo.right.playerValue.lo}/${gameState.handInfo.right.playerValue.hi})`}
                  </h2>
                  {gameState.handInfo.right.cards.map((card, i) => {
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
              </div>
            ) : (
              <div className={styles.CardGroup}>
                {gameState.stage === 'done' && (
                  <div className={styles.DoneOverlay}>
                    {gameState.wonOnRight > 0 ? (
                      <h1 className={styles.OutcomeText}>
                        🎉 You won! (+{gameState.wonOnRight})
                      </h1>
                    ) : (
                      <h1 className={styles.OutcomeText}>😓 You lost</h1>
                    )}
                  </div>
                )}
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
            )}
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
            {gameState.stage === 'done' && (
              <Button className={styles.PlayAgain} onClick={this.playAgain}>
                Play again
              </Button>
            )}
            {process.env.REACT_APP_DEBUG === 'true' && (
              <>
                <hr />
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
