import styles from './SignUp.module.css'
import React, { useState } from 'react'
import { Stepper } from './components/Stepper/Stepper.tsx'
import { Username } from './Steps/Username/Username.tsx'
// import { MintPhoto } from './Steps/MintPhoto/MintPhoto.tsx'
import { Description } from './Steps/Description/Description.tsx'
import { Position } from './Steps/Position/Position.tsx'
import { Socials } from './Steps/Socials/Socials.tsx'
import { Avatar } from './Steps/Avatar/Avatar.tsx'
import { Nft } from './Steps/Avatar/nft'
import { useAppSelector } from '../../hooks/redux.ts'
import { createNewUser, login } from '../../services/http.ts'
import { useNavigate } from 'react-router-dom'
import {
  clearJwt,
  clearProof,
  getProof,
  setJwt,
} from '../../services/localStorage.ts'
import { jwtDecode } from 'jwt-decode'
import { setUserId, setUserInfo } from '../../store/slices/user.ts'
import { useDispatch } from 'react-redux'
import { requestMaxUserInfo } from '../../services/main.ts'
import { useLogout } from '../../hooks/useLogout.ts'
import { ShowNotify } from '../../components/shared/Notify/NotifyMethods.tsx'
import { useTonConnectUI, useTonWallet } from '@tonconnect/ui-react'
import { PassionsWrapper } from './Steps/Passions/PassionsWrapper.tsx'
import WebApp from '@twa-dev/sdk'

export const SignUp = () => {
  const dispatch = useDispatch()
  const signUp = useAppSelector((state) => state.signUp)
  const [currentStep, setCurrentStep] = useState(1)
  const [tonConnectUI] = useTonConnectUI()
  const wallet = useTonWallet()
  const navigate = useNavigate()
  const { checkError } = useLogout()

  const goToTheNextStep = () => {
    setCurrentStep((prevState) => prevState + 1)
  }

  const goToThePreviousStep = () => {
    setCurrentStep((prevState) => prevState - 1)
  }

  const onLastStepSubmit = async (nfts: Nft[]) => {
    const { work, username, description, socials, tagsSphere } = signUp
    const newUser = {
      profileNickname: username,
      address: wallet?.account.address,
      socials: socials,
      tagsSphere: tagsSphere,
      work: {
        position: work.position,
        company: work.company,
      },
      nfts: nfts.map((nft) => ({
        name: nft.id,
        image_url: nft.src,
        opensea_url: nft.openSeaUrl,
      })),
      description: description,
    }
    try {
      await createNewUser(newUser)
      const proof = getProof()
      if (wallet?.account && proof) {
        const res = await login(wallet?.account, proof)
        setJwt(res.data.access_token)
        clearProof()
        const userId = (jwtDecode(res.data.access_token) as any).user_id
        dispatch(setUserId(userId))
        const resUser = await requestMaxUserInfo(userId)
        dispatch(setUserInfo(resUser.data))
        navigate('/app')
      }
    } catch (e: any) {
      console.log(e.response);
      if (e?.response?.data?.detail.includes('409')) {
        console.log(e.response.data);
        await tonConnectUI.disconnect()
        clearProof()
        clearJwt()
        ShowNotify('User with this address already exists', 'error')
        navigate('/')
        return
      }
      await checkError(e)
    }
  }

  return (
    <div className={styles.signupWrapper}>
      <div className={styles.signup}>
        <Stepper totalSteps={6} currentStep={currentStep} />
        {currentStep === 1 ? (
          <Username onSuccessfulSubmit={goToTheNextStep} />
        ) : null}
        {/*{currentStep === 2 ? (*/}
        {/*  <MintPhoto*/}
        {/*    onBackButtonClick={goToThePreviousStep}*/}
        {/*    onSuccessfulSubmit={goToTheNextStep}*/}
        {/*  />*/}
        {/*) : null}*/}
        {currentStep === 2 ? (
          <Description
            onSuccessfulSubmit={goToTheNextStep}
            onBackButtonClick={goToThePreviousStep}
          />
        ) : null}
        {currentStep === 3 ? (
          <PassionsWrapper
            onSuccessfulSubmit={goToTheNextStep}
            onBackButtonClick={goToThePreviousStep}
          />
        ) : null}

        {currentStep === 4 ? (
          <Position
            onSuccessfulSubmit={goToTheNextStep}
            onBackButtonClick={goToThePreviousStep}
          />
        ) : null}

        {currentStep === 5 ? (
          <Socials
            onSuccessfulSubmit={goToTheNextStep}
            onBackButtonClick={goToThePreviousStep}
          />
        ) : null}

        {currentStep === 6 ? (
          <Avatar
            onSuccessfulSubmit={onLastStepSubmit}
            onBackButtonClick={goToThePreviousStep}
          />
        ) : null}
      </div>
    </div>
  )
}
