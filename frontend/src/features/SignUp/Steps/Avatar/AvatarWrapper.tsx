import { Avatar } from './Avatar.tsx'
import { Nft } from './nft'

interface AvatarWrapperProps {
  onBackButtonClick: () => void
  onSuccessfulSubmit: (nfts: Nft[]) => void | Promise<void>
}

export const AvatarWrapper = ({
  onBackButtonClick,
  onSuccessfulSubmit,
}: AvatarWrapperProps) => {
  const onSubmit = (nfts: Nft[]) => {
    onSuccessfulSubmit(nfts)
  }

  return (
    <Avatar
      onSuccessfulSubmit={onSubmit}
      onBackButtonClick={onBackButtonClick}
    />
  )
}
