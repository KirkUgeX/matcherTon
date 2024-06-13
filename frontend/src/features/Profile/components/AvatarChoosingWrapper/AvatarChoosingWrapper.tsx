import { Avatar } from '../../../SignUp/Steps/Avatar/Avatar.tsx'
import { Nft } from '../../../SignUp/Steps/Avatar/nft'
import styles from './AvatarChoosingWrapper.module.css'

interface AvatarChoosingWrapperProps {
  onBackButtonClick: () => void
  onSuccessfulSubmit: (nfts: Nft[]) => void | Promise<void>
}
export const AvatarChoosingWrapper = ({
  onBackButtonClick,
  onSuccessfulSubmit,
}: AvatarChoosingWrapperProps) => {
  return (
    <div className={styles.avatarChoosingWrapper}>
      <Avatar
        onBackButtonClick={onBackButtonClick}
        onSuccessfulSubmit={onSuccessfulSubmit}
      />
    </div>
  )
}
