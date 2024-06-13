import styles from './AvatarImage.module.css'
import React from 'react'
import { Nft } from '../../Steps/Avatar/nft'

interface AvatarImageProps {
  avatar: Nft
  onClick: (avatar: Nft) => void
  selected: boolean
}

export const AvatarImage: React.FC<AvatarImageProps> = ({
  avatar,
  onClick,
  selected,
}) => {
  return (
    <div
      onClick={() => onClick(avatar)}
      className={`${styles.avatarImageWrapper} ${
        selected && styles.selectedImageWrapper
      }`}
    >
      <img
        className={`${styles.avatarImage} ${selected && styles.selectedImage}`}
        src={avatar.src}
        alt="avatar"
      />
    </div>
  )
}
