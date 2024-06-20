import React, { useEffect, useState } from 'react'
import styles from './Main.module.css'
import { Menu } from './components/Menu/Menu.tsx'
import { AppTab } from './constants.ts'
import { Tabs } from './tabs/Tabs.tsx'
import { MainContext } from './MainContext.ts'
import { getDecodedJwt } from '../../services/localStorage.ts'
import { useLocation, useNavigate } from 'react-router-dom'
import { useAppDispatch, useAppSelector } from '../../hooks/redux.ts'
import { setNewMessageChat } from '../../store/slices/chats.ts'
import { useLogout } from '../../hooks/useLogout.ts'
import { routes } from '../../routes/routes.ts'
import TelegramBot from 'node-telegram-bot-api'
import WebApp from '@twa-dev/sdk'
import axios from 'axios'

interface MainProps {}

export const Main: React.FC<MainProps> = () => {
  const dispatch = useAppDispatch()
  const location = useLocation()
  const [, , tab] = location.pathname.split('/')
  const navigate = useNavigate()
  const [currentTab, setCurrentTab] = useState<string>(`/${tab}`)
  const [haveNewMessage, setHaveNewMessage] = useState<boolean>(false)
  const [socket, setSocket] = useState<WebSocket | null>(null)
  const { newMessage } = useAppSelector((state) => state.chats)
  const { userId } = useAppSelector((state) => state.user)
  const { checkError } = useLogout()

  useEffect(() => {
    openSocket()
    return () => {
      socket && socket.close(4999)
    }
  }, [])


  const openSocket = () => {
    const { uuid } = getDecodedJwt()
    const socket = new WebSocket(`wss://matcherchat.fun:8765/${uuid}`)

    socket.onerror = (e) => {
      console.log('error')
      console.log(e)
    }

    socket.onclose = (e) => {
      if (e.code !== 4999) {
        openSocket()
      }
    }

    socket.onmessage = (event: any) => {
      const reader = new FileReader()

      reader.onload = () => {
        try {
          const messageString = reader.result
          const message = JSON.parse(messageString as string)
          if (message?.from_user !== userId) {
            dispatch(setNewMessageChat(message.chat_id))
          }
        } catch (e) {
          checkError(e)
        }
      }

      reader.readAsText(event.data)
      setHaveNewMessage(true)
    }

    socket.onopen = () => {
      console.log('open')
      console.log(socket)
    }

    setSocket(socket)
  }

  // useEffect(() => {}, [location])

  useEffect(() => {
    if (currentTab === AppTab.Chat && haveNewMessage) {
      setHaveNewMessage(false)
    }
  }, [haveNewMessage, currentTab])

  const setTab = (tab: AppTab) => {
    setCurrentTab(tab)
    navigate(routes.main.toRoute(tab))
  }

  return (
    <MainContext.Provider
      value={{
        socket: socket,
        newMessages: {
          has: haveNewMessage,
          set: () => setHaveNewMessage(false),
        },
      }}
    >
      <div
        className={styles.mainWrapper}
        onDragStart={() => false}
        onDrop={() => false}
        draggable={false}
      >
        <div className={styles.main}>
          <Tabs currentTab={currentTab} />
          <Menu
            haveNewMessage={Boolean(newMessage.length)}
            currentTab={currentTab}
            setCurrentTab={setTab}
          />
        </div>
      </div>
    </MainContext.Provider>
  )
}
