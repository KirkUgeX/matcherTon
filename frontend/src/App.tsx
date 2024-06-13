import { useEffect, useState } from 'react'
import { Loader } from './components/shared/Loader/Loader.tsx'
import { Toaster } from 'react-hot-toast'
import { AppRouter } from './routes/Router.tsx'
import { getDecodedJwt } from './services/localStorage.ts'
import { setUserId, setUserInfo } from './store/slices/user.ts'
import { useDispatch } from 'react-redux'
import { requestMaxUserInfo } from './services/main.ts'
import { useNavigate } from 'react-router-dom'
import { isTokenInvalid } from './utils/checkTokenForValidity.ts'
import { routes } from './routes/routes.ts'
import WebApp from '@twa-dev/sdk'

const App: React.FC = () => {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    checkLogin()
  }, [])

  const checkLogin = async () => {
    const jwtPayload = getDecodedJwt()
    const isInvalid = isTokenInvalid(jwtPayload)
    if (!isInvalid) {
      if (!jwtPayload.user_id) return navigate(routes.signUp.toRoute)

      try {
        dispatch(setUserId(jwtPayload.user_id))
        const { data } = await requestMaxUserInfo(jwtPayload.user_id)
        dispatch(setUserInfo(data))
        return
      } catch (e: any) {
        if (e.response.data.detail === 'Could not validate credentials') {
          return navigate(routes.login.toRoute)
        }
      }
    }
    navigate(routes.login.toRoute)
  }

  setTimeout(() => {
    setIsLoading(false)
  }, 2000)

  return (
    <>
      {isLoading ? (
        <Loader />
      ) : (
        <main onDragStart={() => false} onDrop={() => false}>
          <AppRouter />
          <Toaster />
        </main>
      )}
    </>
  )
}

export default App
