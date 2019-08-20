import React from 'react'

import styles from './Modal.module.scss'

class Modal extends React.PureComponent {
  render() {
    const { children, toggleFunction } = this.props
    return (
      <div className={styles.Overlay} onClick={toggleFunction}>
        <div className={styles.Modal} onClick={e => e.stopPropagation()}>
          {children}
        </div>
      </div>
    )
  }
}

export default Modal
