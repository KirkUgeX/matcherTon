import styles from './Avatar.module.css'
// import { CelebrateIcon } from '../../../../components/shared/Icons/Icons.tsx'
import { Layout } from '../../components/Layout/Layout.tsx'
import React, { useEffect, useState } from 'react'
import { loadNFTs } from '../../../../services/http.ts'
import { AvatarImage } from '../../components/AvatarImage/AvatarImage.tsx'
import { Nft } from './nft'
import { chainAdapter } from './chainAdapter.ts'
import { useTonAddress, useTonWallet } from '@tonconnect/ui-react'

interface AvatarProps {
  onBackButtonClick: () => void
  onSuccessfulSubmit: (nfts: Nft[]) => void | Promise<void>
}
export const Avatar: React.FC<AvatarProps> = ({
  onBackButtonClick,
  onSuccessfulSubmit,
}) => {
  const [images, setImages] = useState<Nft[]>([])
  const [selectedAvatar, setSelectedAvatar] = useState<Nft | null>(null)
  const wallet = useTonWallet()

  useEffect(() => {
    onInit()
  }, [])

  const onInit = async () => {
    if (wallet?.account.address) {
      try {
        const res = await loadNFTs(
          wallet?.account.address || '',
          wallet?.account.chain || ''
        )
        setImages(
          res.data?.nfts.map((nft: any) => ({
            src: nft.image_url,
            id: nft.name,
            openSeaUrl: nft.opensea_url,
          }))
        )
      } catch (e) {
        console.log(e)
      }
    }
  }

  const onAvatarClick = (avatar: Nft) => {
    setSelectedAvatar(avatar)
  }

  const onSubmit = () => {
    // ну тут должна быть валидация типа
    // if (!selectedAvatar) return
    onSuccessfulSubmit(selectedAvatar ? [selectedAvatar] : [])
  }

  return (
    <Layout
      title={`Pick avatar from your Wallet`}
      subtext={"And that's all!"}
      onBackClick={onBackButtonClick}
      forwardButtonText={"Let's meet"}
      // forwardButtonText={
      //   <>
      //     Let's meet
      //     <span className={styles.backButtonIcon}>
      //       <CelebrateIcon width="18px" height="18px" />
      //     </span>
      //   </>
      // }
      onForwardClick={onSubmit}
    >
      <div className={styles.avatarStep}>
        {images.length
          ? images.map((nft) => (
              <AvatarImage
                selected={nft.id === selectedAvatar?.id}
                onClick={onAvatarClick}
                key={nft.id}
                avatar={nft}
              />
            ))
          : null}
      </div>
    </Layout>
  )
}
