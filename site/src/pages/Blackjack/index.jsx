import React from 'react'
import Cookies from 'universal-cookie'

class Blackjack extends React.PureComponent {
  constructor() {
    super()
    this.state = {
      gameState: null
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

  startGame() {
    fetch(`${process.env.REACT_APP_API_BASE}/api/game/start`, {
      headers: {
        Authorization: this.props.token
      }
    }).then(response => {
      if (response.ok) {
        response.json().then(body => {
          this.setState({ gameState: body })
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
        })
      }
    })
  }

  render() {
    const { gameState } = this.state
    return (
      <>
        <h1>Bitcoin21</h1>
        <button onClick={this.handleLogout}>Log out</button>
        <hr />
        <button onClick={this.startGame}>Start game</button>
        {gameState && (
          <>
            {gameState.stage === 'player-turn-right' && (
              <>
                <h2>Right hand</h2>
                <h3>Value</h3>
                <pre>
                  {JSON.stringify(
                    gameState.handInfo.right.playerValue,
                    null,
                    2
                  )}
                </pre>
                <h3>Cards</h3>
                <pre>
                  {JSON.stringify(gameState.handInfo.right.cards, null, 2)}
                </pre>
                <h3>Actions</h3>
                {Object.keys(gameState.handInfo.right.availableActions).map(
                  (action, i) =>
                    gameState.handInfo.right.availableActions[action] && (
                      <button
                        key={i}
                        onClick={() =>
                          this.performAction(
                            action,
                            action === 'hit' ||
                              action === 'stand' ||
                              action === 'double'
                              ? 'right'
                              : null
                          )
                        }
                      >
                        {action}
                      </button>
                    )
                )}
              </>
            )}
            {gameState.stage === 'player-turn-left' && (
              <>
                <h2>Left hand</h2>
                <h3>Value</h3>
                <pre>
                  {JSON.stringify(gameState.handInfo.left.playerValue, null, 2)}
                </pre>
                <h3>Cards</h3>
                <pre>
                  {JSON.stringify(gameState.handInfo.left.cards, null, 2)}
                </pre>
                <h3>Actions</h3>
                {Object.keys(gameState.handInfo.left.availableActions).map(
                  (action, i) =>
                    gameState.handInfo.left.availableActions[action] && (
                      <button
                        key={i}
                        onClick={() =>
                          this.performAction(
                            action,
                            action === 'hit' ||
                              action === 'stand' ||
                              action === 'double'
                              ? 'left'
                              : null
                          )
                        }
                      >
                        {action}
                      </button>
                    )
                )}
              </>
            )}
            {gameState.stage === 'done' && (
              <>
                <h2>Outcome</h2>
                <pre>
                  {JSON.stringify(
                    (({
                      hits,
                      wonOnLeft,
                      wonOnRight,
                      dealerHasBlackjack,
                      dealerHasBusted
                    }) => ({
                      hits,
                      wonOnLeft,
                      wonOnRight,
                      dealerHasBlackjack,
                      dealerHasBusted
                    }))(gameState),
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
                <h3>Dealer</h3>
                <pre>
                  <pre>{JSON.stringify(gameState.dealerValue, null, 2)}</pre>
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
