import styles from './Score.module.css'

interface ScoreProps {
  score: number
}

export const Score: React.FC<ScoreProps> = ({ score }) => {
  return (
    <div className={styles.score}>
      <div className={styles.scoreTitle}>TON score:</div>
      <div className={styles.scoreValue}>{score}</div>
    </div>
  )
}
