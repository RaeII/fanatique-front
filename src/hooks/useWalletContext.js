import { useContext } from 'react';
import { WalletContext } from '../contexts/WalletContextDef';

// Hook para usar o contexto
export function useWalletContext() {
  
  const context = useContext(WalletContext);
  
  if (!context) {
    throw new Error('useWalletContext deve ser usado dentro de um WalletProvider');
  }
  

  return context;
} 