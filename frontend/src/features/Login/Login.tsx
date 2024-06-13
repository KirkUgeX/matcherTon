import { TransparentStarIcon } from '../../components/shared/Icons/Icons'
import { Title } from '../../components/shared/Title/Title'
import { TitleVariant } from '../../components/shared/Title/TitleVariants'
import styles from './Login.module.css'
import { Button } from '../../components/shared/Button/Button'
import { ButtonVariant } from '../../components/shared/Button/ButtonVariants'
import { useEffect, useState } from 'react'
import { useAppDispatch } from '../../hooks/redux.ts'
import { setUserId, setUserInfo } from '../../store/slices/user.ts'
import {
  clearProof,
  getDecodedJwt,
  setJwt,
  setProof,
} from '../../services/localStorage.ts'
import { fetchAuthPayload, login } from '../../services/http.ts'
import { useNavigate } from 'react-router-dom'
import { jwtDecode } from 'jwt-decode'
import { requestMaxUserInfo } from '../../services/main.ts'
import {
  useTonConnectModal,
  useTonAddress,
  useTonWallet,
  useTonConnectUI,
  Account,
  TonConnectButton,
} from '@tonconnect/ui-react'
import { TonProof } from '../../interfaces/TonProof.ts'
import { ShowNotify } from '../../components/shared/Notify/NotifyMethods.tsx'
import { routes } from '../../routes/routes.ts'
import { MainButton, BackButton } from '@twa-dev/sdk/react'
import WebApp from '@twa-dev/sdk'
import { AIIcon, CrownIcon, SmileIcon } from './Icons.tsx'
import { isTokenInvalid } from '../../utils/checkTokenForValidity.ts'
import { AxiosError } from 'axios'

const renderRulesList = () => (
  <ul className={styles.list}>
    <li className={styles.listItem}>
      <CrownIcon />
      <Title variant={TitleVariant.h3}>Scoring algorithm</Title>
      <Title variant={TitleVariant.h4}>
        Protecting from bad actors and ghosts
      </Title>
    </li>
    <li className={styles.listItem}>
      <AIIcon />
      <Title variant={TitleVariant.h3}>AI recommendation system</Title>
      <Title variant={TitleVariant.h4}>Helps to match the right users</Title>
    </li>
    <li className={styles.listItem}>
      <SmileIcon />
      <Title variant={TitleVariant.h3}>Swipe, Chat and Meet</Title>
      <Title variant={TitleVariant.h4}>Familiar mechanism in a new space</Title>
    </li>
  </ul>
)

export const Login = () => {
  const dispatch = useAppDispatch()
  const navigate = useNavigate()
  const [proofToken, setProofToken] = useState()
  const { open, state: tonModalState } = useTonConnectModal()
  const [tonConnectUI] = useTonConnectUI()
  const wallet = useTonWallet()
  const [error, setError] = useState()
  const address = useTonAddress()

  useEffect(() => {
    const jwtPayload = getDecodedJwt()
    const isInvalid = isTokenInvalid(jwtPayload)
    if (!isInvalid) {
      dispatch(setUserId(jwtPayload.user_id))
      checkForRegistration(jwtPayload.user_id)
      return
    }
  }, [address])

  useEffect(() => {
    fetchPayload()
  }, [])

  const fetchPayload = async () => {
    tonConnectUI.setConnectRequestParameters({ state: 'loading' })
    try {
      const { data } = await fetchAuthPayload()
      const { payload } = data
      setProofToken(payload)
      tonConnectUI.setConnectRequestParameters({
        state: 'ready',
        value: { tonProof: payload },
      })
    } catch (e) {
      ShowNotify(
        'An error occurred during the connection. Please try later.',
        'error'
      )
    }
  }

  useEffect(() => {
    if (
      wallet?.connectItems?.tonProof &&
      !('error' in wallet.connectItems.tonProof) &&
      wallet?.account
    ) {
      handleLogin(wallet.account, wallet.connectItems.tonProof.proof)
    }
  }, [address])

  const handleLogin = async (account: Account, proof: TonProof) => {
    try {
      setProof(proof)
      const res = await login(account, proof)
      setJwt(res.data.access_token)
      const userId = (jwtDecode(res.data.access_token) as any).user_id
      dispatch(setUserId(userId))
      WebApp.showAlert('beforeRegistrationCheck')
      await checkForRegistration(userId)
    } catch (e) {
      // alert(e: AxiosError)
      await tonConnectUI.disconnect()
      ShowNotify(
        'An error occurred during the connection. Please try again.',
        'error'
      )
    }
  }

  const checkForRegistration = async (userId: number) => {
    if (userId) {
      try {
        const res = await requestMaxUserInfo(userId)
        WebApp.showAlert('afterRegistrationCheck')
        console.log('MaxUser', res)
        dispatch(setUserInfo(res.data))
        clearProof()
        return redirectToMain()
      } catch (e) {
        WebApp.showAlert('errorRegistrationCheck')
        ShowNotify(
          'An error occurred during the connection. Please try again.',
          'error'
        )
        // tonConnectUI.connected && (await tonConnectUI?.disconnect())
        return
      }
    }
    return redirectToSignUp()
  }

  const redirectToSignUp = () => {
    navigate(routes.signUp.toRoute)
  }

  const redirectToMain = () => [navigate(routes.main.routes.home.toRoute)]

  const onConnectLoginClick = async () => {
    if (address) {
      await tonConnectUI.disconnect()
    }
    if (!proofToken) {
      await fetchPayload()
    }
    return open()
  }

  const isMainButtonDisabled = tonModalState.status === 'opened'
  return (
    <div className={styles.loginPage}>
      <div className={styles.imageWrapper}>
        <img src="/login-img.png" alt="welcome image" />
      </div>
      {error}
      <div className={styles.loginFlow}>
        <div className={styles.titlePage}>
          <Title size="lg" variant={TitleVariant.h2}>
            Welcome to Matcher
          </Title>
        </div>
        <div className={styles.descriptionPage}>
          <Title variant={TitleVariant.h3}>
            Find your perfect match in Web3
          </Title>
        </div>
        {renderRulesList()}
        <TonConnectButton />
        <MainButton
          color="#6f58f6"
          onClick={() => onConnectLoginClick()}
          text={isMainButtonDisabled ? 'Waiting' : 'Connect wallet'}
          disabled={isMainButtonDisabled}
          textColor="#ffffff"
          progress={isMainButtonDisabled}
        />
        <BackButton onClick={() => WebApp.close()} />
      </div>
    </div>
  )
}
