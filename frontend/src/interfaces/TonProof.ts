export interface TonProof {
  timestamp: number
  domain: {
    lengthBytes: number
    value: string
  }
  signature: string
  payload: string
}
