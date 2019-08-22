import React from 'react'

import styles from './Modal.module.scss'

class Modal extends React.PureComponent {
  render() {
    const { children, toggle } = this.props
    return (
      <div className={styles.Modal} onClick={e => e.stopPropagation()}>
        {children}
      </div>
    )
  }
}

export default Modal
