import React, { Fragment } from 'react'

import styles from './Input.module.scss'

class Input extends React.PureComponent {
  render() {
    const { label, rows, forwardRef, ...props } = this.props
    return (
      <Fragment>
        {label && (
          <Fragment>
            <label className={styles.Label}>
              {label}
              {rows ? (
                <textarea
                  className={styles.Input}
                  rows={rows}
                  ref={forwardRef}
                  {...props}
                />
              ) : (
                <input className={styles.Input} ref={forwardRef} {...props} />
              )}
            </label>
          </Fragment>
        )}
        {!label && (
          <Fragment>
            {rows ? (
              <textarea
                className={styles.Input}
                rows={rows}
                ref={forwardRef}
                {...props}
              />
            ) : (
              <input className={styles.Input} ref={forwardRef} {...props} />
            )}
          </Fragment>
        )}
      </Fragment>
    )
  }
}

export default React.forwardRef((props, ref) => (
  <Input forwardRef={ref} {...props} />
))
