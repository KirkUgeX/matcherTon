import { combineReducers } from '@reduxjs/toolkit'
import counterReducer from './slices/counter.ts'
import signUpReducer from './slices/signUp.ts'
import userReducer from './slices/user.ts'
import chatReducer from './slices/chats.ts'

const rootReducer = combineReducers({
  user: userReducer,
  counter: counterReducer,
  signUp: signUpReducer,
  chats: chatReducer,
})

export type RootState = ReturnType<typeof rootReducer>

export default rootReducer
