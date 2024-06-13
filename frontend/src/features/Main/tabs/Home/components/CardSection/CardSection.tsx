import styles from './CardSection.module.css'
import React, { ReactElement } from 'react'

interface CardSectionProps {
  title: string
  children: ReactElement | ReactElement[]
}

export const CardSection: React.FC<CardSectionProps> = ({
  title,
  children,
}) => {
  return (
    <div className={styles.cardSection}>
      <div className={styles.cardSectionTitle}>{title}</div>
      {children}
    </div>
  )
}
