import React from 'react'
import {
  BrowserRouter as Router,
  Route,
  Redirect,
  Switch,
  withRouter
} from 'react-router-dom'
import Cookies from 'universal-cookie'

import Landing from './pages/Landing'
import Blackjack from './pages/Blackjack'
import Account from './pages/Account'

class ScrollToTop extends React.Component {
  componentDidUpdate(prevProps) {
    if (this.props.location.pathname !== prevProps.location.pathname) {
      window.scrollTo(0, 0)
    }
  }

  render() {
    return this.props.children
  }
}

const ScrollToTopComponent = withRouter(ScrollToTop)

class PrivateRoute extends React.Component {
  constructor() {
    super()
    this.state = {
      error: null
    }
    this.cookies = new Cookies()
  }

  componentDidMount() {
    fetch(`${process.env.REACT_APP_API_BASE}/api`).catch(e => {
      if (!window.location.href.endsWith('/error')) this.setState({ error: e })
    })
  }

  render() {
    const { component: Component, ...rest } = this.props
    const { error } = this.state

    return (
      <Route
        {...rest}
        render={props =>
          error ? (
            <Redirect
              to={{ pathname: '/error', state: { error: error.toString() } }}
            />
          ) : this.cookies.get('token') ? (
            <Component token={this.cookies.get('token')} {...props} />
          ) : (
            <Redirect
              to={{
                pathname: '/',
                state: {
                  notAuthorized: true,
                  referrer: window.location.pathname
                }
              }}
            />
          )
        }
      />
    )
  }
}

class RouterComponent extends React.Component {
  render() {
    return (
      <Router>
        <ScrollToTopComponent>
          <Switch>
            <Route exact path="/" component={Landing} />
            <PrivateRoute path="/blackjack" component={Blackjack} />
            <PrivateRoute path="/account" component={Account} />
          </Switch>
        </ScrollToTopComponent>
      </Router>
    )
  }
}

export default RouterComponent
