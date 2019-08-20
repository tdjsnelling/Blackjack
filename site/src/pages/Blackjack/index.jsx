import React from 'react'
import Cookies from 'universal-cookie'

class Blackjack extends React.PureComponent {
  constructor() {
    super()
    this.cookies = new Cookies()
    this.handleLogout = this.handleLogout.bind(this)
  }

  handleLogout() {
    this.cookies.remove('token', { path: '/' })
    this.props.history.push('/')
  }

  render() {
    return (
      <>
        <h1>Bitcoin21</h1>
        <button onClick={this.handleLogout}>Log out</button>
        <hr />
        <button>Start game</button>
      </>
    )
  }
}

export default Blackjack
