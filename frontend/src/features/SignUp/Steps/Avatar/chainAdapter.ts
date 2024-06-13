export const chainAdapter = (chainName: string) => {
  if (chainName === 'polygon') return 'matic'
  return chainName
}
