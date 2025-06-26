import { Link } from 'react-router-dom'
import { Ticket, LogOut, X, Loader2 } from 'lucide-react'
import { ThemeToggle } from './ui/theme-toggle'
import { LanguageSwitcher } from './LanguageSwitcher'
import { LoginHandler } from './LoginHandler'
import { Button } from './ui-v2/Button'
import { cn } from '../lib/utils'
import { useWalletContext } from '../hooks/useWalletContext'
import { useTranslation } from 'react-i18next'
import { useState, useEffect } from 'react'
import { getUserBalance } from '../api/userChips'

export function Header({ className }) {
  const { isAuthenticated, disconnectWallet, account } = useWalletContext();
  const { t } = useTranslation('common');
  const [isHovering, setIsHovering] = useState(false);
  const [userChipsBalance, setUserChipsBalance] = useState(0);
  const [isLoadingBalance, setIsLoadingBalance] = useState(false);
  const [isSpinning, setIsSpinning] = useState(false);

  // Função para formatar o endereço da carteira
  const formatAddress = (address) => {
    if (!address) return '';
    return `${address.slice(0, 4)}...${address.slice(-4)}`;
  };
  
  // Carregar saldo de $CHIPS do usuário
  useEffect(() => {
    const loadChipsBalance = async () => {
      if (!isAuthenticated) return;
      
      try {
        setIsLoadingBalance(true);
        const balanceData = await getUserBalance();
        // Garantir que o valor seja numérico
        const balance = balanceData?.balance ? Number(balanceData.balance) : 0;
        setUserChipsBalance(balance);
      } catch (error) {
        console.error("Erro ao carregar saldo de $CHIPS:", error);
      } finally {
        setIsLoadingBalance(false);
      }
    };
    
    loadChipsBalance();
  }, [isAuthenticated]);
  
  // Efeito para controlar a animação da ficha
  const handleChipHover = () => {
    if (!isSpinning) {
      setIsSpinning(true);
      setTimeout(() => {
        setIsSpinning(false);
      }, 1500); // Duração da animação de dois giros completos
    }
  };

  return (
    <header className={cn("border-b border-secondary/10 dark:border-white/10 bg-background sticky top-0 z-50", className)}>
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <Link className="flex items-center gap-2 text-primary dark:text-white">
          <span className="font-bold text-text-adaptive text-xl">
            <img src="/logo-header.png" alt="Fanatique"style={{width:"11.5rem", height:"auto"}} />
          </span>
        </Link>
        
        <div className="flex items-center gap-4">
          {isAuthenticated && (
            <div 
              className="flex items-center mr-2 cursor-pointer"
              onMouseEnter={handleChipHover}
              onMouseLeave={() => {}}
            >
              <div 
                className="relative" 
                style={{
                  perspective: "1000px"
                }}
              >
                <img 
                  src="/chips-fanatique-icon.png" 
                  alt="CHIPS" 
                  style={{
                    width:"1.2rem", 
                    height:"auto",
                    marginRight: "0.2rem",
                    transformStyle: "preserve-3d",
                    animation: isSpinning ? "chipSpin 1.5s ease-in-out" : "none"
                  }} 
                /> 
              </div>
              
              {isLoadingBalance ? (
                <Loader2 size={14} className="animate-spin text-green-600 dark:text-green-400" />
              ) : (
                <span 
                  className="text-sm font-medium text-primary dark:text-primary"
                  onMouseEnter={handleChipHover}
                >
                  {typeof userChipsBalance === 'number' ? userChipsBalance.toFixed(2) : '0.00'}
                </span>
              )}
            </div>
          )}
          
          {isAuthenticated ? (
            <div
              className="relative"
              onMouseEnter={() => setIsHovering(true)}
              onMouseLeave={() => setIsHovering(false)}
            >
              <button
                onClick={() => disconnectWallet()}
                className="px-4 py-1 dark:bg-black/30 rounded-md border hover:bg-primary/10 dark:text-primary dark:hover:bg-primary/10 transition-all duration-200 flex items-center gap-2 min-w-[120px] justify-center"
                style={{
                  borderColor: 'transparent',
                  backgroundColor: ''
                }}
              >
                {!isHovering ? (
                  <span className="text-sm font-mono">{formatAddress(account)}</span>
                ) : (
                  <>
                    <X size={16} />
                    <span className="text-sm">{t('actions.logout')}</span>
                  </>
                )}
              </button>
            </div>
          ) : (
            <LoginHandler showAsButton={true} />
          )}
          
          <div className="flex items-center gap-2">
            <LanguageSwitcher />
            <ThemeToggle />
          </div>
        </div>
      </div>
      
      <style>{`
        @keyframes chipSpin {
          0% { transform: rotateY(0deg); }
          50% { transform: rotateY(360deg); }
          100% { transform: rotateY(720deg); }
        }
      `}</style>
    </header>
  )
} 