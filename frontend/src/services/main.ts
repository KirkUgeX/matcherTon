import axios from 'axios'
import { getJwt } from './localStorage.ts'

const serviceUrl = process.env.VITE_API_URL

export const requestNextUser = (id: number) => {
  const token = getJwt()
  return axios(
    `${serviceUrl}/requestNextUser`,
    // { user_id: id },
    {
      method: 'POST',
      data: { user_id: id },
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    }
  )
}

export const requestMaxUserInfo = (userId: number) => {
  const token = getJwt()
  return axios.post(
    `${serviceUrl}/requestGetAllUserInfo`,
    { userID: userId },
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  )
}

export const requestUserTgImage = (userId: number) => {
  const token = getJwt();
  return axios.post(
    `${serviceUrl}/requestGetAvatarTg`,
    { tg_user_id: userId },
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  )
}

export const requestMinUserInfo = (userId: number) => {
  const token = getJwt()
  return axios.post(
    `${serviceUrl}/requestGetMinUserInfo`,
    { userID: userId },
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  )
}

export const requestReaction = (
  userId: number,
  targetId: number,
  reactionType: string
) => {
  const token = getJwt()
  return axios.post(
    `${serviceUrl}/requestReactionLikeDislike`,
    { user_id: userId, target_id: targetId, reaction_type: reactionType },
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  )
}

export const getAllMatches = () => {
  const token = getJwt()
  return axios.get(`${serviceUrl}/getAllMatches`, {
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  })
}

export const getAllChats = () => {
  const token = getJwt()
  return axios.get(`${serviceUrl}/getAllChats`, {
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  })
}
