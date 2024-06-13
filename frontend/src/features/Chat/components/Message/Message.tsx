import styles from '../../Chat.module.css'
import { MessageType } from './MessageType.ts'
import React from 'react'
import dayjs from 'dayjs'

interface MessageProps {
  text: string
  date: string
  type: MessageType
}

export const Message: React.FC<MessageProps> = ({ text, date, type }) => {
  const textStyles =
    type === MessageType.guest ? styles.guestMessageText : styles.ownMessageText
  const formattedDate = dayjs(date).format('YYYY-MM-DD HH:mm:ss')
  return (
    <div className={styles[type]}>
      <div className={textStyles}>{text}</div>
      <div className={styles.messageTime}>{formattedDate}</div>
    </div>
  )
}
