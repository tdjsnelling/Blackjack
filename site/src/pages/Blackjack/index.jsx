import React from 'react'
import Cookies from 'universal-cookie'
import classnames from 'classnames'
import numeral from 'numeral'
import Layout from '../../components/Layout'
import Button from '../../components/Button'
import Modal from '../../components/Modal'

import styles from './Blackjack.module.scss'

class Blackjack extends React.PureComponent {
  constructor() {
    super()
    this.state = {
      gameState: null,
      currentHand: 'right',
      balance: 0,
      availableBalance: 0,
      outcome: null,
      valueToBet: 0,
      denominationsToBet: []
    }
    this.denominations = [10, 25, 50, 100, 250, 500, 1000]
    this.cookies = new Cookies()
    this.dealButton = React.createRef()
    this.handleLogout = this.handleLogout.bind(this)
    this.startGame = this.startGame.bind(this)
    this.performAction = this.performAction.bind(this)
    this.playAgain = this.playAgain.bind(this)
    this.addToBet = this.addToBet.bind(this)
    this.clearBet = this.clearBet.bind(this)
    this.handleHotkey = this.handleHotkey.bind(this)
  }

  componentDidMount() {
    fetch(`${process.env.REACT_APP_API_BASE}/api/identity/balance`, {
      headers: {
        Authorization: this.props.token
      }
    }).then(response => {
      if (response.ok) {
        response.json().then(body => {
          this.setState({
            balance: body.balance,
            availableBalance: body.balance
          })
        })
      }
    })

    window.addEventListener('keypress', e => {
      this.handleHotkey(e.key)
    })
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

    if (bet > this.state.balance || bet <= 0) {
      return false
    }

    this.setState({
      outcome: null,
      valueToBet: 0,
      availableBalance: this.state.balance,
      denominationsToBet: []
    })

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

  addToBet(amount) {
    const denominationsToBet = [...this.state.denominationsToBet]
    denominationsToBet.push(amount)
    this.setState({
      valueToBet: this.state.valueToBet + amount,
      availableBalance: this.state.availableBalance - amount,
      denominationsToBet: denominationsToBet
    })
  }

  clearBet() {
    this.setState({
      valueToBet: 0,
      availableBalance: this.state.balance,
      denominationsToBet: []
    })
  }

  handleHotkey(key) {
    if (!this.state.gameState) {
      switch (key) {
        case ' ':
          this.dealButton.current.click()
          break
        case 'c':
          this.clearBet()
          break
        case '1':
          this.addToBet(this.denominations[0])
          break
        case '2':
          this.addToBet(this.denominations[1])
          break
        case '3':
          this.addToBet(this.denominations[2])
          break
        case '4':
          this.addToBet(this.denominations[3])
          break
        case '5':
          this.addToBet(this.denominations[4])
          break
        case '6':
          this.addToBet(this.denominations[5])
          break
        case '7':
          this.addToBet(this.denominations[6])
          break
        default:
          break
      }
    } else if (this.state.gameState.stage.startsWith('player-turn-')) {
      switch (key) {
        case 'h':
          this.performAction('hit', this.state.currentHand)
          break
        case 's':
          this.performAction('stand', this.state.currentHand)
          break
        case 'd':
          this.performAction('double', this.state.currentHand)
          break
        case 'p':
          this.performAction('split')
          break
        case 'u':
          this.performAction('surrender')
          break
        case 'i':
          this.performAction('insurance')
          break
        default:
          break
      }
    } else if (this.state.gameState.stage === 'done') {
      switch (key) {
        case ' ':
          this.playAgain()
          break
        default:
          break
      }
    }
  }

  render() {
    const {
      gameState,
      balance,
      availableBalance,
      currentHand,
      valueToBet,
      denominationsToBet
    } = this.state
    return (
      <Layout title="Play" balance={balance}>
        {!gameState && (
          <Modal toggle={this.dismissModal}>
            <h1>New bet</h1>
            <form className={styles.BetForm} onSubmit={this.startGame}>
              <input
                style={{ display: 'none' }}
                name="bet"
                value={valueToBet}
                readOnly
                required
              />
              <div className={styles.TotalBet}>
                <h2>{numeral(valueToBet).format('0,0')}</h2>
                <Button type="button" onClick={this.clearBet}>
                  Clear (C)
                </Button>
              </div>
              <div className={classnames(styles.CardGroup, styles.ChipGroup)}>
                {denominationsToBet.map((denomination, i) => (
                  <img
                    className={styles.Chip}
                    key={i}
                    src={`/asset/image/chip/${numeral(denomination).format(
                      '0a'
                    )}.svg`}
                    alt=""
                  />
                ))}
              </div>
              <div className={styles.BetButtonGroup}>
                {this.denominations.map((denomination, i) => (
                  <Button
                    type="button"
                    key={i}
                    disabled={availableBalance < denomination}
                    onClick={() => this.addToBet(denomination)}
                  >
                    +{numeral(denomination).format('0a')}
                  </Button>
                ))}
              </div>
              <Button
                className={styles.DealButton}
                disabled={valueToBet > this.state.balance || valueToBet <= 0}
              >
                Deal! (SPACE)
              </Button>
              <button style={{ display: 'none' }} ref={this.dealButton}>
                submit
              </button>
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
                          <span role="img" aria-label="win">
                            🎉
                          </span>{' '}
                          You won! (+
                          {numeral(gameState.wonOnLeft).format('0,0')})
                        </h1>
                      ) : (
                        <h1 className={styles.OutcomeText}>
                          <span role="img" aria-label="lose">
                            😓
                          </span>{' '}
                          You lost
                        </h1>
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
                          <span role="img" aria-label="win">
                            🎉
                          </span>{' '}
                          You won! (+
                          {numeral(gameState.wonOnRight).format('0,0')})
                        </h1>
                      ) : (
                        <h1 className={styles.OutcomeText}>
                          <span role="img" aria-label="lose">
                            😓
                          </span>{' '}
                          You lost
                        </h1>
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
                        <span role="img" aria-label="win">
                          🎉
                        </span>{' '}
                        You won! (+
                        {numeral(gameState.wonOnRight).format('0,0')})
                      </h1>
                    ) : (
                      <h1 className={styles.OutcomeText}>
                        <span role="img" aria-label="lose">
                          😓
                        </span>{' '}
                        You lost
                      </h1>
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
                {gameState.handInfo[currentHand].availableActions.hit && (
                  <Button
                    onClick={() => this.performAction('hit', currentHand)}
                  >
                    Hit (H)
                  </Button>
                )}
                {gameState.handInfo[currentHand].availableActions.stand && (
                  <Button
                    onClick={() => this.performAction('stand', currentHand)}
                  >
                    Stand (S)
                  </Button>
                )}
                {gameState.handInfo[currentHand].availableActions.double && (
                  <Button
                    onClick={() => this.performAction('double', currentHand)}
                  >
                    Double (D)
                  </Button>
                )}
                {gameState.handInfo[currentHand].availableActions.split && (
                  <Button onClick={() => this.performAction('split')}>
                    Split (P)
                  </Button>
                )}
                {gameState.handInfo[currentHand].availableActions.surrender && (
                  <Button onClick={() => this.performAction('surrender')}>
                    Surrender (U)
                  </Button>
                )}
                {gameState.handInfo[currentHand].availableActions.insurance && (
                  <Button onClick={() => this.performAction('insurance')}>
                    Insurance (I)
                  </Button>
                )}
              </div>
            )}
            {gameState.stage === 'done' && (
              <Button className={styles.PlayAgain} onClick={this.playAgain}>
                Play again (SPACE)
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
