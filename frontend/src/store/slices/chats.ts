import { createSlice } from '@reduxjs/toolkit'

export interface ChatsState {
  newMessage: number[]
}

const initialState: ChatsState = {
  newMessage: [],
}

const chats = createSlice({
  name: 'chats',
  initialState,
  reducers: {
    setNewMessageChat(state, action) {
      state.newMessage.push(action.payload)
    },
    removeNewMessageChat(state, action) {
      state.newMessage = state.newMessage.filter(
        (chatId) => chatId !== action.payload
      )
    },
  },
})

export const { setNewMessageChat, removeNewMessageChat } = chats.actions

export default chats.reducer
