import { createContext } from 'react';

// Criando o contexto com um valor padrão
export const WalletContext = createContext({
  account: null,
  isConnected: false,
  isAuthenticated: false,
  isInitialized: false,
  token: null,
  signing: false,
  connecting: false,
  provider: null,
  signer: null,
  connectWallet: async () => false,
  disconnectWallet: async () => false,
  requestSignature: async () => false,
  registerWithSignature: async () => false,
  checkWalletExists: async () => ({}),
  getUserData: async () => null,
  setAuthCredentials: () => false,
  clearAuthCredentials: () => false,
  connectAndCheckRegistration: async () => ({}),
  getSigner: async () => null,
  initializeProvider: async () => null,
  verifyAndSwitchNetwork: async () => ({ success: false }),
  ensureAccountAvailable: async () => false,
}); 