import { Button } from './ui/button'
import { cn } from '../lib/utils'
import { X } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useWalletContext } from '../hooks/useWalletContext'
import { useEffect, useState } from 'react'

export function WalletConnect({ className }) {
  const navigate = useNavigate();
  const {
    account,
    connecting,
    signing,
    isConnected,
    connectWallet,
    disconnectWallet,
    isAuthenticated,
    checkWalletExists,
    requestSignature
  } = useWalletContext();
  
  const [isRegistered, setIsRegistered] = useState(false);

  // Efeito para verificar se o usuário já tem carteira conectada, está cadastrado, 
  // mas não está autenticado (não tem token)
  useEffect(() => {
    const checkAndRequestSignature = async () => {
      // Se temos conta conectada mas não estamos autenticados
      if (account && !isAuthenticated && !connecting && !signing) {
        // Verificar se a carteira já está cadastrada
        const walletCheck = await checkWalletExists();
        
        if (walletCheck?.success && walletCheck?.exists) {
          setIsRegistered(true);
          // Solicitar assinatura automaticamente
          await requestSignature();
        } else if (walletCheck?.success) {
          setIsRegistered(false);
        }
      }
    };
    
    checkAndRequestSignature();
  }, [account, isAuthenticated, connecting, signing, checkWalletExists, requestSignature]);

  // Função para lidar com o clique no botão da carteira quando autenticado
  const handleWalletButtonClick = () => {
    if (isAuthenticated) {
      navigate('/dashboard');
    } else if (isConnected && isRegistered) {
      // Se está conectado e cadastrado, mas não autenticado, solicitar assinatura
      requestSignature();
    }
  };

  if (account) {
    return (
      <div className={cn("flex items-center gap-2", className)}>
        <Button 
          size="md"
          className={cn(
            "relative group pr-10 pl-10 pt-2 pb-2",
            isAuthenticated ? "bg-primary text-white" : "bg-amber-500 text-white"
          )}
          onClick={handleWalletButtonClick}
        >
          <span className="text-sm font-medium text-center">
            {account.slice(0, 6)}...{account.slice(-4)}
          </span>
          <div 
            className="absolute right-3 hidden group-hover:flex items-center justify-center cursor-pointer"
            onClick={(e) => {
              e.stopPropagation();
              disconnectWallet();
            }}
          >
            <X size={18} className="text-[#f24952]" />
          </div>
        </Button>
        
      </div>
    )
  }

  return (
    <div className={cn("flex flex-col gap-2", className)}>
      <Button
        onClick={connectWallet}
        disabled={connecting || signing}
        className="bg-primary text-text-adaptive"
      >
        {connecting ? 'Conectando...' : signing ? 'Validando...' : 'Conectar Carteira'}
      </Button>
    </div>
  )
} 