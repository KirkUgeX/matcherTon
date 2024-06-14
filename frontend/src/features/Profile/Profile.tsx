import { Button } from '../../components/shared/Button/Button'
import { ButtonVariant } from '../../components/shared/Button/ButtonVariants'
import { LogoutIcon, SupportIcon } from '../../components/shared/Icons/Icons'
import { Title } from '../../components/shared/Title/Title'
import { TitleVariant } from '../../components/shared/Title/TitleVariants'
import { ProfileCard } from './components/ProfileCard/ProfileCard'
import styles from './Profile.module.css'
import { clearJwt } from '../../services/localStorage'
import { clearUser } from '../../store/slices/user'
import { useDispatch } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { ProfileSettings } from './components/ProfileSettings/ProfileSettings'
import { useMediaQuery } from '../../hooks/useMediaQuery'
import { useTonConnectUI } from '@tonconnect/ui-react'
import { useState } from 'react'

export const Profile = () => {
  const dispatch = useDispatch()
  const [tonConnectUI] = useTonConnectUI()
  const navigate = useNavigate()
  const isMobile = useMediaQuery('(max-width: 700px)')
  const [isEditing, setIsEditing] = useState(false)

  const onLogout = async () => {
    dispatch(clearUser())
    clearJwt()
    await tonConnectUI.disconnect()
    navigate('/')
  }

  return (
    <div className={styles.profileWrapper}>
      <div className={styles.titleWrapper}>
        <Title size="sm" variant={TitleVariant.h1}>
          My profile
        </Title>
      </div>
      <div className={styles.profileInner}>
        <div className={styles.leftColumn}>
          <div className={styles.profileCardWrapper}>
            <ProfileCard />
          </div>
          {!isMobile && (
            <>
              <div className={styles.buttonWrapper}>
                <Button
                  onClick={() => console.log('Button CTA')}
                  variant={ButtonVariant.Link}
                >
                  <span className={styles.buttonIcon}>
                    <SupportIcon />
                  </span>
                  Support
                </Button>
              </div>
              <div className={styles.buttonWrapper}>
                <Button onClick={onLogout} variant={ButtonVariant.Link}>
                  <span className={styles.buttonIcon}>
                    <LogoutIcon />
                  </span>
                  Log out
                </Button>
              </div>
            </>
          )}
        </div>
        <div className={styles.rightColumn}>
          <ProfileSettings
            isEditing={isEditing}
            switchEditing={() => setIsEditing((prevState) => !prevState)}
          />
        </div>
      </div>
      {isMobile && (
        <div className={styles.mobileCTA}>
          <div className={styles.buttonWrapper}>
            <Button
              onClick={() => console.log('Button CTA')}
              variant={ButtonVariant.Link}
            >
              <span className={styles.buttonIcon}>
                <SupportIcon />
              </span>
              Support
            </Button>
          </div>
          <div className={styles.buttonWrapper}>
            <Button onClick={onLogout} variant={ButtonVariant.Link}>
              <span className={styles.buttonIcon}>
                <LogoutIcon />
              </span>
              Log out
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
