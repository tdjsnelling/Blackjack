import React from 'react'
import Cookies from 'universal-cookie'
import Layout from '../../components/Layout'
import Input from '../../components/Input'
import Button from '../../components/Button'

import styles from './Landing.module.scss'

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

  handleRegister(e) {
    e.preventDefault()
    const form = new FormData(e.target)

    fetch(`${process.env.REACT_APP_API_BASE}/api/identity/register`, {
      method: 'post',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        name: form.get('name'),
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
        <h1 className={styles.Logotype}>21satoshi</h1>
        <hr />
        <div className={styles.FormGrid}>
          <form onSubmit={this.handleLogin}>
            <h2>Log in</h2>
            <Input type="email" name="email" label="Email" required />
            <Input type="password" name="password" label="Password" required />
            <Button>Log in</Button>
          </form>
          <form onSubmit={this.handleRegister}>
            <h2>Register</h2>
            <Input type="text" name="name" label="Name" required />
            <Input type="email" name="email" label="Email" required />
            <Input type="password" name="password" label="Password" required />
            <Button>Register</Button>
          </form>
        </div>
      </Layout>
    )
  }
}

export default Landing
