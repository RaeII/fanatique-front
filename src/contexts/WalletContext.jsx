import { useState, useEffect, useCallback } from 'react';
import { ethers } from 'ethers';
import api from '../lib/api';
import { showError, showSuccess, showInfo } from '../lib/toast';
import { WalletContext } from './WalletContextDef';
import cardSystem from '../utils/cardSystem';


// Dados da rede Chiliz
const NETWORK_ID_CHILIZ = import.meta.env.VITE_NETWORK_ID_CHILIZ;
const CHAIN_NAME = import.meta.env.VITE_CHAIN_NAME;
const RPC_URL = import.meta.env.VITE_RPC_URL;
const SYMBOL = import.meta.env.VITE_SYMBOL;
const BLOCK_EXPLORER_URL = import.meta.env.VITE_BLOCK_EXPLORER_URL;

// Helper para adicionar delay entre requisições
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// Controle de tentativas para evitar spam
const NETWORK_CHECK_COOLDOWN = 2000; // 2 segundos entre verificações de rede
let lastNetworkCheck = 0;

// Função auxiliar para verificar e trocar para a rede Chiliz
const verifyAndSwitchNetwork = async () => {
  try {
    if (!window.ethereum) return { success: false, message: 'MetaMask not found' };
    
    // Verifica a rede atual
    const currentChainId = await window.ethereum.request({ method: 'eth_chainId' });
    const formattedChilizChainId = formatChainId(NETWORK_ID_CHILIZ);
    
    if (currentChainId === formattedChilizChainId) {
      return { success: true, message: 'Already on Chiliz network' };
    }
    
    // Tenta trocar para a rede Chiliz
    try {
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: formattedChilizChainId }],
      });
      return { success: true, message: 'Network switched successfully' };
    } catch (switchError) {
      // Rede não adicionada, tenta adicionar
      if (switchError.code === 4902) {
        try {
          await window.ethereum.request({
            method: 'wallet_addEthereumChain',
            params: [networkData]
          });
          return { success: true, message: 'Chiliz network added successfully' };
        } catch (addError) {
          if (addError.code === 4001) {
            return { success: false, message: 'User rejected adding Chiliz network' };
          }
          return { success: false, message: 'Error adding Chiliz network', error: addError };
        }
      } else if (switchError.code === 4001) {
        return { success: false, message: 'User rejected network switch' };
      }
      return { success: false, message: 'Error switching to Chiliz network', error: switchError };
    }
  } catch (error) {
    console.error('Erro ao verificar/trocar rede:', error);
    return { success: false, message: 'Error verifying/switching network', error };
  }
};

// Garantir que o chainId está no formato correto (0x prefixado)
const formatChainId = (chainId) => {
  // Se já é uma string hexadecimal com prefixo 0x, retorna como está
  if (typeof chainId === 'string' && chainId.startsWith('0x')) {
    return chainId;
  }
  
  // Se é um número ou string sem 0x, converte para inteiro e depois para hexadecimal com prefixo 0x
  try {
    const chainIdInt = parseInt(chainId, 10);
    return `0x${chainIdInt.toString(16)}`;
  } catch (e) {
    console.error('Erro ao formatar chainId:', e);
    return chainId; // Retorna o original em caso de erro
  }
};

const networkData = {
  chainId: formatChainId(NETWORK_ID_CHILIZ),
  chainName: CHAIN_NAME,
  rpcUrls: [RPC_URL],
  nativeCurrency: {
    name: SYMBOL,
    symbol: SYMBOL,
    decimals: 18
  }
};

if(BLOCK_EXPLORER_URL) networkData.blockExplorerUrls = [BLOCK_EXPLORER_URL];

// Provider que envolverá a aplicação
export function WalletProvider({ children }) {
  // Estados para gerenciar a carteira
  const [address, setAddress] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);
  const [token, setToken] = useState(null);
  const [signing, setSigning] = useState(false);
  const [connecting, setConnecting] = useState(false);
  const [provider, setProvider] = useState(null);
  const [signer, setSigner] = useState(null);
  const [isChilizNetwork, setIsChilizNetwork] = useState(false);
  const [showTreasureChest, setShowTreasureChest] = useState(false);
  const [welcomeCards, setWelcomeCards] = useState([]);

  // Verifica se o MetaMask está disponível
  const checkIfMetaMaskAvailable = useCallback(() => {
    return window.ethereum && window.ethereum.isMetaMask;
  }, []);
  
  // Verifica a rede conectada
  const checkNetwork = useCallback(async () => {
    if (!window.ethereum) return false;
    
    try {
      // Verifica se passou tempo suficiente desde a última verificação
      const now = Date.now();
      if (now - lastNetworkCheck < NETWORK_CHECK_COOLDOWN) {
        // Se a última verificação foi recente, espera um pouco
        await delay(NETWORK_CHECK_COOLDOWN);
      }
      
      // Atualiza o timestamp da última verificação
      lastNetworkCheck = Date.now();
      
      const currentChainId = await window.ethereum.request({ method: 'eth_chainId' });
      const formattedChilizChainId = formatChainId(NETWORK_ID_CHILIZ);
            
      if (currentChainId !== formattedChilizChainId) {
        setIsChilizNetwork(false);
        return false;
      } else {
        setIsChilizNetwork(true);
        return true;
      }
    } catch (error) {
      console.error("Erro ao verificar rede:", error);
      setIsChilizNetwork(false);
      return false;
    }
  }, []);
  
  // Troca para a rede Chiliz
  const switchNetwork = useCallback(async () => {
    try {
      // Adiciona um delay antes de solicitar a troca de rede
      await delay(1000);
      
      const formattedChilizChainId = formatChainId(NETWORK_ID_CHILIZ);
      
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: formattedChilizChainId }],
      });
      
      // Atualiza o timestamp da última verificação
      lastNetworkCheck = Date.now();
      
      // Aguarda um momento para que a mudança seja processada
      await delay(1000);
      
      setIsChilizNetwork(true);
      return true;
    } catch (error) {
      if (error.code === 4902) {
        // Rede não adicionada, tenta adicionar
        return false;
      }
      if (error.code === 4001) {
        showError('You need to switch to Chiliz network to continue');
        return false;
      }
      if (error.code === 4100) {
        showError('Too many requests to MetaMask. Please wait a few seconds and try again.');
        return false;
      }
      console.error("Erro ao trocar de rede:", error);
      return false;
    }
  }, []);
  
  // Adiciona a rede Chiliz
  const addNetwork = useCallback(async () => {
    try {
      // Adiciona um delay antes de solicitar a adição de rede
      await delay(1500);
      
      await window.ethereum.request({
        method: 'wallet_addEthereumChain',
        params: [networkData]
      });
      
      // Aguarda um momento para garantir que a rede foi adicionada
      await delay(1500);
      
      const switched = await switchNetwork();
      if (switched) {
        showSuccess("Chiliz network connected successfully!");
        setIsChilizNetwork(true);
        return true;
      }
      
      return false;
    } catch (error) {
      if (error.code === 4001) {
        showError('You need to add Chiliz network to continue');
      } else if (error.code === 4100) {
        showError('Too many requests to MetaMask. Please wait a few seconds and try again.');
      } else {
        showError('Error adding Chiliz network. Please try again.');
        console.error("Erro ao adicionar rede:", error);
      }
      return false;
    }
  }, [switchNetwork]);
  
  // Garante que estamos na rede Chiliz
  const ensureChilizNetwork = useCallback(async () => {
    try {
      // Primeiro apenas verifica se já estamos na rede correta
      const isCorrectNetwork = await checkNetwork();
      if (isCorrectNetwork) {
        return true;
      }
      
      // Se não estamos na rede correta, aguarde um momento antes de continuar
      await delay(1000);
      
      // Tenta trocar para a rede Chiliz
      const switched = await switchNetwork();
      if (!switched) {
        // Se não conseguiu trocar, aguarde um momento antes de tentar adicionar
        await delay(1000);
        
        // Se não conseguiu trocar, tenta adicionar a rede
        return await addNetwork();
      }
      return switched;
    } catch (error) {
      if (error.code === 4100) {
        // Se for erro de spam, aguarde mais tempo e tente novamente
        await delay(3000);
        showInfo('Waiting to avoid MetaMask blocking...');
        try {
          return await checkNetwork();
        } catch (e) {
          console.error('Erro persistente ao verificar rede:', e);
          return false;
        }
      }
      
      return false;
    }
  }, [checkNetwork, switchNetwork, addNetwork]);
  
  // Obtém um signer para transações
  const getSigner = useCallback(async () => {
    try {
      if (!provider) {
        return null;
      }
      
      if (!isConnected) {
        return null;
      }
      
      // Verifica se já temos um signer válido antes de solicitar um novo
      if (signer) {
        return signer;
      }
      
      const ethSigner = await provider.getSigner();
      setSigner(ethSigner);
      return ethSigner;
    } catch (error) {
      console.error('Erro ao obter signer:', error);
      return null;
    }
  }, [provider, isConnected, signer]);
  
  // Limpa as credenciais
  const clearAuthCredentials = useCallback(() => {
    try {
      localStorage.removeItem('auth_token');
      localStorage.removeItem('wallet_address');
      setToken(null);
      setIsAuthenticated(false);
      return true;
    } catch (error) {
      console.error('WalletContext: Erro ao remover credenciais', error);
      return false;
    }
  }, []);
  
  // Função para lidar com a mudança de contas no MetaMask
  const handleAccountsChanged = useCallback((accounts) => {
    if (accounts.length === 0) {
      // Usuário desconectou conta
      clearAuthCredentials();
      setIsConnected(false);
      setAddress(null);
      setSigner(null);
    } else if (accounts[0] !== address) {
      // Usuário trocou de conta
      clearAuthCredentials();
      setAddress(accounts[0]);
      setIsConnected(true);
      
      // Atualiza o signer com o novo endereço
      getSigner().catch(console.error);
    }
  }, [address, clearAuthCredentials, getSigner]);
  
  // Função para lidar com a desconexão do MetaMask
  const handleDisconnect = useCallback(() => {
    clearAuthCredentials();
    setIsConnected(false);
    setAddress(null);
    setSigner(null);
  }, [clearAuthCredentials]);
  
  // Função para lidar com a mudança de rede
  const handleChainChanged = useCallback((chainId) => {
    const formattedChilizChainId = formatChainId(NETWORK_ID_CHILIZ);
    
    if (chainId !== formattedChilizChainId) {
      setIsChilizNetwork(false);
      showError("Switch to Chiliz Spicy network to continue using the app");
      
      // Adiciona um pequeno delay antes de solicitar a troca de rede
      setTimeout(async () => {
        // Utiliza a função auxiliar para verificar e trocar de rede
        const result = await verifyAndSwitchNetwork();
        
        if (!result.success) {
          console.error('Falha ao trocar para rede Chiliz:', result.message);
          // Se a troca falhou por um motivo que não seja usuário recusou, tenta adicionar a rede
          if (result.error && result.error.code !== 4001) {
            showInfo('Try adding Chiliz network manually in your wallet');
          }
        } else {
          setIsChilizNetwork(true);
          showSuccess("Chiliz network connected successfully!");
        }
      }, 1500);
    } else {
      setIsChilizNetwork(true);
    }
  }, []);
  
  // Verifica o estado de autenticação e restaura se necessário
  useEffect(() => {
    const checkAuth = async () => {
      try {
        // Inicializa o provider independente de autenticação
        if (!provider && window.ethereum) {
          try {
            const ethersProvider = new ethers.BrowserProvider(window.ethereum);
            setProvider(ethersProvider);
          } catch (providerError) {
            console.error('Erro ao inicializar provider:', providerError);
            // Continua mesmo com erro no provider
          }
        }
        
        // Verifica se há dados armazenados
        const savedToken = localStorage.getItem('auth_token');
        const savedWallet = localStorage.getItem('wallet_address');
        
        if (savedToken && savedWallet) {
          // Atualiza o estado
          setToken(savedToken);
          setAddress(savedWallet);
          setIsAuthenticated(true);
          setIsConnected(true);
          
          // Obter o signer após restaurar o estado da carteira
          await getSigner();
          
          // Verifica a rede atual
          await checkNetwork();
          
          // SEMPRE verifica se o usuário tem cartas no cache local
          // Se não tiver (cache limpo, novo dispositivo, etc), gera novas cartas
          try {
            const userCardsResult = cardSystem.ensureUserHasCards(savedWallet);
            if (userCardsResult && userCardsResult.cards && userCardsResult.cards.length > 0) {
              
              // Se são cartas novas (cache limpo/novo dispositivo), mostra o modal
              if (userCardsResult.isNewCards) {
                console.log('Novas cartas geradas para usuário existente - mostrando modal');
                // Armazena as cartas e mostra o baú
                setWelcomeCards(userCardsResult.cards);
                setShowTreasureChest(true);
                
                // Ainda dispara o evento para compatibilidade
                window.dispatchEvent(new CustomEvent('showWelcomeCards', { 
                  detail: { cards: userCardsResult.cards } 
                }));
              }
            }
          } catch (error) {
            console.error('Erro ao verificar cartas na autenticação:', error);
          }
        } else {
          setIsAuthenticated(false);
        }
        
        setIsInitialized(true);
      } catch (error) {
        console.error('Erro ao verificar autenticação:', error);
        setIsInitialized(true);
      }
    };
    
    // Só executa a verificação de autenticação se o window.ethereum estiver disponível
    if (window.ethereum) {
      checkAuth();
      
      // Adicionar listeners para eventos do MetaMask
      window.ethereum.on('accountsChanged', handleAccountsChanged);
      window.ethereum.on('chainChanged', handleChainChanged);
      window.ethereum.on('disconnect', handleDisconnect);
      
      // Define o limite máximo de listeners para evitar avisos
      if (window.ethereum.setMaxListeners) {
        window.ethereum.setMaxListeners(100);
      }
    } else {
      setIsInitialized(true);
    }
    
    return () => {
      // Remover listeners ao desmontar o componente
      if (window.ethereum) {
        window.ethereum.removeListener('accountsChanged', handleAccountsChanged);
        window.ethereum.removeListener('chainChanged', handleChainChanged);
        window.ethereum.removeListener('disconnect', handleDisconnect);
      }
    };
  }, [handleAccountsChanged, handleDisconnect, provider, getSigner, handleChainChanged, checkNetwork]);
  
  // Função para conectar a carteira
  const connectWallet = useCallback(async () => { 

    console.log("\n\n WalletContext connectWallet", connecting,"\n\n");

    if (connecting) {
      return false;
    }
    
    if (!window.ethereum) {
      console.error("MetaMask não está instalado");
      showError('MetaMask is not installed. Please install MetaMask extension to continue.');
      window.open('https://metamask.io/download/', '_blank', 'noopener,noreferrer');
      return false;
    }
    
    try {
      setConnecting(true);
      
      // Inicializa o provider se necessário
      if (!provider) {
        try {
          const ethersProvider = new ethers.BrowserProvider(window.ethereum);
          setProvider(ethersProvider);
        } catch (providerError) {
          console.error("Erro ao inicializar provider:", providerError);
          throw providerError;
        }
      }
      
      // Adiciona um pequeno delay antes de solicitar contas
      await delay(500);
      
      // Solicita acesso às contas do MetaMask
      let accounts;
      try {
        accounts = await window.ethereum.request({ 
          method: 'eth_requestAccounts' 
        });

      } catch (accountError) {

        if (accountError.code === 4001) {
          // Usuário recusou a conexão
          showError('You refused the wallet connection');
        } else if (accountError.code === 4100) {
          // Erro de spam filter
          showError('Too many requests to MetaMask. Please wait a few seconds and try again.');
        } else {
          showError('Error connecting to wallet: ' + (accountError.message || 'Unknown error'));
        }
        setConnecting(false);
        return false;
      }
            
      if (!accounts || accounts.length === 0) {
        showError('No account found. Please check MetaMask.');
        setConnecting(false);
        return false;
      }

      console.log("\n\n WalletContext accounts[0]", accounts[0],"\n\n");
      
      // Importante: Atualizar o endereço ANTES de qualquer outra operação
      setAddress(accounts[0]);
      setIsConnected(true);
      
      // Forçar a atualização do estado imediatamente
      await delay(100);
      
      // Verificar se o endereço foi realmente atualizado
      if (!address) {
        // Tenta forçar a atualização do estado novamente
        setAddress(accounts[0]);
        await delay(200);
      }
      
      // Obter o signer após conectar a carteira
      await getSigner();
      
      // Verifica e troca para a rede Chiliz automaticamente
      await delay(500);
      
      // Verifica se está na rede Chiliz
      const networkResult = await verifyAndSwitchNetwork();
      if (networkResult.success) {
        setIsChilizNetwork(true);
        if (networkResult.message !== 'Already on Chiliz network') {
          showSuccess("Chiliz network connected successfully!");
        }
      } else {
        setIsChilizNetwork(false);
        showError(networkResult.message || "Failed to connect to Chiliz network. Try switching manually.");
      }
      
      return true;
    } catch (err) {
      console.error("Erro detalhado ao conectar carteira:", err);
      
      if (err.code === 4100) {
        showError('Too many requests to MetaMask. Please wait a few seconds and try again.');
      } else {
        showError('Error connecting to wallet: ' + (err.message || 'Unknown error'));
      }
      
      return false;
    } finally {
      setConnecting(false);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [provider, getSigner]);
  
  // Função para desconectar a carteira
  const disconnectWallet = useCallback(async () => {
    try {
      // No caso da MetaMask, não é possível desconectar programaticamente
      // Apenas limpamos nossa autenticação interna
      clearAuthCredentials();
      
      // Limpa todos os estados relacionados à carteira
      setIsConnected(false);
      setIsAuthenticated(false);
      setToken(null);
      
      // Adiciona um pequeno delay antes de limpar o endereço e o signer
      // para garantir que os componentes que dependem desses valores sejam atualizados corretamente
      await delay(100);
      
      setAddress(null);
      setSigner(null);
      
      return true;
    } catch (err) {
      console.error('Erro ao desconectar carteira:', err);
      // Mesmo com erro, tenta limpar credenciais
      clearAuthCredentials();
      setIsConnected(false);
      setIsAuthenticated(false);
      setAddress(null);
      setSigner(null);
      return false;
    }
  }, [clearAuthCredentials]);
  
  // Função para armazenar credenciais
  const setAuthCredentials = useCallback((newToken, walletAddress) => {
    if (newToken && walletAddress) {
      try {
        // Salva no localStorage
        localStorage.setItem('auth_token', newToken);
        localStorage.setItem('wallet_address', walletAddress);
        
        // Atualiza o estado
        setToken(newToken);
        setIsAuthenticated(true);
        
        return true;
      } catch (error) {
        console.error('WalletContext: Erro ao salvar credenciais', error);
        return false;
      }
    }
    return false;
  }, []);
  
  // Função para assinar mensagem
  const requestSignature = useCallback(async (walletAddress = null) => {
    // Usa o endereço fornecido ou o endereço do estado
    const addressToUse = walletAddress || address;
    
    if (!addressToUse) {
      console.log('WalletContext: requestSignature - Nenhum endereço disponível', address, walletAddress);
      showError('Connect your wallet first');
      return false;
    }
    
    if (!checkIfMetaMaskAvailable()) {
      showError('MetaMask is not installed');
      return false;
    }
    
    // Verifica se já está assinando e evita solicitações duplicadas
    if (signing) {
      return { inProgress: true };
    }
    
    try {
      // Define o estado de assinatura como true no início
      setSigning(true);
      
      // Verifica se a rede está correta ANTES de solicitar a assinatura
      // Verifica e troca para a rede Chiliz automaticamente
      const networkResult = await verifyAndSwitchNetwork();
      if (!networkResult.success) {
        showError(networkResult.message || 'Could not connect to Chiliz network. Try switching manually.');
        setSigning(false);
        return false;
      }
      
      // Atualiza o estado da rede
      setIsChilizNetwork(true);
      
      // Adiciona um pequeno delay antes de solicitar assinatura
      await delay(1000);
      
      // Mensagem para assinatura - usando um formato padrão para evitar assinaturas múltiplas
      const mensagem = `Validação de carteira no Fanatique: ${addressToUse}`;
      
      // Solicita assinatura ao usuário
      showInfo('Please sign the message to enter the platform');
      
      // Solicita assinatura usando MetaMask diretamente
      let signature;
      try {
        signature = await window.ethereum.request({
          method: 'personal_sign',
          params: [mensagem, addressToUse]
        });
      } catch (signError) {
        console.error('Erro específico na assinatura:', signError);
        
        // Cancelamento pelo usuário
        if (signError.code === 4001) {
          showError('Signature cancelled by user. Signing is required to enter the platform.');
          return { cancelled: true, success: false };
        } else if (signError.code === 4100) {
          showError('Too many requests to MetaMask. Please wait a few seconds and try again.');
          return { spamBlocked: true, success: false };
        } else {
          showError('Failed to request signature. Try again later.');
        }
        
        return false;
      } finally {
        // Se chegou aqui com erro, já define signing como false
        if (!signature) {
          setSigning(false);
        }
      }
      
      // Adiciona um pequeno delay antes de enviar a assinatura para o backend
      await delay(500);
      
      // Envia a assinatura para o backend para validação
      const response = await api.post('/wallet/signature', {
        address: addressToUse,
        message: mensagem,
        signature
      });

      console.log("\n\n new user", response.data.content.new_user,"\n\n");
      
      // Verifica se a validação foi bem-sucedida
      if (response.data.content && response.data.content.success) {
        const { token: newToken, new_user } = response.data.content;
        
        if (newToken) {
          setAuthCredentials(newToken, addressToUse);
          
          // SEMPRE verifica se o usuário tem cartas no cache local
          // Se não tiver (cache limpo, novo dispositivo, etc), gera novas cartas
          try {
            console.log("\n\n Verificando cartas do usuário...\n\n");

            const userCardsResult = cardSystem.ensureUserHasCards(addressToUse);
            if (userCardsResult && userCardsResult.cards && userCardsResult.cards.length > 0) {
              console.log('Cartas do usuário garantidas:', userCardsResult.cards);
              
              // Se é um novo usuário OU se acabou de receber novas cartas, mostra o modal
              if (new_user === true || userCardsResult.isNewCards) {
                console.log("\n\n MOSTRANDO BAÚ DO TESOURO PARA NOVO USUÁRIO! \n\n");
                // Armazena as cartas e mostra o baú
                setWelcomeCards(userCardsResult.cards);
                setShowTreasureChest(true);
                
                // Ainda dispara o evento para compatibilidade
                window.dispatchEvent(new CustomEvent('showWelcomeCards', { 
                  detail: { cards: userCardsResult.cards } 
                }));
              }
            }
          } catch (error) {
            console.error('Erro ao processar cartas do usuário:', error);
          }
          
          showSuccess('Login successful!');
          return true;
        } else {
          showError('Authentication failed: Token not received');
          return false;
        }
      } else {
        showError('Validation failed: ' + (response.data.message || 'Unknown error'));
        return false;
      }
    } catch (err) {
      console.error('Erro ao validar carteira:', err);
      
      if (err.code === 4001) {
        showError('Signature cancelled by user. Signing is required to enter the platform.');
        return { cancelled: true, success: false };
      } else if (err.code === 4100) {
        showError('Too many requests to MetaMask. Please wait a few seconds and try again.');
        return { spamBlocked: true, success: false };
      } else {
        showError('Login failed: ' + (err.message || 'Unknown error'));
      }
      
      return false;
    } finally {
      // Sempre define signing como false ao finalizar
      setSigning(false);
    }
  }, [address, setAuthCredentials, checkIfMetaMaskAvailable, signing]);
  
  // Registrar com assinatura
  const registerWithSignature = useCallback(async (walletAddress = null) => {
    // Usa o endereço fornecido ou o endereço do estado
    const addressToUse = walletAddress || address;
    
    if (!addressToUse) {
      console.log("\n\n WalletContext registerWithSignature address", address, walletAddress, "\n\n");
      showError('No wallet connected');
      return false;
    }
    
    // A verificação de rede é feita dentro da função requestSignature
    // Não precisamos fazer essa verificação aqui novamente
    
    return await requestSignature(addressToUse);
  }, [address, requestSignature]);
  
  // Verifica se a carteira já está cadastrada
  const checkWalletExists = useCallback(async (walletAddress = null) => {
    try {
      // Usa o endereço fornecido ou o endereço do estado
      const addressToCheck = walletAddress || address;
      
      console.log("\n\n WalletContext checkWalletExists - Verificando endereço:", addressToCheck, "\n\n");
      
      if (!addressToCheck) {
        console.log("\n\n WalletContext checkWalletExists - Nenhum endereço disponível", address, walletAddress, "\n\n");
        return { success: false, exists: false, message: 'No wallet connected' };
      }
      
      const response = await api.get(`/wallet/check/${addressToCheck}`);
      return response.data;
    } catch (error) {
      console.error('Erro ao verificar existência da carteira:', error);
      return { 
        success: false, 
        exists: false, 
        message: error.response?.data?.message || 'Error checking wallet' 
      };
    }
  }, [address]);
  
  // Obter dados do usuário
  const getUserData = useCallback(async () => {
    if (!isAuthenticated || !token) {
      return null;
    }

    try {
      const response = await api.get('/user');
      if (response.data && response.data.success) {
        return response.data.content;
      }
      return null;
    } catch (error) {
      console.error('Erro ao obter dados do usuário:', error);
      
      // Se o token expirou ou é inválido, limpa os dados de autenticação
      if (error.response && error.response.status === 401) {
        clearAuthCredentials();
      }
      
      return null;
    }
  }, [isAuthenticated, token, clearAuthCredentials]);
  
  // Método auxiliar para garantir que a conta esteja disponível
  const ensureAccountAvailable = useCallback(async (maxAttempts = 5, delayMs = 500) => {
    if (address) return address;
    
    console.log('WalletContext: Aguardando endereço da carteira ser atualizado...');
    let attempts = 0;
    
    while (!address && attempts < maxAttempts) {
      await delay(delayMs);
      attempts++;
      console.log(`WalletContext: Tentativa ${attempts} de obter endereço da carteira`);
      
      // Tenta obter as contas novamente
      if (window.ethereum) {
        try {
          const accounts = await window.ethereum.request({ method: "eth_accounts" });
          if (accounts && accounts.length > 0) {
            setAddress(accounts[0]);
            return accounts[0];
          }
        } catch (error) {
          console.error('Erro ao obter contas:', error);
        }
      }
    }
    
    return address;
  }, [address]);
  
  // Conectar e verificar registro em uma única operação
  const connectAndCheckRegistration = useCallback(async () => {
    try {
      // Verifica se já está conectando
      if (connecting) {
        return { success: false, message: 'Connection already in progress. Please wait.' };
      }
      
      // Primeiro apenas conecta a carteira
      const connected = await connectWallet();
      
      if (!connected || !address) {
        return { success: false, message: 'Failed to connect wallet' };
      }
      
      // Se já está autenticado, retorna sucesso
      if (isAuthenticated) {
        return { success: true, needsRegistration: false, isAuthenticated: true };
      }
      
      // Verifica e troca para a rede Chiliz automaticamente
      await delay(1000);
      const networkResult = await verifyAndSwitchNetwork();
      
      if (!networkResult.success) {
        return { 
          success: false, 
          needsNetworkChange: true,
          message: networkResult.message || 'Failed to connect to Chiliz network'
        };
      }
      
      // Atualiza o estado da rede
      setIsChilizNetwork(true);
      
      // Verifica se a carteira já está cadastrada
      // Primeiro, garantir que temos um endereço válido
      if (!address) {
        // Tenta obter o endereço novamente
        try {
          const accounts = await window.ethereum.request({ method: "eth_accounts" });
          if (accounts && accounts.length > 0) {
            setAddress(accounts[0]);
            await delay(100); // Pequeno delay para atualização do estado
          }
        } catch (error) {
          console.error('Erro ao obter contas:', error);
        }
      }
      
      // Usa o endereço atual ou tenta novamente
      const currentAddress = address || (await ensureAccountAvailable(3, 500));
      console.log('connectAndCheckRegistration - Endereço para verificação:', currentAddress);
      
      const walletCheck = await checkWalletExists(currentAddress);
      
      if (!walletCheck.success) {
        return { success: false, message: walletCheck.message || 'Error checking registration' };
      }
      
      // Retorna o resultado da verificação
      return { 
        success: true, 
        needsRegistration: !walletCheck.exists, 
        isAuthenticated: false
      };
    } catch (error) {
      console.error('Erro ao conectar e verificar registro:', error);
      
      // Tratamento específico para o erro de solicitação em processamento
      if (error.code === -32002) {
        return { 
          success: false, 
          message: 'Connection request already in progress. Please wait.'
        };
      }
      
      return { 
        success: false, 
        message: error.message || 'Error connecting and checking registration'
      };
    }
  }, [connectWallet, address, isAuthenticated, checkWalletExists, connecting, ensureAccountAvailable]);

  const checkIfWalletIsConnected = useCallback(async () => {
    try {
      const { ethereum } = window;
      if (!ethereum) return false;

      const accounts = await ethereum.request({ method: "eth_accounts" });
      if (accounts.length !== 0) {
        setAddress(accounts[0]);
        await checkNetwork();
        return true;
      }
      return false;
    } catch (error) {
      console.error("Erro ao verificar conexão da carteira:", error);
      return false;
    }
  }, [checkNetwork]);

  useEffect(() => {
    checkIfWalletIsConnected();

  }, [checkIfWalletIsConnected]);
  
  // Define os valores compartilhados
  const contextValue = {
    account: address,
    isConnected,
    isAuthenticated,
    isInitialized,
    token,
    signing,
    connecting,
    provider,
    signer,
    isChilizNetwork,
    showTreasureChest,
    welcomeCards,
    setShowTreasureChest,
    BLOCK_EXPLORER_URL,
    connectWallet,
    disconnectWallet,
    requestSignature,
    registerWithSignature,
    checkWalletExists,
    getUserData,
    setAuthCredentials,
    clearAuthCredentials,
    connectAndCheckRegistration,
    getSigner,
    checkNetwork,
    switchNetwork,
    addNetwork,
    ensureChilizNetwork,
    verifyAndSwitchNetwork,
    ensureAccountAvailable,
  };
  
  return (
    <WalletContext.Provider value={contextValue}>
      {children}
    </WalletContext.Provider>
  );
} 