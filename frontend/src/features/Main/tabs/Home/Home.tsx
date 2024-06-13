import styles from './Home.module.css'
import { Button } from '../../../../components/shared/Button/Button.tsx'
import { ButtonVariant } from '../../../../components/shared/Button/ButtonVariants.ts'
import {
  BigStarIcon,
  CaseIcon,
  DislikeIcon,
  LikeIcon,
} from '../../../../components/shared/Icons/Icons.tsx'
import React, { useEffect, useState } from 'react'
import { Score } from './components/Score/Score.tsx'
import { About } from './components/About/About.tsx'
import { Passions } from './components/Passions/Passions.tsx'
import { Socials } from './components/Socials/Socials.tsx'
import {
  requestMaxUserInfo,
  requestNextUser,
  requestReaction,
} from '../../../../services/main.ts'
import { useAppSelector } from '../../../../hooks/redux.ts'
import { Loader } from './components/Loader/Loader.tsx'
import { useLogout } from '../../../../hooks/useLogout.ts'
import { AvatarPlaceholder } from '../../../../constants/AvatarPlaceholder.ts'

interface HomeProps {}

export const Home: React.FC<HomeProps> = () => {
  const [currentUser, setCurrentUser] = useState<any>(null)
  const [showStopper, setShowStopper] = useState<boolean>(false)
  const user = useAppSelector((state) => state.user)
  const { checkError } = useLogout()
  console.log('user', user)
  useEffect(() => {
    getNextUser()
  }, [])

  const getNextUser = async () => {
    try {
      const { data } = await requestNextUser(user.userId)
      const nextUserId = data.nextUserId
      if (nextUserId === null) {
        return setShowStopper(true)
      }
      const userRes = await requestMaxUserInfo(nextUserId)
      setCurrentUser({ ...userRes.data, userId: nextUserId })
    } catch (e) {
      await checkError(e)
    }
  }

  const onDislike = async () => {
    try {
      await requestReaction(user.userId, currentUser.userId, 'dislike')
      await getNextUser()
    } catch (e) {
      await checkError(e)
    }
  }

  const onLike = async () => {
    try {
      await requestReaction(user.userId, currentUser.userId, 'like')
      await getNextUser()
    } catch (e) {
      await checkError(e)
    }
  }

  if (showStopper) {
    return (
      <div className={styles.stopper}>
        <BigStarIcon />
        <div>That's all for today!</div>
      </div>
    )
  }
  if (!currentUser)
    return (
      <div className={styles.loaderWrapper}>
        <Loader />
      </div>
    )

  return (
    <div className={styles.homeTab}>
      <div className={styles.imageSide}>
        <div className={styles.avatar}>
          {currentUser.nfts.length ? (
            <img
              className={styles.avatarImage}
              src={currentUser.nfts[0].image_url}
              alt="avatar"
            />
          ) : (
            <img
              className={styles.avatarImage}
              src={AvatarPlaceholder}
              alt="avatar"
            />
          )}
        </div>
        <div className={styles.buttonsGroups}>
          <div className={styles.dislikeButton}>
            <Button variant={ButtonVariant.Secondary} onClick={onDislike}>
              <DislikeIcon />
            </Button>
          </div>
          <div className={styles.likeButton}>
            <Button variant={ButtonVariant.Primary} onClick={onLike}>
              <LikeIcon /> Like
            </Button>
          </div>
        </div>
      </div>
      <div className={styles.descriptionSide}>
        <div className={styles.cardTop}>
          <div className={styles.userbase}>
            <div className={styles.userName}>{currentUser.nickname}</div>
            <div className={styles.userPosition}>
              <CaseIcon className={styles.userPositionIcon} />
              <div className={styles.userPositionName}>
                {currentUser.work.position}
              </div>
              <div className={styles.userPositionDelimiter}>&#8226;</div>
              <div className={styles.userPositionCompany}>
                {currentUser.work.company}
              </div>
            </div>
          </div>
          <Score score={currentUser.score} />
        </div>
        <About text={currentUser.description} />
        <Passions passions={currentUser.tagsSphere} />
        <Socials
          x={currentUser.socialLinks.x}
          linkedin={currentUser.socialLinks.linkedin}
          telegram={currentUser.socialLinks.telegram}
        />
      </div>
    </div>
  )
}
// {
//   "url": "https://80a8-84-224-24-194.ngrok-free.app",
//   "name": "Matcher",
//   "iconUrl": "https://megalion-matcher.s3.amazonaws.com/Matcher.svg",
//   "termsOfUseUrl": "https://ton-connect.github.io/demo-dapp-with-react-ui/terms-of-use.txt",
//   "privacyPolicyUrl": "https://ton-connect.github.io/demo-dapp-with-react-ui/privacy-policy.txt"
// }
