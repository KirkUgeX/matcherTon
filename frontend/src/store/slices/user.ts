import { createSlice } from '@reduxjs/toolkit'

export interface UserState {
  userId: number
  nickname: string
  address: string
  socialLinks: {
    x: string
    linkedin: string
    telegram: string
  }
  tagsSphere: string[]
  work: {
    company: string
    position: string
  }
  ban: boolean
  mute: boolean
  nfts: { name: string; image_url: string; opensea_url: string }[]
  score: number
  achievements: string[]
  description: string
  points: number
  avatar: string
  tg_userid: number
}

const initialState: UserState = {
  userId: 0,
  nickname: '',
  address: '',
  socialLinks: {
    x: '',
    linkedin: '',
    telegram: '',
  },
  tagsSphere: [],
  work: {
    company: '',
    position: '',
  },
  ban: false,
  mute: false,
  nfts: [],
  score: 0,
  achievements: [],
  description: '',
  points: 0,
  avatar: '',
  tg_userid: 0
}

const user = createSlice({
  name: 'user',
  initialState,
  reducers: {
    setUserId(state, action) {
      state.userId = action.payload
    },
    setUserInfo(state, { payload }) {
      state.nickname = payload.nickname
      state.address = payload.address
      state.socialLinks = payload.socialLinks
      state.tagsSphere = payload.tagsSphere
      state.work = payload.work
      state.ban = payload.ban
      state.mute = payload.mute
      state.nfts = payload.nfts
      state.score = payload.score
      state.achievements = payload.achievements
      state.description = payload.description
      state.points = payload.points
      state.avatar = payload.avatar
      state.tg_userid = payload.tg_userid
    },
    updateProfileInfo(state, { payload }) {
      state.nickname = payload.nickname
      state.socialLinks = payload.socialLinks
      state.description = payload.description
      state.work.company = payload.work.company
      state.work.position = payload.work.position
    },
    clearUser() {
      return initialState
    },
  },
})

export const { setUserId, setUserInfo, clearUser, updateProfileInfo } =
  user.actions

export default user.reducer
