import React from 'react'

import ProgressBarLine from './components/ProgressBarLine'

import styles from './styles.module.css'

export const ExampleComponent = ({ text }) => {
  return <div className={styles.test}>{text}</div>
}

export { ProgressBarLine }
