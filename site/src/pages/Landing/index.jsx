import React from 'react'
import Cookies from 'universal-cookie'
import Layout from '../../components/Layout'
import Input from '../../components/Input'
import Button from '../../components/Button'

class Landing extends React.PureComponent {
  constructor() {
    super()
    this.cookies = new Cookies()
    this.handleLogin = this.handleLogin.bind(this)
  }

  componentDidMount() {
    if (this.cookies.get('token')) {
      this.props.history.push('/blackjack')
    }
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
      <Layout title="Log in">
        <h1>Bitcoin21</h1>
        <hr />
        <form onSubmit={this.handleLogin}>
          <Input type="email" name="email" label="Email" required />
          <Input type="password" name="password" label="Password" required />
          <Button>Log in</Button>
        </form>
      </Layout>
    )
  }
}

export default Landing
