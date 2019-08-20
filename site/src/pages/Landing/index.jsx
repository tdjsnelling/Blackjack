import React from 'react'
import Cookies from 'universal-cookie'

class Landing extends React.PureComponent {
  constructor() {
    super()
    this.cookies = new Cookies()
    this.handleLogin = this.handleLogin.bind(this)
  }

  handleLogin(e) {
    e.preventDefault()
    const form = new FormData(e.target)

    fetch(`${process.env.REACT_APP_API_BASE}/api/identity/login`, {
      method: 'post',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        email: form.get('email'),
        password: form.get('password')
      })
    }).then(response => {
      if (response.ok) {
        response.json().then(body => {
          this.cookies.set('token', body.token, { path: '/' })
          this.props.history.push('/blackjack')
        })
      }
    })
  }

  render() {
    return (
      <>
        <h1>Bitcoin21</h1>
        <form onSubmit={this.handleLogin}>
          <input type="email" name="email" placeholder="Email" required />
          <input
            type="password"
            name="password"
            placeholder="Password"
            required
          />
          <button>Log in</button>
        </form>
      </>
    )
  }
}

export default Landing
