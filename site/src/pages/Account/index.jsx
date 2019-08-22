import React from 'react'
import numeral from 'numeral'
import Layout from '../../components/Layout'
import Button from '../../components/Button'
import Input from '../../components/Input'

import styles from './Account.module.scss'

class Account extends React.PureComponent {
  constructor() {
    super()
    this.state = {
      balance: 0,
      passwordChangeSuccess: null
    }
    this.handleChangePassword = this.handleChangePassword.bind(this)
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
            balance: body.balance
          })
        })
      }
    })
  }

  handleChangePassword(e) {
    e.preventDefault()
    const form = new FormData(e.target)

    fetch(`${process.env.REACT_APP_API_BASE}/api/identity/password/change`, {
      method: 'post',
      headers: {
        'Content-Type': 'application/json',
        Authorization: this.props.token
      },
      body: JSON.stringify({
        password: form.get('password'),
        newPassword: form.get('newPassword')
      })
    }).then(response => {
      if (response.ok) {
        this.setState({ passwordChangeSuccess: true })
      }
    })
  }

  render() {
    const { balance, passwordChangeSuccess } = this.state
    return (
      <Layout title="Account" balance={balance}>
        <h1 className={styles.Heading}>Account</h1>
        <hr />

        <h2 className={styles.Subheading}>Balance</h2>
        <p className={styles.Balance}>
          <span>{numeral(balance).format('0,0')}</span> satoshi
        </p>
        <div className={styles.ButtonGroup}>
          <Button>Deposit</Button>
          <Button>Withdraw</Button>
        </div>

        <h2 className={styles.Subheading}>Change password</h2>
        <form onSubmit={this.handleChangePassword}>
          <Input type="password" name="password" label="Password" required />
          <Input
            type="password"
            name="newPassword"
            label="New password"
            required
          />
          <Button>Change</Button>
          {passwordChangeSuccess && (
            <p className={styles.SuccessPrompt}>
              Password was updated successfully.
            </p>
          )}
        </form>
      </Layout>
    )
  }
}

export default Account
