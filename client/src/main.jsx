import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { AuthProvider } from './context/AuthContext.jsx'
import { WalletProvider } from './context/WalletContext.jsx'
import { GlobalUIProvider } from './components/GloabalUI.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <GlobalUIProvider>
      <AuthProvider>
        <WalletProvider>
          <App />
        </WalletProvider>
      </AuthProvider>
    </GlobalUIProvider>
  </StrictMode>
)
