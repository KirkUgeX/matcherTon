import { jwtDecode } from 'jwt-decode'
import { TonProof } from '../interfaces/TonProof.ts'

export const getJwt = () => {
  return localStorage.getItem('token')
}

export const setJwt = (token: string) => {
  return localStorage.setItem('token', token)
}

export const clearJwt = () => {
  localStorage.removeItem('token')
}

export const getProof = (): null | TonProof => {
  const proof = localStorage.getItem('proof')
  if (proof !== null) {
    return JSON.parse(proof)
  }
  return proof
}

export const setProof = (proof: TonProof) => {
  localStorage.setItem('proof', JSON.stringify(proof))
}

export const clearProof = () => {
  localStorage.removeItem('proof')
}

export const getDecodedJwt = () => {
  const token = localStorage.getItem('token')

  if (token) {
    return jwtDecode<any>(token)
  }
  return null
}
