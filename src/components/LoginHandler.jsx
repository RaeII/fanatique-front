/* eslint-disable no-unused-vars */
import { useState, useCallback } from 'react';
import { useWalletContext } from '../hooks/useWalletContext';
import { Button } from '../components/ui-v2/Button';
import { Loader2, Wallet } from 'lucide-react';
import { showError, showSuccess } from '../lib/toast';
import { useTranslation } from 'react-i18next';

export function LoginHandler({ onLoginSuccess, showAsButton = true }) {
  const { t } = useTranslation(['app', 'common']);
  const {
    account,
    signing,
    disconnectWallet,
    registerWithSignature,
    connectWallet,
    requestSignature,
    checkWalletExists,
    isAuthenticated,
    isConnected,
    isChilizNetwork,
    verifyAndSwitchNetwork,
    ensureAccountAvailable
  } = useWalletContext();

  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [networkLoading, setNetworkLoading] = useState(false);

  // Função para verificar se o usuário está cadastrado
  const checkIfUserRegistered = useCallback(async () => {
    try {
      setLoading(true);
      
      // Primeiro, garantir que temos um endereço de carteira válido
      let currentAccount = account;
      
      if (!currentAccount) {
        console.log('LoginHandler: checkIfUserRegistered - Conta não encontrada, aguardando...');
        
        // Usa o método auxiliar para garantir que a conta esteja disponível
        currentAccount = await ensureAccountAvailable(3, 500);
        
        if (!currentAccount) {
          console.error('LoginHandler: checkIfUserRegistered - Não foi possível obter o endereço da carteira');
          setLoading(false);
          return;
        }
        
        console.log('LoginHandler: checkIfUserRegistered - Endereço obtido com sucesso:', currentAccount);
      }
      
      console.log('LoginHandler: checkIfUserRegistered - Verificando carteira:', currentAccount);
      
      // Verifica se o usuário já está cadastrado - passando o endereço explicitamente
      const walletCheck = await checkWalletExists(currentAccount);
      
      if (!walletCheck.success) {
        showError(walletCheck.message || t('app:errors.checkRegistrationError'));
        setLoading(false);
        return;
      }
      
      // Se o usuário não estiver cadastrado, registra automaticamente
      if (!walletCheck.exists) {
        console.log('LoginHandler: Usuário não cadastrado, registrando automaticamente...');
        
        // Verificar e trocar para a rede Chiliz se necessário
        if (!isChilizNetwork) {
          setNetworkLoading(true);
          const networkResult = await verifyAndSwitchNetwork();
          setNetworkLoading(false);
          
          if (!networkResult.success) {
            showError(networkResult.message || "Você precisa estar na rede Chiliz para continuar");
            setLoading(false);
            return;
          }
        }
        
        // Registra o usuário automaticamente sem solicitar nome
        const registerResult = await registerWithSignature(currentAccount);
        
        if (registerResult === true) {
          showSuccess(t('app:success.registered'));
          
          // Aguarda um pouco para garantir persistência
          await new Promise(resolve => setTimeout(resolve, 1000));
          
          // Chama callback de sucesso se fornecido
          if (onLoginSuccess) {
            onLoginSuccess();
          }
          
          setLoading(false);
          return;
        } else {
          showError(t('app:errors.registerError'));
          setLoading(false);
          return;
        }
      }
      
      // Verificar e trocar para a rede Chiliz se necessário
      if (!isChilizNetwork) {
        setNetworkLoading(true);
        const networkResult = await verifyAndSwitchNetwork();
        setNetworkLoading(false);
        
        if (!networkResult.success) {
          showError(networkResult.message || "Você precisa estar na rede Chiliz para continuar");
          setLoading(false);
          return;
        }
      }
      
      // Solicita assinatura com o endereço explícito
      const result = await requestSignature(currentAccount);
      
      // Verifica se o login foi bem-sucedido
      if (result === true) {
        // Aguarda um pouco para garantir que os dados estejam persistidos
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Chama callback de sucesso se fornecido
        if (onLoginSuccess) {
          onLoginSuccess();
        }
        
        return;
      } else {
        showError(t('app:errors.loginFailed'));
      }
      
      setLoading(false);
    } catch (error) {
      showError(t('app:errors.checkRegistrationError'));
      setLoading(false);
    }
  }, [account, checkWalletExists, isChilizNetwork, requestSignature, ensureAccountAvailable, t, verifyAndSwitchNetwork, onLoginSuccess, registerWithSignature]);

  // Função para conectar a carteira
  const handleConnectWallet = async () => {
    try {

      // Evita múltiplas tentativas enquanto está carregando
      if (loading || signing || networkLoading) {
        console.log('LoginHandler: Bloqueado devido a processo em andamento');
        return;
      }
      
      // Verifica se MetaMask está disponível
      if (!window.ethereum) {
        console.log('LoginHandler: MetaMask não encontrada');
        showError('MetaMask não está instalada');
        return;
      }
      
      setLoading(true);
      
      let connected = true;

      console.log("\n\n isConnected hlander", isConnected,"\n\n");

      if (!isConnected) {
        connected = await connectWallet();
        
        if (!connected) {
          console.log('LoginHandler: Falha na conexão');
          setLoading(false);
          return;
        }
      } else {
        console.log('LoginHandler: Carteira já estava conectada');
      }

      console.log("\n\n account hlander", account,"\n\n");
      
      // Verifica se temos o endereço da conta
      if (!account) {
        console.log('LoginHandler: Aguardando endereço da carteira ser atualizado...');
        
        // Usa o método auxiliar para garantir que a conta esteja disponível
        const walletAddress = await ensureAccountAvailable(5, 500);
        
        if (!walletAddress) {
          showError('Erro ao obter endereço da carteira. Tente novamente.');
          setLoading(false);
          return;
        }
        
        console.log('LoginHandler: Endereço da carteira obtido com sucesso:', walletAddress);
      }
            
      // Se já está autenticado, chama callback ou recarrega
      if (isAuthenticated) {
        console.log('LoginHandler: Usuário já autenticado');
        if (onLoginSuccess) {
          onLoginSuccess();
        } else {
          window.location.reload();
        }
        return;
      }
      
      // Aguarda um pouco antes de prosseguir
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Após conectar com sucesso, verifica se o usuário está cadastrado
      await checkIfUserRegistered();
    } catch (error) {
      console.error("LoginHandler: Erro ao conectar carteira:", error);
      showError(t('app:errors.walletError'));
      setLoading(false);
    }
  };

  // Se está autenticado, não mostra nada quando usado como botão
  if (isAuthenticated && showAsButton) {
    return null;
  }

  // Se está carregando, mostra loader
  if (loading || signing || networkLoading) {
    return (
      <div className="flex items-center gap-2">
        <Loader2 className="h-4 w-4 animate-spin text-secondary" />
        <span className="text-sm text-primary/70 dark:text-white/70">
          {loading ? t('app:loading.general') : signing ? t('app:loading.signature') : networkLoading ? t('app:loading.network') : ''}
        </span>
      </div>
    );
  }

  // Se usado como botão no header
  if (showAsButton) {
    return (
      <button
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          handleConnectWallet();
        }}
        disabled={loading || signing || networkLoading}
        className="bg-primary text-black px-4 py-2 rounded-md flex items-center gap-2 hover:bg-primary/90 disabled:opacity-50"
      >
        <Wallet size={16} />
        {t('app:welcome.connectButton')}
      </button>
    );
  }

  // Caso contrário, retorna null
  return null;
} 