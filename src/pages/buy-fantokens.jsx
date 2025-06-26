import { useState, useEffect, useContext } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Volleyball as Football, ArrowLeft, Search, BanknoteArrowUp, X, ChevronRight, History, HandCoins, Loader2, Receipt, ExternalLink, Coins } from 'lucide-react';
import { Button } from '../components/ui/button';
import clubApi from '../api/club';
import contractApi from '../api/contract';
import transactionApi from '../api/transaction';
import toast from 'react-hot-toast';
import { WalletContext } from '../contexts/WalletContextDef';
import { useTranslation } from 'react-i18next';

export default function BuyFantokensPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { account, isConnected, connectWallet, BLOCK_EXPLORER_URL } = useContext(WalletContext);
  const { t } = useTranslation(['tokens', 'common']);
  
  // Obter os parâmetros da URL
  const queryParams = new URLSearchParams(location.search);
  const tokenTypeParam = queryParams.get('type');
  const tabParam = queryParams.get('tab');
  
  // Estados do componente
  const [loading, setLoading] = useState(false);
  const [clubs, setClubs] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedClub, setSelectedClub] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const [showQRCode, setShowQRCode] = useState(false);
  const [processingPayment, setProcessingPayment] = useState(false);
  const [walletTokens, setWalletTokens] = useState([]);
  const [stablecoins, setStablecoins] = useState([]);
  const [loadingStablecoins, setLoadingStablecoins] = useState(false);
  const [activeTab, setActiveTab] = useState(tabParam || 'comprar'); // 'comprar', 'historico', ou 'stake'
  const [transactions, setTransactions] = useState([]);
  const [loadingTransactions, setLoadingTransactions] = useState(false);
  const [activeTokenType, setActiveTokenType] = useState(tokenTypeParam || 'fantoken');

  // Função auxiliar para buscar stablecoins
  const fetchStablecoins = async () => {
    if (!account) return;
    
    try {
      setLoadingStablecoins(true);
      const stablecoinsData = await contractApi.getStablecoinBalances(account);
      setStablecoins(stablecoinsData);
    } catch (error) {
      console.error('Erro ao buscar stablecoins:', error);
      toast.error(t('tokens:messages.loadStablecoinsError'));
    } finally {
      setLoadingStablecoins(false);
    }
  };

  // Verificar se o usuário está autenticado
  useEffect(() => {
    const checkWalletConnection = async () => {
      if (!isConnected) {
        try {
          const connected = await connectWallet();
          if (!connected) {
            navigate('/');
          }
        } catch (error) {
          console.error('Erro ao conectar carteira:', error);
          navigate('/');
        }
      }
    };
    
    checkWalletConnection();
  }, [isConnected, connectWallet, navigate]);
  
  // Buscar tokens da carteira
  useEffect(() => {
    const fetchWalletTokens = async () => {
      if (account) {
        try {
          const tokens = await contractApi.getWalletTokens(account);
          setWalletTokens(tokens);
        } catch (error) {
          console.error('Erro ao buscar tokens da carteira:', error);
          // Não mostramos toast de erro aqui para não atrapalhar a experiência do usuário
        }
      }
    };

    fetchWalletTokens();
  }, [account]);
  
  // Buscar stablecoins quando mudar o tipo de token ativo
  useEffect(() => {
    const fetchStablecoins = async () => {
      if (account && activeTokenType === 'stablecoin') {
        try {
          setLoadingStablecoins(true);
          const stablecoinsData = await contractApi.getStablecoinBalances(account);
          setStablecoins(stablecoinsData);
        } catch (error) {
          console.error('Erro ao buscar stablecoins:', error);
          toast.error(t('tokens:messages.loadStablecoinsError'));
        } finally {
          setLoadingStablecoins(false);
        }
      }
    };

    fetchStablecoins();
  }, [account, activeTokenType]);

  // Get clubs
  useEffect(() => {
    const fetchClubs = async () => {
      try {
        setLoading(true);
        const clubs = await clubApi.getClubs();
        setClubs(clubs);
      } catch (error) {
        console.error('Erro ao buscar clubes:', error);
        toast.error(t('tokens:messages.loadClubsError'));
      } finally {
        setLoading(false);
      }
    };

    fetchClubs();
  }, []);

  // Buscar transações quando a tab estiver ativa
  useEffect(() => {
    const loadTransactions = async () => {
      if (activeTab === 'historico' && account) {
        try {
          setLoadingTransactions(true);
          const data = await transactionApi.getUserTransactions();
          setTransactions(data);
        } catch (error) {
          console.error('Erro ao buscar transações:', error);
          toast.error(t('tokens:messages.loadTransactionsError'));
        } finally {
          setLoadingTransactions(false);
        }
      }
    };
    
    loadTransactions();
  }, [activeTab, account, activeTokenType]);

  // Função para obter o saldo de tokens de um clube específico
  const getClubTokenBalance = (clubId) => {
    const token = walletTokens.find(token => token.club_id === clubId.toString());
    return token ? parseFloat(token.balance) : 0;
  };

  const handleSelectClub = (club) => {
    setSelectedClub(club);
    setShowModal(true);
  };

  // Função para selecionar stablecoin
  const handleSelectStablecoin = (coin) => {
    setSelectedClub({
      id: coin.id,
      name: coin.name,
      symbol: coin.symbol,
      image: coin.image,
      isStablecoin: true
    });
    setShowModal(true);
  };

  const handleBuyTokens = async () => {
    if (!isConnected || !account) {
      toast.error(t('tokens:messages.connectWallet'));
      try {
        await connectWallet();
      } catch (error) {
        console.error('Erro ao conectar carteira:', error);
      }
      return;
    }
    setShowQRCode(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setShowQRCode(false);
    setQuantity(1);
  };

  const closeQRCode = async () => {
    try {
      setProcessingPayment(true);
      
      // Obtém o endereço da carteira do usuário do contexto
      if (!account) {
        toast.error(t('tokens:messages.connectWalletError'));
        return;
      }
      
      if (selectedClub.isStablecoin) {
        // Compra de stablecoin
        const transferData = {
          stablecoin_id: selectedClub.id,
          to: account,
          amount: quantity.toString()
        };
        
        // Chamar a API para transferir stablecoins
        await contractApi.transferStablecoins(transferData);
        
        // Atualizar stablecoins da carteira após a compra
        const stablecoinsData = await contractApi.getStablecoinBalances(account);
        setStablecoins(stablecoinsData);
        
        toast.success(t('tokens:messages.purchaseSuccess', { quantity, symbol: selectedClub.symbol }));
      } else {
        // Compra de fantoken
        const transferData = {
          club_id: selectedClub.id,
          to: account,
          amount: quantity
        };
        
        // Chamar a API para transferir tokens
        await contractApi.transferTokens(transferData);
        
        // Atualizar tokens da carteira após a compra
        const tokens = await contractApi.getWalletTokens(account);
        setWalletTokens(tokens);
        
        toast.success(t('tokens:messages.purchaseFanTokenSuccess', { quantity, name: selectedClub.name }));
      }
      
      // Atualizar transações
      if (activeTab === 'historico') {
        const data = await transactionApi.getUserTransactions();
        setTransactions(data);
      }
      
      setShowQRCode(false);
      setShowModal(false);
      setQuantity(1);
    } catch (error) {
      console.error('Erro ao processar pagamento:', error);
      toast.error(t('tokens:messages.paymentError'));
    } finally {
      setProcessingPayment(false);
    }
  };

  // Gerar QR Code aleatório
  const getRandomQRCode = () => {
    return `qr.png`;
  };

  // Filter clubs based on search term
  const filteredClubs = clubs.filter(club => 
    club.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Função para formatar hash da transação
  const formatHash = (hash) => {
    if (!hash) return '';
    return hash.length > 16 ? `${hash.substring(0, 8)}...${hash.substring(hash.length - 8)}` : hash;
  };

  // Função para alterar o tipo de token e atualizar a URL
  const handleTokenTypeChange = (type) => {
    setActiveTokenType(type);
    navigate(`/tokens?type=${type}`);
    
    // Atualizar dados com base no tipo de token selecionado
    if (type === 'stablecoin' && account) {
      fetchStablecoins();
    } else if (type === 'fantoken' && account) {
      const fetchWalletTokens = async () => {
        try {
          const tokens = await contractApi.getWalletTokens(account);
          setWalletTokens(tokens);
        } catch (error) {
          console.error('Erro ao buscar tokens da carteira:', error);
        }
      };
      fetchWalletTokens();
    }
    
    // Se estiver na tab de histórico, atualizar as transações
    if (activeTab === 'historico') {
      const loadTransactions = async () => {
        try {
          setLoadingTransactions(true);
          const data = await transactionApi.getUserTransactions();
          setTransactions(data);
        } catch (error) {
          console.error('Erro ao buscar transações:', error);
          toast.error(t('tokens:messages.loadTransactionsError'));
        } finally {
          setLoadingTransactions(false);
        }
      };
      loadTransactions();
    }
  };

  // Função para alterar a aba e atualizar a URL
  const handleTabChange = (tab) => {
    setActiveTab(tab);
    // Criar nova URL com o parâmetro tab
    const newSearchParams = new URLSearchParams(location.search);
    newSearchParams.set('tab', tab);
    navigate(`${location.pathname}?${newSearchParams.toString()}`, { replace: true });
  };

  // Garantir que ao mudar para a aba de stake, o tipo de token seja sempre fantoken
  useEffect(() => {
    if (activeTab === 'stake' && activeTokenType !== 'fantoken') {
      setActiveTokenType('fantoken');
    }
  }, [activeTab, activeTokenType]);

  if (loading && activeTab === 'comprar') {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-4rem)] bg-background">
        <div className="flex flex-col items-center">
          <Loader2 className="h-12 w-12 animate-spin text-secondary" />
          <p className="mt-4 text-white/70">{t('tokens:buyTokens.loading')}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-background">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center mb-8">
          <Button 
            variant="ghost" 
            size="icon"
            onClick={() => navigate('/')}
            className="mr-3 text-white/80 hover:text-white"
          >
            <ArrowLeft size={18} />
          </Button>
          <h1 className="text-2xl font-bold text-white">{t('tokens:buyTokens.title')}</h1>
        </div>

        {/* Navegação Principal */}
        <div className="flex justify-center mb-8">
          <div className="flex bg-background-overlay/50 backdrop-blur-sm rounded-xl border border-white/10 p-1">
            <button
            onClick={() => handleTabChange('comprar')}
              className={`flex items-center px-6 py-3 rounded-lg transition-all duration-300 ${
                activeTab === 'comprar'
                  ? 'bg-secondary text-black font-semibold'
                  : 'text-white/70 hover:text-white'
              }`}
            >
              <HandCoins size={18} className="mr-2" />
              {t('tokens:tabs.buy')}
            </button>
            <button
            onClick={() => handleTabChange('historico')}
              className={`flex items-center px-6 py-3 rounded-lg transition-all duration-300 ${
                activeTab === 'historico'
                  ? 'bg-secondary text-black font-semibold'
                  : 'text-white/70 hover:text-white'
              }`}
            >
              <History size={18} className="mr-2" />
              {t('tokens:tabs.history')}
            </button>
            <button
            onClick={() => handleTabChange('stake')}
              className={`flex items-center px-6 py-3 rounded-lg transition-all duration-300 ${
                activeTab === 'stake'
                  ? 'bg-secondary text-black font-semibold'
                  : 'text-white/70 hover:text-white'
              }`}
            >
              <BanknoteArrowUp size={18} className="mr-2" />
              {t('tokens:tabs.stake')}
            </button>
          </div>
        </div>

        {/* Seletor de Tipo de Token */}
        {activeTab !== 'stake' && (
          <div className="flex justify-center mb-8">
            <div className="flex bg-background-overlay/30 backdrop-blur-sm rounded-lg border border-white/10 p-1">
              <button
                onClick={() => handleTokenTypeChange('fantoken')}
                className={`px-6 py-2 rounded-md transition-all duration-300 ${
                activeTokenType === 'fantoken'
                    ? 'bg-white/10 text-white font-medium'
                    : 'text-white/60 hover:text-white'
              }`}
            >
              {t('tokens:tokenTypes.fantoken')}
              </button>
              <button
                onClick={() => handleTokenTypeChange('stablecoin')}
                className={`px-6 py-2 rounded-md transition-all duration-300 ${
                activeTokenType === 'stablecoin'
                    ? 'bg-white/10 text-white font-medium'
                    : 'text-white/60 hover:text-white'
              }`}
            >
              {t('tokens:tokenTypes.stablecoin')}
              </button>
            </div>
          </div>
        )}

        {/* Conteúdo das Tabs */}
        {activeTab === 'comprar' ? (
          <>
            {/* Barra de Busca */}
            <div className="relative mb-6 max-w-md mx-auto">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search size={18} className="text-white/50" />
              </div>
              <input
                type="text"
                placeholder={activeTokenType === 'fantoken' ? t('tokens:search.clubPlaceholder') : t('tokens:search.stablecoinPlaceholder')}
                className="w-full pl-10 pr-4 py-3 bg-black rounded-lg bg-background-overlay/50 backdrop-blur-sm border border-white/10 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-secondary focus:border-secondary"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            {/* Lista de Tokens */}
            {activeTokenType === 'fantoken' ? (
              <div className="space-y-3 max-w-2xl mx-auto">
                {filteredClubs.map(club => (
                  <div 
                    key={club.id}
                    onClick={() => handleSelectClub(club)}
                    className="bg-background-overlay/50 backdrop-blur-sm border border-white/10 rounded-xl p-4 cursor-pointer hover:bg-background-overlay/70 transition-all duration-300 hover:scale-[1.02]"
                  >
                    <div className="flex items-center justify-between">
                    <div className="flex items-center">
                        <div className="w-12 h-12 rounded-full bg-white/10 overflow-hidden mr-4 flex-shrink-0">
                        {club.image ? (
                          <img 
                            src={club.image} 
                            alt={club.name} 
                            className="w-full h-full object-cover" 
                          />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <Football size={24} className="text-white/50" />
                          </div>
                        )}
                      </div>
                      <div>
                          <p className="font-semibold text-white">{club.symbol}</p>
                          <p className="text-sm text-white/60">{club.name}</p>
                      </div>
                    </div>
                    <div className="flex items-center">
                        <div className="text-right mr-3">
                          <p className="font-bold text-white">{getClubTokenBalance(club.id)}</p>
                          <p className="text-xs text-white/60">{club.symbol}</p>
                      </div>
                        <ChevronRight size={20} className="text-white/40" />
                      </div>
                    </div>
                  </div>
                ))}
                
                                {filteredClubs.length === 0 && (
                  <div className="text-center py-12">
                    <Football size={48} className="mx-auto text-white/20 mb-4" />
                    <p className="text-white/60">{t('tokens:emptyStates.noClubFound')}</p>
                  </div>
                )}
                </div>
              ) : (
              <div className="space-y-3 max-w-2xl mx-auto">
                {loadingStablecoins ? (
                  <div className="flex justify-center py-12">
                    <Loader2 size={32} className="animate-spin text-secondary" />
                  </div>
                ) : stablecoins.length === 0 ? (
                  <div className="text-center py-12">
                    <Coins size={48} className="mx-auto text-white/20 mb-4" />
                    <p className="text-white/60">{t('tokens:emptyStates.noStablecoinFound')}</p>
                    </div>
                  ) : (
                    stablecoins.map(coin => (
                      <div 
                        key={coin.symbol}
                        onClick={() => handleSelectStablecoin(coin)}
                      className="bg-background-overlay/50 backdrop-blur-sm border border-white/10 rounded-xl p-4 cursor-pointer hover:bg-background-overlay/70 transition-all duration-300 hover:scale-[1.02]"
                      >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <img src={coin.image} alt={coin.symbol} className="w-12 h-12 rounded-full mr-4" />
                          <div>
                            <p className="font-semibold text-white">{coin.symbol}</p>
                            <p className="text-sm text-white/60">{coin.name}</p>
                          </div>
                        </div>
                        <div className="flex items-center">
                          <div className="text-right mr-3">
                            <p className="font-bold text-white">{coin.balance}</p>
                            <p className="text-xs text-white/60">{coin.symbol}</p>
                          </div>
                          <ChevronRight size={20} className="text-white/40" />
                        </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
            )}
          </>
        ) : activeTab === 'historico' ? (
          <div className="max-w-2xl mx-auto">
            {loadingTransactions ? (
              <div className="flex justify-center py-12">
                <Loader2 size={32} className="animate-spin text-secondary" />
              </div>
            ) : transactions.length === 0 ? (
              <div className="text-center py-12">
                <Receipt size={48} className="mx-auto text-white/20 mb-4" />
                <p className="text-white/60">{t('tokens:emptyStates.noTransactions')}</p>
              </div>
            ) : (
              <div className="space-y-3">
                {(() => {
                  const filteredTransactions = transactions.filter(transaction => {
                    if (activeTokenType === 'fantoken') {
                      return transaction.club !== undefined;
                    } else if (activeTokenType === 'stablecoin') {
                      return transaction.stablecoin !== undefined;
                    }
                    return true;
                  });
                  
                  if (filteredTransactions.length === 0) {
                    return (
                      <div className="text-center py-12">
                        <Receipt size={48} className="mx-auto text-white/20 mb-4" />
                        <p className="text-white/60">
                          {activeTokenType === 'fantoken' 
                            ? t('tokens:emptyStates.noFanTokenTransactions')
                            : t('tokens:emptyStates.noStablecoinTransactions')}
                        </p>
                      </div>
                    );
                  }
                  
                  return filteredTransactions.map(transaction => (
                    <div 
                      key={transaction.id}
                      className="bg-background-overlay/50 backdrop-blur-sm border border-white/10 rounded-xl p-4"
                    >
                      <div className="flex items-center justify-between">
                      <div className="flex items-center">
                          <div className="w-12 h-12 rounded-full bg-white/10 overflow-hidden mr-4">
                          {transaction.club?.image ? (
                            <img 
                              src={transaction.club.image} 
                              alt={transaction.club.name} 
                              className="w-full h-full object-cover" 
                            />
                          ) : transaction.stablecoin?.image ? (
                            <img 
                              src={transaction.stablecoin.image} 
                              alt={transaction.stablecoin.name} 
                              className="w-full h-full object-cover" 
                            />
                          ) : (
                              <div className="w-full h-full flex items-center justify-center">
                                <Football size={24} className="text-white/50" />
                            </div>
                          )}
                        </div>
                        <div>
                            <p className="font-semibold text-white">
                            {transaction.club?.symbol || transaction.stablecoin?.symbol || 'Token'}
                          </p>
                            <div className="flex items-center text-xs text-white/60">
                              <Receipt size={10} className="mr-1" />
                              {formatHash(transaction.hash)}
                            {transaction.hash && (
                              <a 
                                href={`${BLOCK_EXPLORER_URL}tx/${transaction.hash}`} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                  className="ml-2 inline-flex items-center text-secondary hover:text-secondary/80"
                                onClick={(e) => e.stopPropagation()}
                              >
                                <ExternalLink size={10} className="mr-1" />
                                  {t('tokens:transaction.view')}
                              </a>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                          <p className="font-bold text-secondary">+{transaction.value}</p>
                          <p className="text-xs text-white/60">
                          {transaction.date_register ? new Date(transaction.date_register).toLocaleDateString() : '-'}
                        </p>
                        </div>
                      </div>
                    </div>
                  ));
                })()}
              </div>
            )}
          </div>
        ) : (
          <div className="max-w-6xl mx-auto">
          <div className="mb-8">
              <h2 className="text-2xl font-bold text-white mb-6">{t('tokens:stake.fixedStaking')}</h2>
              
              <div className="flex flex-col sm:flex-row items-center justify-between mb-6 gap-4">
                <div className="flex bg-background-overlay/50 backdrop-blur-sm rounded-lg border border-white/10 p-1">
                  <button className="px-4 py-2 rounded-md bg-secondary text-black font-medium">
                    {t('tokens:stake.active')}
                  </button>
                  <button className="px-4 py-2 rounded-md text-white/60 hover:text-white">
                    {t('tokens:stake.ended')}
                  </button>
                </div>
                
                <div className="flex items-center gap-4 ">
                    <label className="inline-flex items-center cursor-pointer">
                    <input type="checkbox" className="sr-only peer bg-black"  />
                    <div className="bg-black relative w-10 h-6 bg-background-overlay/50 rounded-full peer-checked:bg-secondary/80 peer-focus:ring-2 peer-focus:ring-secondary/20 transition-all">
                      <div className="absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full transition-transform peer-checked:translate-x-4 "></div>
                  </div>
                    <span className="ml-3 text-sm text-white">{t('tokens:stake.stakedOnly')}</span>
                  </label>
                  
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Search size={16} className="text-white/50" />
                    </div>
                    <input
                      type="text"
                      placeholder={t('tokens:search.searchPlaceholder')}
                      className="pl-10 bg-black pr-4 py-2 rounded-lg bg-background-overlay/50 backdrop-blur-sm border border-white/10 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-secondary w-48"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {loading ? (
                  <div className="col-span-full flex justify-center py-12">
                    <Loader2 size={32} className="animate-spin text-secondary" />
                  </div>
                ) : filteredClubs.length === 0 ? (
                  <div className="col-span-full text-center py-12">
                    <Football size={48} className="mx-auto text-white/20 mb-4" />
                    <p className="text-white/60">{t('tokens:emptyStates.noClubFound')}</p>
                  </div>
                ) : (
                  filteredClubs.map(club => {
                    const apr = (club.id % 10) + 5;
                    const tvl = ((club.id % 5) + 1) * 20;
                    const totalTokens = 100 + club.id * 10;
                    const userBalance = getClubTokenBalance(club.id);
                    const earned = userBalance > 0 ? (userBalance * 0.1).toFixed(2) : "0.00";
                    
                    return (
                      <div key={club.id} className="bg-background-overlay/50 backdrop-blur-sm border border-white/10 rounded-xl p-6">
                        <div className="flex items-center mb-4">
                          <div className="w-8 h-8 rounded-full bg-white/10 overflow-hidden mr-3">
                            {club.image ? (
                              <img 
                                src={club.image} 
                                alt={club.name} 
                                className="w-full h-full object-cover" 
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center">
                                <Football size={16} className="text-white/50" />
                              </div>
                            )}
                          </div>
                          <span className="text-white font-medium">{t('tokens:stake.earn')} {club.symbol}</span>
                        </div>
                        
                        <div className="mb-4">
                          <span className="text-white text-3xl font-bold">{apr}%</span>
                          <span className="text-white/60 text-sm ml-2">{t('tokens:stake.apr')}</span>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
                                                      <div>
                              <p className="text-white/60">{t('tokens:stake.tvl')}</p>
                              <p className="text-white font-semibold">${tvl}k</p>
                            </div>
                            <div>
                              <p className="text-white/60">{t('tokens:stake.total')} {club.symbol}</p>
                              <p className="text-white font-semibold">{totalTokens}k</p>
                            </div>
                            <div>
                              <p className="text-white/60">{t('tokens:stake.yourDeposits')}</p>
                              <p className="text-white font-semibold">{userBalance} {club.symbol}</p>
                          </div>
                            <div>
                              <p className="text-white/60">{t('tokens:stake.earned')}</p>
                              <p className="text-secondary font-semibold">{earned} {club.symbol}</p>
                            </div>
                        </div>
                        
                        <button className="w-full py-3 bg-secondary hover:bg-secondary/90 text-black font-medium rounded-lg transition-colors">
                          {t('tokens:stake.viewMore')}
                        </button>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Modal de Compra */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-background-overlay backdrop-blur-md border border-white/10 rounded-2xl w-full max-w-md overflow-hidden">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold text-white">
                  {showQRCode ? t('tokens:modal.payment') : selectedClub.name}
                </h3>
                <Button variant="ghost" size="icon" onClick={handleCloseModal} className="text-white/70 hover:text-white">
                  <X size={18} />
                </Button>
              </div>

              {!showQRCode ? (
                <>
                  <div className="flex items-center justify-center mb-6">
                    <div className="w-20 h-20 rounded-full bg-white/10 overflow-hidden">
                      {selectedClub.image ? (
                        <img 
                          src={selectedClub.image} 
                          alt={selectedClub.name} 
                          className="w-full h-full object-cover" 
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Football size={32} className="text-white/50" />
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="text-center mb-6">
                    <p className="text-white/60 mb-2">{t('tokens:modal.currentBalance')}</p>
                    <p className="text-2xl font-bold text-white">
                      {getClubTokenBalance(selectedClub.id)} {selectedClub.symbol}
                    </p>
                  </div>

                  <div className="mb-6">
                    <label className="block text-white/80 mb-3 text-center">
                      {t('tokens:modal.quantity')}
                    </label>
                    <div className="flex items-center justify-center gap-4">
                      <Button 
                        variant="outline" 
                        onClick={() => quantity > 1 && setQuantity(quantity - 1)}
                        className="w-10 h-10 rounded-full border-white/20 text-white hover:bg-white/10"
                      >
                        -
                      </Button>
                      <input
                        type="number"
                        min="1"
                        max="100"
                        value={quantity}
                        onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                        className="w-20 py-2 text-center border bg-black border-white/20 rounded-lg bg-background-overlay/50 text-white focus:outline-none focus:ring-2 focus:ring-secondary"
                      />
                      <Button 
                        variant="outline" 
                        onClick={() => setQuantity(quantity + 1)}
                        className="w-10 h-10 rounded-full border-white/20 text-white hover:bg-white/10"
                      >
                        +
                      </Button>
                    </div>
                  </div>

                  <div className="bg-background-overlay/30 backdrop-blur-sm border border-white/10 rounded-lg p-4 mb-6">
                    <div className="flex justify-between mb-2">
                      <span className="text-white/70">{t('tokens:modal.pricePerToken')}</span>
                      <span className="text-white font-medium">R$ 1,00</span>
                    </div>
                    <div className="flex justify-between mb-2">
                      <span className="text-white/70">{t('tokens:modal.quantity')}</span>
                      <span className="text-white font-medium">{quantity}</span>
                    </div>
                    <div className="flex justify-between pt-2 border-t border-white/10">
                      <span className="text-white font-medium">{t('tokens:modal.total')}</span>
                      <span className="text-secondary font-bold">R$ {quantity.toFixed(2)}</span>
                    </div>
                  </div>

                  <Button 
                    className="w-full bg-secondary hover:bg-secondary/90 text-black font-semibold py-3"
                    onClick={handleBuyTokens}
                  >
                    {t('tokens:modal.buy')}
                  </Button>
                </>
              ) : (
                <div className="text-center">
                  <p className="text-white/70 mb-6">
                    {t('tokens:modal.scanQrCode')}
                  </p>
                  <div className="bg-white/10 rounded-lg p-4 mb-6">
                    <img 
                      src={getRandomQRCode()} 
                      alt="QR Code" 
                      className="w-48 h-48 mx-auto object-contain"
                    />
                  </div>
                  <p className="text-white/60 mb-6">
                    {t('tokens:modal.value')} R$ {quantity.toFixed(2)}
                  </p>
                  <Button 
                    className="w-full bg-secondary hover:bg-secondary/90 text-black font-semibold py-3"
                    onClick={closeQRCode}
                    disabled={processingPayment}
                  >
                    {processingPayment ? (
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    ) : null}
                    {processingPayment ? t('tokens:modal.processing') : t('tokens:modal.confirmPayment')}
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 