import styles from './ChatList.module.css'
import React, { useEffect, useState } from 'react'
import { Title } from '../../components/shared/Title/Title.tsx'
import { TitleVariant } from '../../components/shared/Title/TitleVariants.ts'
import { Match } from './components/Match/Match.tsx'
import { getAllChats, getAllMatches } from '../../services/main.ts'
import { createChat, deleleMatch } from '../../services/chat.ts'
import { useAppDispatch, useAppSelector } from '../../hooks/redux.ts'
import { Chat } from '../Chat/Chat.tsx'
import { MessageItem } from './components/MessageItem/MessageItem.tsx'
import { Loader } from '../Main/tabs/Home/components/Loader/Loader.tsx'
import { useLogout } from '../../hooks/useLogout.ts'
import { removeNewMessageChat } from '../../store/slices/chats.ts'
import { AvatarPlaceholder } from '../../constants/AvatarPlaceholder.ts'

// interface ChatListProps {}

export const ChatList = () => {
  const dispatch = useAppDispatch()
  const { userId } = useAppSelector((state) => state.user)
  const [matches, setMatches] = useState<any[] | null>(null)
  const [chats, setChats] = useState<
    { id: number; chat_name: string; user_nft: { image_url: string } }[] | null
  >(null)
  const [selectedChat, setSelectedChat] = useState<number>(0)
  const { newMessage } = useAppSelector((state) => state.chats)
  const { checkError } = useLogout()

  useEffect(() => {
    getMatches()
    getChats()
  }, [])

  useEffect(() => {
    dispatch(removeNewMessageChat(selectedChat))
  }, [selectedChat, newMessage.length])

  const getMatches = async () => {
    try {
      const res = await getAllMatches()
      setMatches(res.data.matches)
    } catch (e) {
      await checkError(e)
    }
  }

  const getChats = async () => {
    try {
      const res = await getAllChats()
      setChats(res.data)
    } catch (e) {
      await checkError(e)
    }
  }

  const onMatchClick = async (id: number) => {
    try {
      await createChat(userId, id)
      await deleleMatch(id)
      setMatches(
        (prevState) =>
          prevState?.filter((match) => match.user_id !== id) || null
      )
      await getChats();
    } catch (e) {
      await checkError(e)
    }
  }

  const onChatClick = (chatId: number) => {
    setSelectedChat(chatId)
  }

  const onCloseChatClick = () => {
    setSelectedChat(0)
  }

  if (selectedChat) {
    const chat = chats?.find((chat) => chat.id === selectedChat)
    if (chat) {
      return <Chat chat={chat} onClose={onCloseChatClick} />
    }
  }

  const renderLists = () => {
    if (!matches || !chats)
      return (
        <div className={styles.loaderWrapper}>
          <Loader />
        </div>
      )

    return (
      <>
        {matches.length ? (
          <div className={styles.matchesListWrapper}>
            <div className={styles.titleWrapper}>
              <Title variant={TitleVariant.h2} size={'sm'}>
                Matches
              </Title>
            </div>
            <div className={styles.matchesList}>
              {matches.map((match) => {
                return (
                  <Match
                    src={match?.NFT?.image_url || AvatarPlaceholder}
                    key={match}
                    id={match.user_id}
                    onClick={onMatchClick}
                  />
                )
              })}
            </div>
          </div>
        ) : null}
        <div className={styles.messagesListWrapper}>
          <div className={styles.titleWrapper}>
            <Title variant={TitleVariant.h2} size={'sm'}>
              Messages
            </Title>
          </div>
          <div className={styles.messagesList}>
            {chats.map((chat) => {
              return (
                <MessageItem
                  newMessage={newMessage.some(
                    (withMessage) => withMessage === chat.id
                  )}
                  onClick={onChatClick}
                  id={chat.id}
                  key={chat.id}
                  description={'item description'}
                  imageSrc={chat?.user_nft?.image_url || AvatarPlaceholder}
                  name={chat.chat_name}
                />
              )
            })}
          </div>
        </div>
      </>
    )
  }

  return <div className={styles.chatList}>{renderLists()}</div>
}
