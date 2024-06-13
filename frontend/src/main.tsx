import React from 'react'
import ReactDOM from 'react-dom/client'
import { Provider } from 'react-redux'
import { store } from './store/store.ts'
import App from './App.tsx'
import './index.css'
import { Web3ModalProvider } from './components/connect.tsx'
import { BrowserRouter } from 'react-router-dom'

import WebApp from '@twa-dev/sdk'
import { TonConnectUIProvider } from '@tonconnect/ui-react'
import { manifestURL } from './constants/ManifestURL.ts'

WebApp.ready()
// WebApp.expand()
ReactDOM.createRoot(document.getElementById('root')!).render(
  // <React.StrictMode>
  <Provider store={store}>
    <BrowserRouter>
      <TonConnectUIProvider manifestUrl={manifestURL}>
        <Web3ModalProvider>
          <App />
        </Web3ModalProvider>
      </TonConnectUIProvider>
    </BrowserRouter>
  </Provider>
  // </React.StrictMode>
)
