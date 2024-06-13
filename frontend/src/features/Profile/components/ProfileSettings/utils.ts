import { UserState } from '../../../../store/slices/user'

export const transformObject = (sourceObject: UserState) => {
  const {
    userId,
    nickname,
    address,
    socialLinks,
    tagsSphere,
    work,
    nfts,
    description,
  } = sourceObject

  return {
    userID: userId,
    profileNickname: nickname,
    address,
    socials: {
      x: socialLinks.x,
      linkedin: socialLinks.linkedin,
      telegram: socialLinks.telegram || '',
    },
    tagsSphere,
    work,
    nfts,
    description,
  }
}
