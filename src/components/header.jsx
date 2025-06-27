import { Link } from 'react-router-dom'
import { Ticket, LogOut, X, Loader2, Wallet, User } from 'lucide-react'
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
  const [showUserPopup, setShowUserPopup] = useState(false);

  // Função para formatar o endereço da carteira
  const formatAddress = (address) => {
    if (!address) return '';
    return `${address.slice(0, 4)}...${address.slice(-4)}`;
  };
  
  // Resetar isHovering quando o estado de autenticação mudar
  useEffect(() => {
    setIsHovering(false);
    setShowUserPopup(false);
  }, [isAuthenticated]);

  // Fechar popup ao clicar fora
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (showUserPopup && !event.target.closest('.user-popup-container')) {
        setShowUserPopup(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showUserPopup]);

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
            <img 
              src="/logo-header.png" 
              alt="Fanatique"
              className="w-[11.5rem] min-[700px]:w-[11.5rem] max-[699px]:w-[8rem] h-auto" 
            />
          </span>
        </Link>
        
                <div className="flex items-center gap-4">
          {isAuthenticated ? (
            <>
              {/* Versão desktop - tela >= 700px */}
              <div className="hidden min-[700px]:flex items-center gap-4">
                {/* Saldo de CHIPS */}
                <div 
                  className="flex items-center cursor-pointer"
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

                {/* Botão da carteira */}
                <div
                  className="relative"
                  onMouseEnter={() => setIsHovering(true)}
                  onMouseLeave={() => setIsHovering(false)}
                >
                  <button
                    onClick={() => disconnectWallet()}
                    className="px-4 py-1 dark:bg-black/30 rounded-md border hover:bg-primary/10 dark:text-primary dark:hover:bg-primary/10 transition-all duration-200 flex items-center gap-2 w-[140px] justify-center"
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

                {/* Seletor de idioma */}
                <LanguageSwitcher />
              </div>

              {/* Versão mobile - tela < 700px */}
              <div className="relative block min-[700px]:hidden user-popup-container">
                <button
                  onClick={() => setShowUserPopup(!showUserPopup)}
                  className="p-2 rounded-md border hover:bg-primary/10 dark:text-primary dark:hover:bg-primary/10 transition-all duration-200"
                  style={{
                    borderColor: 'transparent'
                  }}
                >
                  <User size={18} />
                </button>

                {/* Balão popup do usuário */}
                {showUserPopup && (
                  <div className="absolute top-full right-0 mt-2 p-4 bg-background border border-border rounded-lg shadow-lg z-50 min-w-[220px]">
                    <div className="flex flex-col gap-3">
                      {/* Saldo de CHIPS */}
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-muted-foreground">Saldo CHIPS</span>
                        <div className="flex items-center gap-1">
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
                                width:"1rem", 
                                height:"auto",
                                transformStyle: "preserve-3d"
                              }} 
                            /> 
                          </div>
                          {isLoadingBalance ? (
                            <Loader2 size={12} className="animate-spin text-green-600 dark:text-green-400" />
                          ) : (
                            <span className="text-sm font-medium text-primary">
                              {typeof userChipsBalance === 'number' ? userChipsBalance.toFixed(2) : '0.00'}
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Separador */}
                      <div className="border-t border-border"></div>

                      {/* Endereço da carteira */}
                      <div>
                        <div className="text-xs text-muted-foreground mb-1">
                          Endereço
                        </div>
                        <div className="text-sm font-mono bg-muted p-2 rounded text-center">
                          {formatAddress(account)}
                        </div>
                      </div>

                      {/* Separador */}
                      <div className="border-t border-border"></div>

                      {/* Seletor de idioma */}
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-muted-foreground">Idioma</span>
                        <LanguageSwitcher />
                      </div>

                      {/* Separador */}
                      <div className="border-t border-border"></div>

                      {/* Botão de sair */}
                      <button
                        onClick={() => {
                          disconnectWallet();
                          setShowUserPopup(false);
                        }}
                        className="flex items-center justify-center gap-2 px-3 py-2 bg-red-500 hover:bg-red-600 text-white rounded-md text-sm transition-colors"
                      >
                        <LogOut size={14} />
                        {t('actions.logout')}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </>
          ) : (
            <>
              {/* Botão de login para desktop */}
              <div className="hidden min-[700px]:block">
                <LoginHandler showAsButton={true} />
              </div>
              
              {/* Seletor de idioma para quando não logado */}
              <div className="flex items-center gap-2">
                <LanguageSwitcher />
              </div>
            </>
          )}
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