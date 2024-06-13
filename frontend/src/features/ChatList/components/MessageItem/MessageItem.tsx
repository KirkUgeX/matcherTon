import styles from './MessageItem.module.css'
import React from 'react'

interface MessageItemProps {
  name: string
  description: string
  newMessage: boolean
  imageSrc: string
  id: number
  onClick: (id: number) => void
}

export const MessageItem: React.FC<MessageItemProps> = ({
  name,
  description,
  newMessage,
  imageSrc,
  id,
  onClick,
}) => {
  return (
    <div onClick={() => onClick(id)} className={styles.messageItem}>
      <div className={styles.messageItemMain}>
        <div className={styles.imageWrapper}>
          <img src={imageSrc} alt="avatar" />
        </div>
        <div className={styles.chatInfo}>
          <div className={styles.chatName}>{name}</div>
          <div className={styles.chatDescription}>{description}</div>
        </div>
      </div>
      {newMessage && <div className={styles.turnChip}>Your turn</div>}
    </div>
  )
}
