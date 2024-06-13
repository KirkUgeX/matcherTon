import { useNavigate } from 'react-router-dom'
import { clearUser } from '../store/slices/user.ts'
import { clearJwt } from '../services/localStorage.ts'
import { useDispatch } from 'react-redux'
import { ShowNotify } from '../components/shared/Notify/NotifyMethods.tsx'
import { useTonConnectUI } from '@tonconnect/ui-react'

export const useLogout = () => {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const [tonConnectUI] = useTonConnectUI()

  const checkError = async (e: any, message?: string) => {
    if (e?.response?.status === 401) {
      dispatch(clearUser())
      clearJwt()
      await tonConnectUI.disconnect()
      navigate('/')
      ShowNotify('Your session ended', 'warning')
      return
    }
    ShowNotify(message || 'Something wrong happened', 'error')
  }
  return {
    checkError,
  }
}
