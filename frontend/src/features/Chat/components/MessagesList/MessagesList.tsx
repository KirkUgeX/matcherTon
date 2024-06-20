import React, { useEffect, useRef } from 'react'
import styles from '../../Chat.module.css'
import { Message } from '../Message/Message.tsx'
import { MessageType } from '../Message/MessageType.ts'
import { useAppSelector } from '../../../../hooks/redux.ts'

interface MessagesListProps {
  messages: any[]
}

export const MessagesList: React.FC<MessagesListProps> = ({ messages }) => {
  const { userId } = useAppSelector((state) => state.user)
  const listRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    scrollToBottom()
  }, [messages.length])

  const scrollToBottom = () => {
    if (listRef.current) {
      const { scrollHeight, clientHeight } = listRef.current
      // listRef.current.scrollTop = scrollHeight - clientHeight

      listRef.current.scroll({
        top: scrollHeight - clientHeight,
        behavior: 'instant',
      })
    }
  }

  const renderMessages = () => {
    return messages.map((message) => {
      if (message.from_user === userId) {
        return (
          <Message
            key={message.id || message.created_at}
            type={MessageType.own}
            text={message.content}
            date={message.created_at}
          />
        )
      }
      return (
        <Message
          key={message.id || message.created_at}
          type={MessageType.guest}
          text={message.content}
          date={message.created_at}
        />
      )
    })
  }

  return (
    <div ref={listRef} className={styles.messages}>
      {renderMessages()}
    </div>
  )
}
