import styles from './About.module.css'
import React from 'react'
import { CardSection } from '../CardSection/CardSection.tsx'

interface AboutProps {
  text: string
}

export const About: React.FC<AboutProps> = ({ text }) => {
  return (
    <CardSection title="About">
      <div className={styles.aboutContent}>{text}</div>
    </CardSection>
  )
}
