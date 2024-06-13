import { getJwt } from './localStorage.ts'
import axios from 'axios'

const serviceUrl = process.env.VITE_API_URL

export const createChat = (userId: number, companionId: number) => {
  const token = getJwt()
  return axios.post(
    `${serviceUrl}/create_chat`,
    {
      chat_name: 'what the fuck is this',
      chat_users: [userId, companionId],
    },
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  )
}

export const deleleMatch = (target_id: number) => {
  const token = getJwt()
  return axios.post(
    `${serviceUrl}/deleteMatch`,
    {
      target_id,
    },
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  )
}

export const getAllMessages = (chatId: number, userId: number) => {
  const token = getJwt()
  return axios.post(
    `${serviceUrl}/getAllMessages`,
    {
      chat_id: chatId,
      user_id: userId,
    },
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  )
}

export const getChatUuid = (chat: number, userId: number) => {
  const token = getJwt()
  return axios.get(
    `${serviceUrl}/chat_uuid?user_id=${userId}&chat_id=${chat}`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  )
}
