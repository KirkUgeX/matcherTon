import axios from 'axios'
import { getJwt } from './localStorage.ts'
import { TonProof } from '../interfaces/TonProof.ts'
import { Account } from '@tonconnect/ui-react'

// const options = {
//   method: 'GET',
//   headers: {
//     Accept: 'application/json',
//     // Do not expose your API key in the browser
//     'X-API-KEY': '8a6a06fa96ed4cac91fa1e1dac0c7f66',
//   },
// }

const serviceUrl = process.env.VITE_API_URL

export const fetchAuthPayload = () => {
  return axios.get(`${serviceUrl}/generate-payload`)
}

export const login = (account: Account, proof: TonProof) => {
  // console.log(address, password)
  return axios.post(
    `${serviceUrl}/token`,
    { account, proof },
    { headers: { 'Content-Type': 'application/json' } }
  )
}

export const loadNFTs = (address: string, chain: string) => {
  // const options = {
  //   method: 'GET',
  //   headers: {
  //     Accept: 'application/json',
  //     // Do not expose your API key in the browser
  //     'X-API-KEY': '8a6a06fa96ed4cac91fa1e1dac0c7f66',
  //   },
  // }
  // fetch(
  //   'https://testnets-api.opensea.io/api/v2/chain/sepolia/account/0x375C60b909a09fCCd783c57dd1185583ce707700/nfts',
  //   options
  // )
  //   .then((response) => response.json())
  //   .then((response) => console.log(response))
  //   .catch((err) => console.error(err))
  const token = getJwt()
  return axios.post(
    `${serviceUrl}/requestNFTgetALL`,
    {
      address,
      chain,
    },
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  )
}

export const fetchPassions = () => {
  const token = getJwt()
  return axios.get(`${serviceUrl}/getpassions`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  })
}

export const validateUsername = async (username: string): Promise<boolean> => {
  // const serviceUrl = process.env.REACT_APP_API_URL
  const token = getJwt()
  const res = await axios.patch(
    `${serviceUrl}/requestCheckUniqueName`,
    {
      username,
    },
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  )
  return res.data.unique
}

export const updateProfile = async (updatedProfile: any): Promise<any> => {
  const token = getJwt()

  const res = await axios.patch(
    `${serviceUrl}/requestChangeUserInfo`,
    updatedProfile,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  )

  return res
}

export const getNftPicture = async (username: string, image: string) => {
  const token = getJwt()
  const res = await axios.post(
    `${serviceUrl}/requestMakeNFTPicture`,
    {
      img: image,
      nickname: username,
    },
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  )
  return res.data.img
}

export const mintNFT = async (
  image: string,
  username: string,
  address: string
) => {
  const token = getJwt()
  const res = await axios.post(
    `${serviceUrl}/requestMintNFT`,
    {
      img: image,
      nickname: username,
      address,
    },
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  )
  return res
}

export const createNewUser = async (obj: any) => {
  const token = getJwt()
  return axios.post(`${serviceUrl}/requestAddUser`, obj, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  })
}
