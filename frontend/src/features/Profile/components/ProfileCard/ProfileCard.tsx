import {
  EditButtonWhite,
  PointsIcon,
} from '../../../../components/shared/Icons/Icons'
import styles from './ProfileCard.module.css'
import { useAppSelector } from '../../../../hooks/redux'
import { shortenWalletAddress } from '../../../../utils/shortenWalletAddress'
import { AvatarPlaceholder } from '../../../../constants/AvatarPlaceholder.ts'
import { useTonAddress } from '@tonconnect/ui-react'

interface ProfileCardProps {
  isEditing: boolean
}

export const ProfileCard = () => {
  const { nickname, nfts, points, avatar } = useAppSelector((state) => state.user)

  const address = useTonAddress()

  const getImg = () => {

    if (nfts?.[0]?.image_url) {
      return nfts[0].image_url
    }
    if (avatar) {
      return <img src={`data:image/jpg;base64,${avatar}`} alt="Avatar"/>
    }
    return (
      <div className={styles.imagePlaceholder}><span className={styles.imagePlaceholderText}>{nickname}</span></div>
    )
  }

  // const changeProfileImg = () => {}

  return (
    <div className={styles.profileCard}>
      <div className={styles.profileImg}>
        {getImg()}

        {/*{isEditing ? (*/}
        {/*  <div*/}
        {/*    className={styles.profileImgOverlay}*/}
        {/*    onClick={() => changeProfileImg()}*/}
        {/*  >*/}
        {/*    <EditButtonWhite />*/}
        {/*  </div>*/}
        {/*) : null}*/}
      </div>
      <div className={styles.profileInfo}>
        <p className={styles.userName}>{nickname}</p>
        <p className={styles.walletAddress}>{shortenWalletAddress(address)}</p>
      </div>
      <div className={styles.points}>
        <PointsIcon />
        <span>{points}</span>
      </div>
      {/*<AvatarChoosingWrapper*/}
      {/*  onBackButtonClick={() => {}}*/}
      {/*  onSuccessfulSubmit={() => {}}*/}
      {/*/>*/}
    </div>
  )
}
