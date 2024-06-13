import { createSlice } from '@reduxjs/toolkit'

interface CounterState {
  username: string
  address: string
  description: string
  tagsSphere: string[]
  work: {
    company: string
    position: string
  }
  socials: {
    x: string
    linkedin: string
    telegram: string
  }
  nfts: any[]
}

const initialState: CounterState = {
  username: '',
  address: '',
  description: '',
  tagsSphere: [],
  work: {
    company: '',
    position: '',
  },
  socials: {
    x: '',
    linkedin: '',
    telegram: '',
  },
  nfts: [],
}

const counter = createSlice({
  name: 'signUp',
  initialState,
  reducers: {
    setUsername(state, action) {
      state.username = action.payload
    },
    setDescription(state, action) {
      state.description = action.payload
    },
    setTagsSphere(state, action) {
      state.tagsSphere = action.payload
    },
    setWork(state, action) {
      state.work = action.payload
    },
    setSocials(state, action) {
      state.socials = {
        x: action.payload.x,
        linkedin: action.payload.linkedin,
        telegram: action.payload.telegram,
      }
    },
  },
})

export const {
  setUsername,
  setDescription,
  setTagsSphere,
  setSocials,
  setWork,
} = counter.actions

export default counter.reducer
