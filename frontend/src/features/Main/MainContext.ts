import { createContext } from 'react'

class MainContextValue {
  public socket: WebSocket | null = null
  public newMessages: { has: boolean; set: () => void } | null = null
}

export const MainContext = createContext<MainContextValue>(
  new MainContextValue()
)
