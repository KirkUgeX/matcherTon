import {
  EditButtonWhite,
  PointsIcon,
} from '../../../../components/shared/Icons/Icons'
import styles from './ProfileCard.module.css'
import { useAppSelector } from '../../../../hooks/redux'
import { shortenWalletAddress } from '../../../../utils/shortenWalletAddress'
import { AvatarPlaceholder } from '../../../../constants/AvatarPlaceholder.ts'
import { Avatar } from '../../../SignUp/Steps/Avatar/Avatar.tsx'
import { AvatarChoosingWrapper } from '../AvatarChoosingWrapper/AvatarChoosingWrapper.tsx'
import { useTonAddress, useTonWallet } from '@tonconnect/ui-react'

interface ProfileCardProps {
  isEditing: boolean
}

export const ProfileCard = () => {
  const { nickname, nfts, points } = useAppSelector((state) => state.user)

  const address = useTonAddress()

  const getImgSrc = () => {
    if (nfts?.[0]?.image_url) {
      return nfts[0].image_url
    }
    return AvatarPlaceholder
  }

  // const changeProfileImg = () => {}

  return (
    <div className={styles.profileCard}>
      <div className={styles.profileImg}>
        <img src={getImgSrc()} alt="profile image" />
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
