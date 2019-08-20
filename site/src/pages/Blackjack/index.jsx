import React from 'react'
import Cookies from 'universal-cookie'
import _ from 'underscore'

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
            gameState: body,
            balance: this.state.balance - bet
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
            this.setState({
              balance: this.state.balance + body.wonOnLeft + body.wonOnRight,
              outcome:
                body.wonOnLeft + body.wonOnRight > body.finalBet
                  ? 'Win'
                  : 'Lose'
            })
          }
        })
      }
    })
  }

  render() {
    const { gameState, balance, currentHand, outcome } = this.state
    return (
      <>
        <h1>Bitcoin21</h1>
        <p>Balance: {balance}</p>
        <button onClick={this.handleLogout}>Log out</button>
        <hr />
        <form onSubmit={this.startGame}>
          <input
            type="number"
            name="bet"
            placeholder="Bet"
            defaultValue="20"
            required
          />
          <button>Start game</button>
        </form>
        {gameState && (
          <>
            {outcome && <h1>{outcome}</h1>}
            <h2>
              Dealer{' '}
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
            <>
              <h2>
                {currentHand} hand{' '}
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
              <h3>Actions</h3>
              {Object.keys(
                gameState.handInfo[currentHand].availableActions
              ).map(
                (action, i) =>
                  gameState.handInfo[currentHand].availableActions[action] && (
                    <button
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
                    </button>
                  )
              )}
            </>
            {gameState.stage === 'done' && (
              <>
                <h2>Outcome</h2>
                <pre>
                  {JSON.stringify(
                    _.pick(
                      gameState,
                      'hits',
                      'wonOnLeft',
                      'wonOnRight',
                      'finalBet',
                      'dealerHasBlackjack',
                      'dealerHasBusted'
                    ),
                    null,
                    2
                  )}
                </pre>
                <h3>Left hand</h3>
                <pre>
                  {JSON.stringify(gameState.handInfo.left.playerValue, null, 2)}
                </pre>
                <h3>Right hand</h3>
                <pre>
                  {JSON.stringify(
                    gameState.handInfo.right.playerValue,
                    null,
                    2
                  )}
                </pre>
              </>
            )}
            <hr />
            <h2>Full state</h2>
            <pre>{JSON.stringify(gameState, null, 2)}</pre>
          </>
        )}
      </>
    )
  }
}

export default Blackjack
