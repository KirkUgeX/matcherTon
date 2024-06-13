export const shortenWalletAddress = (address: string): string =>
  `${address.slice(0, 6)}...${address.slice(-3)}`
