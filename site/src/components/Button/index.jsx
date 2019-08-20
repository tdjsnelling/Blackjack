import React, { Fragment } from 'react'
import classnames from 'classnames'
import { Link } from 'react-router-dom'

import styles from './Button.module.scss'

class Button extends React.PureComponent {
  render() {
    const {
      children,
      secondary,
      danger,
      large,
      className,
      href,
      disabled,
      ...props
    } = this.props
    return (
      <Fragment>
        {!href && (
          <button
            className={classnames(
              styles.Button,
              secondary && styles.secondary,
              danger && styles.danger,
              large && styles.large,
              disabled && styles.disabled,
              className
            )}
            {...props}
          >
            {children}
          </button>
        )}
        {href && (
          <Link
            to={href}
            className={classnames(
              styles.Button,
              secondary && styles.secondary,
              danger && styles.danger,
              large && styles.large,
              disabled && styles.disabled,
              className
            )}
            {...props}
          >
            {children}
          </Link>
        )}
      </Fragment>
    )
  }
}

export default Button
