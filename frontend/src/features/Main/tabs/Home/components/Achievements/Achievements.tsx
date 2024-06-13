import styles from './Achievements.module.css'
import { CardSection } from '../CardSection/CardSection.tsx'
import React from 'react'

interface AchievementsProps {
  achievements: string[]
}

export const Achievement: React.FC<AchievementsProps> = ({ achievements }) => {
  const renderAchievements = () => {
    return achievements.map((ach) => {
      return (
        <div key={ach} className={styles.achievement}>
          {ach}
        </div>
      )
    })
  }

  return (
    <CardSection title="Achievements">
      <div className={styles.achievementsContent}>{renderAchievements()}</div>
    </CardSection>
  )
}
