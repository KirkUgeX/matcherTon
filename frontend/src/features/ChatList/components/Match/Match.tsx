import styles from './Match.module.css'
import React from 'react'

interface MatchProps {
  id: number
  onClick: (id: number) => void
  src: string
}

export const Match: React.FC<MatchProps> = ({ id, onClick, src }) => {
  return (
    <div onClick={() => onClick(id)} className={styles.match}>
      {/*some text pretty long text and some more text*/}
      <img className={styles.matchImage} src={src} alt="match" />
    </div>
  )
}
