import styles from './Passions.module.css'
import { Chip } from '../../../../../SignUp/components/Chip/Chip.tsx'
import { CardSection } from '../CardSection/CardSection.tsx'
import React from 'react'

interface PassionsProps {
  passions: string[]
}

export const Passions: React.FC<PassionsProps> = ({ passions }) => {
  return (
    <CardSection title="Passions">
      <div className={styles.passionsContent}>
        {passions.map((passion) => (
          <Chip key={passion} text={passion} chosen={false} />
        ))}
      </div>
    </CardSection>
  )
}
