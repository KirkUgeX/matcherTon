import styles from './Chat.module.css'
import image from './base.png'
import { Button } from '../../components/shared/Button/Button.tsx'
import { ButtonVariant } from '../../components/shared/Button/ButtonVariants.ts'
import {
  BackArrowIcon,
  PencilIcon,
  SendIcon,
} from '../../components/shared/Icons/Icons.tsx'
import { Input } from '../../components/shared/Input/Input.tsx'
import { FormProvider, SubmitHandler, useForm } from 'react-hook-form'
import React, { useContext, useEffect, useState } from 'react'
import { getAllMessages } from '../../services/chat.ts'
import { useAppSelector } from '../../hooks/redux.ts'
import { MainContext } from '../Main/MainContext.ts'
import dayjs from 'dayjs'
import { MessagesList } from './components/MessagesList/MessagesList.tsx'
import { ShowNotify } from '../../components/shared/Notify/NotifyMethods.tsx'
import { AvatarPlaceholder } from '../../constants/AvatarPlaceholder.ts'
import { BackButton } from '@twa-dev/sdk/react'

interface IMessage {
  message: string
}

interface ChatProps {
  onClose: () => void
  chat: { id: number; chat_name: string; user_nft: { image_url: string } }
}

export const Chat: React.FC<ChatProps> = ({ onClose, chat }) => {
  const { userId } = useAppSelector((state) => state.user)
  const formMethods = useForm<IMessage>()
  const [messages, setMessages] = useState<string[]>([])
  const { socket } = useContext(MainContext)

  useEffect(() => {
    getMessages()
    socket?.addEventListener('message', getNewMessage)
    socket?.addEventListener('error', catchError)
    return () => {
      socket?.removeEventListener('message', getNewMessage)
      socket?.addEventListener('error', catchError)
    }
  }, [])

  const catchError = () => {
    ShowNotify('Something wrong happened', 'error')
  }

  const getMessages = async () => {
    const res = await getAllMessages(chat.id, userId)
    setMessages(res.data)
  }

  const getNewMessage = (event: any) => {
    const reader = new FileReader()

    reader.onload = () => {
      const messageString = reader.result
      const message = JSON.parse(messageString as string)
      if (message.chat_id === chat.id) {
        setMessages((prevState) => [...prevState, {...message, id: message.message_id || message.id}])
      }
    }

    reader.readAsText(event.data)
  }

  // should fix any
  const onSubmit: SubmitHandler<IMessage> = (values: any) => {
    if (!values.message.trim()) return;
    const newMessage = {
      event: 'send_message',
      chat_id: chat.id,
      from_user: userId,
      content: values.message.trim(),
      created_at: dayjs().format('YYYY-MM-DD HH:mm:ss'),
    }
    socket?.send(JSON.stringify(newMessage))
    formMethods.reset()
  }

  return (
    <div className={styles.chat}>
      <div className={styles.topBar}>
        <div className={styles.backButtonContainer}>
          <Button type="button" variant={ButtonVariant.Link} onClick={onClose}>
            <BackArrowIcon width="20px" height="20px" />
          </Button>
        </div>
        <img
          className={styles.avatar}
          src={chat?.user_nft?.image_url || AvatarPlaceholder}
          alt="avatar"
        />
        <span className={styles.title}>{chat.chat_name}</span>
      </div>
      <MessagesList messages={messages} />
      <FormProvider {...formMethods}>
        <form
          className={styles.inputArea}
          onSubmit={formMethods.handleSubmit(onSubmit)}
        >
          <Input
            iconToRender={() => <PencilIcon />}
            placeholder="Input text"
            className={styles.messageInput}
            name="message"
            register={formMethods.register}
          />
          <div className={styles.sendButtonWrapper}>
            <Button
              type="submit"
              variant={ButtonVariant.Primary}
              onClick={formMethods.handleSubmit(onSubmit)}
            >
              <SendIcon width="20px" height="20px" />
            </Button>
          </div>
        </form>
      </FormProvider>
      <BackButton onClick={onClose} />
    </div>
  )
}
