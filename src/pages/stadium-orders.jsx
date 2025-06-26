/* eslint-disable react-hooks/exhaustive-deps */
import { useState, useEffect, useContext } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useWalletContext } from '../hooks/useWalletContext';
import { useTranslation } from 'react-i18next';
import { 
  ArrowLeft, 
  ShoppingBag, 
  Store, 
  ChevronRight, 
  Plus, 
  Minus, 
  ShoppingCart, 
  Loader2, 
  X, 
  Check,
  Clock,
  CreditCard,
  ListTodo,
  AlertCircle,
  Copy,
  ExternalLink,
  Volleyball as Football,
  Receipt
} from 'lucide-react';
import { Button } from '../components/ui/button';
import { showError, showSuccess } from '../lib/toast';
import orderApi from '../api/order';
import clubApi from '../api/club';
import matchApi from '../api/match';
import establishmentApi from '../api/establishment';
import { useLocation } from 'react-router-dom';
import establishmentProductApi from '../api/establishment_product';
import { usePayment } from '../utils/web3/payment';
import stablecoinApi from '../api/stablecoin';
import contractApi from '../api/contract';
import { WalletContext } from '../contexts/WalletContextDef';

export default function StadiumOrdersPage() {
  const navigate = useNavigate();
  const { clubId, gameId } = useParams();
  const { isAuthenticated, isInitialized, getUserData } = useWalletContext();
  const { state } = useLocation();
  const { paymentSignature } = usePayment();
  const { BLOCK_EXPLORER_URL, getSigner } = useContext(WalletContext);
  const { t } = useTranslation();
  // UI States
  const [loading, setLoading] = useState(true);
  const [currentView, setCurrentView] = useState('establishments'); // 'establishments', 'menu', 'cart', 'confirmation', 'activeOrders'
  const [placingOrder, setPlacingOrder] = useState(false);
  const [processingPayment, setProcessingPayment] = useState(false);
  
  // Data States
  const [establishments, setEstablishments] = useState([]);
  const [selectedEstablishment, setSelectedEstablishment] = useState(null);
  const [menuItems, setMenuItems] = useState([]);
  const [cart, setCart] = useState([]);
  const [club, setClub] = useState(state?.club);
  const [order, setOrder] = useState(null);
  const [gameInfo, setGameInfo] = useState(null);
  const [activeOrders, setActiveOrders] = useState([]);
  const [orderStatusFilter, setOrderStatusFilter] = useState('all'); // 'all', '1', '2'
  
  // Pagamento
  const [stablecoins, setStablecoins] = useState([]);
  const [selectedStablecoin, setSelectedStablecoin] = useState(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showStablecoinModal, setShowStablecoinModal] = useState(false);
  const [showInsufficientFundsModal, setShowInsufficientFundsModal] = useState(false);
  const [stablecoinBalance, setStablecoinBalance] = useState(null);

  // Check if user is authenticated and load data
  useEffect(() => {
    const checkAuthAndLoadData = async () => {
      try {
        if (isInitialized && !isAuthenticated) {
          navigate('/app');
          return;
        }

        setLoading(true);
        
        // Get user data - we call this to verify authentication
        await getUserData();
        
        if (clubId && !club) {
          // Load club data
          const clubData = await clubApi.getClubById(clubId);
          if (clubData) {
            setClub(clubData);
          }
        } else if (!clubId && !club) {
          // Redirect to dashboard if no clubId is provided
          navigate('/dashboard');
          return;
        }
        // Load game info
        if (gameId) {
          await verifyHomeGameAndLoadData(clubId, gameId);
          await fetchActiveOrders();
        } else {
          showError('No game specified');
          navigate(`/clubs/${clubId}`);
        }
      } catch (error) {
        console.error('Error loading data:', error);
        showError('Failed to load stadium data');
        navigate('/dashboard');
      } finally {
        setLoading(false);
      }
    };

    checkAuthAndLoadData();
  }, [isAuthenticated, navigate, getUserData, clubId, gameId]);

  // Fetch active orders periodically
  useEffect(() => {
    // Only run if authenticated and have game info
    if (!isAuthenticated || !gameId) return;

    const fetchOrders = async () => {
      await fetchActiveOrders();
    };

    // Fetch immediately and then every 30 seconds
    fetchOrders();
    const interval = setInterval(fetchOrders, 30000);

    return () => clearInterval(interval);
  }, [isAuthenticated, gameId]);

  const fetchActiveOrders = async () => {
    try {
      // In a real app, this would fetch the user's active orders for this game
      const activeOrdersData = await orderApi.getActiveOrders(gameId);
      setActiveOrders(activeOrdersData);
    } catch (error) {

      console.error('Error fetching active orders:', error);
      // Don't show error to avoid disrupting the main flow
    }
  };

  const verifyHomeGameAndLoadData = async (clubId, gameId) => {
    try {
      const currentClubName = club.name;
      const game = await matchApi.getMatchById(gameId);

      if (!game) {
        showError('Game not found');
        navigate(`/clubs/${clubId}`);
        return;
      }

      // Check if the current club is playing in this game
      const isParticipating = game.home_club_name === currentClubName || game.away_club_name === currentClubName;
      
      if (!isParticipating) {
        showError('Your club is not participating in this game');
        navigate(`/clubs/${clubId}`);
        return;
      }
      
      // Check if the current club is the home team (for display purposes)
      const isHomeTeam = game.home_club_id === club.id;
      
      setGameInfo({
        ...game,
        is_home_team: isHomeTeam  // Keep track of whether this club is home team (for UI customization)
      });
      
      // Load establishments for any participating team
      const establishments = await establishmentApi.getEstablishmentByStadiumId(game.stadium_id);
      setEstablishments(establishments);
    } catch (error) {
      console.error('Error verifying game participation:', error);
      showError('Failed to verify game data');
      navigate(`/clubs/${clubId}`);
    }
  };

  const fetchMenuItems = async (establishmentId) => {
    try {
      setLoading(true);
      const data = await establishmentProductApi.getProductsByEstablishment(establishmentId);
      setMenuItems(data);
      setCurrentView('menu');
    } catch (error) {
      console.error('Error fetching menu items:', error);
      showError('Failed to load menu');
    } finally {
      setLoading(false);
    }
  };

  const handleSelectEstablishment = (establishment) => {
    setSelectedEstablishment(establishment);
    fetchMenuItems(establishment.establishment_id);
  };

  const handleAddToCart = (item) => {
    const existingItem = cart.find(cartItem => cartItem.id === item.id);
    
    if (existingItem) {
      setCart(cart.map(cartItem => 
        cartItem.id === item.id 
          ? { ...cartItem, quantity: cartItem.quantity + 1 } 
          : cartItem
      ));
    } else {
      setCart([...cart, { ...item, quantity: 1 }]);
    }
    
    // showSuccess(`Added ${item.name} to cart`);
  };

  const handleRemoveFromCart = (item) => {
    const existingItem = cart.find(cartItem => cartItem.id === item.id);
    
    if (existingItem && existingItem.quantity > 1) {
      setCart(cart.map(cartItem => 
        cartItem.id === item.id 
          ? { ...cartItem, quantity: cartItem.quantity - 1 } 
          : cartItem
      ));
    } else {
      setCart(cart.filter(cartItem => cartItem.id !== item.id));
    }
  };

  const handleDeleteFromCart = (itemId) => {
    setCart(cart.filter(item => item.id !== itemId));
  };

  const handleViewCart = () => {
    setCurrentView('cart');
  };

  const handleViewActiveOrders = () => {
    setCurrentView('activeOrders');
  };

  const handleBack = () => {
    if (currentView === 'menu') {
      setCurrentView('establishments');
      setSelectedEstablishment(null);
    } else if (currentView === 'cart') {
      setCurrentView('menu');
    } else if (currentView === 'confirmation') {
      // If from confirmation, go back to establishments to start over
      setCurrentView('establishments');
      setCart([]);
      setOrder(null);
    } else if (currentView === 'activeOrders') {
      setCurrentView('establishments');
    } else {
      navigate(`/game/${clubId}/${gameId}`);
    }
  };

  const handlePlaceOrder = async () => {
    try {
      setPlacingOrder(true);
      const orderData = {
        match_id: gameId,
        establishment_id: selectedEstablishment.establishment_id,
        products: cart.map(item => ({
          product_id: item.id,
          quantity: item.quantity
        })),
        total_real: cart.reduce((total, item) => total + (item.value_real * item.quantity), 0),
        total_fantoken: 0 // Zeramos o valor em fantoken
      };
      
      const orderResult = await orderApi.placeOrder(orderData);
      
      if (orderResult) {
        setOrder(orderResult);
        await fetchActiveOrders(); // Refresh active orders
        setCurrentView('confirmation');
        showSuccess('Pedido realizado com sucesso!');
        setCart([]); // Clear cart after successful order
      } else {
        showError('Falha ao realizar o pedido');
      }
    } catch (error) {
      console.error('Erro ao realizar o pedido:', error);
      showError('Falha ao realizar o pedido');
    } finally {
      setPlacingOrder(false);
    }
  };

  const calculateTotal = () => {
    return cart.reduce((total, item) => total + (item.value_real * item.quantity), 0);
  };

  // Get order status color
  const getStatusColor = (status) => {
    switch (status) {
      case 1:
        return 'text-amber-600 dark:text-amber-400 bg-amber-100 dark:bg-amber-900/20';
      case 2:
        return 'text-green-600 dark:text-green-400 bg-green-100 dark:bg-green-900/20';
      case 3:
        return 'text-blue-600 dark:text-blue-400 bg-blue-100 dark:bg-blue-900/20';
      default:
        return 'text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-gray-800/40';
    }
  };

  // Obter nome do status traduzido
  const getStatusName = (statusId) => {
    switch (statusId) {
      case 1:
        return t('stadium-orders:status.awaiting_payment');
      case 2:
        return t('stadium-orders:status.ready_for_pickup');
      case 3:
        return t('stadium-orders:status.processing');
      default:
        return t('stadium-orders:status.unknown');
    }
  };

  // Função para buscar stablecoins disponíveis
  const fetchStablecoins = async () => {
    try {
      const stablecoinsData = await stablecoinApi.getStablecoins();
      setStablecoins(stablecoinsData);
      // Seleciona apenas a stablecoin com id = 3, se existir
      const stablecoinId3 = stablecoinsData.find(coin => coin.id === 3);
      if (stablecoinId3) {
        setSelectedStablecoin(stablecoinId3);
      }
      return stablecoinsData;
    } catch (error) {
      console.error('Erro ao buscar stablecoins:', error);
      showError('Falha ao carregar opções de pagamento');
      return [];
    }
  };

  // Função para abrir o modal de pagamento
  const openPaymentModal = async (order) => {
    setOrder(order);
    setShowPaymentModal(true);
  };

  // Função para abrir o modal de stablecoins
  const showStablecoinOptions = async () => {
    await fetchStablecoins();
    setShowStablecoinModal(true);
  };

  // Função para verificar o saldo de BRZ
  const checkBrzBalance = async (orderTotal) => {
    try {
      
      // Obter o signer usando getSigner
      const signer = await getSigner();

      // Verificar se o signer está disponível
      if (!signer) {
        throw new Error("Carteira bloqueada ou não disponível");
      }
      
      let userAddress;
      try {
        userAddress = await signer.getAddress();
      } catch {
        throw new Error("Por favor, desbloqueie sua carteira.");
      }

      if (!userAddress) return false;
      
      // BRZ sempre é ID 3
      const brzeBalance = await contractApi.getStablecoinBalance(userAddress, 3);
      setStablecoinBalance(brzeBalance);
      
      // Verifica se o usuário tem saldo suficiente
      if (brzeBalance) {
        const balance = parseFloat(brzeBalance.balance);
        return balance >= orderTotal;
      }
      
      return false;
    } catch (error) {
      console.error('Erro ao verificar saldo de BRZ:', error);
      return false;
    }
  };

  // Modificar a função de pagamento para verificar o saldo
  const handlePayment = async (order) => {
    try {
      if (!showPaymentModal && !showStablecoinModal) {
        // Se não estiver mostrando nenhum modal, abre o modal de pagamento
        setProcessingPayment(false);
        openPaymentModal(order);
        return;
      }

      if (showPaymentModal && !showStablecoinModal) {
        // Se estiver mostrando o modal de pagamento, mas não o de stablecoin,
        // fecha o modal de pagamento e abre o de stablecoin
        setShowPaymentModal(false);
        showStablecoinOptions();
        return;
      }
      
      setProcessingPayment(true);
      
      if (selectedStablecoin) {
        // Verificar saldo antes de prosseguir com o pagamento
        const hasSufficientBalance = await checkBrzBalance(order.total_real);
        
        if (!hasSufficientBalance) {
          setProcessingPayment(false);
          setShowStablecoinModal(false);
          setShowInsufficientFundsModal(true);
          return;
        }
        
        try {
          // Usando a função paymentSignature para gerar a assinatura
          const signatureData = await paymentSignature(
            order.id, 
            order.total_real, 
            selectedStablecoin.id
          );
          
          // Processar pagamento com stablecoin
          const paymentData = {
            order_id: order.id,
            user_address: signatureData.userAddress,
            amount: signatureData.amount,
            signature: signatureData.signature,
            deadline: signatureData.deadline,
            stablecoin_id: selectedStablecoin.id,
            v: signatureData.permitV,
            r: signatureData.permitR,
            s: signatureData.permitS,
          };
                    
          const paymentResult = await orderApi.paymentOrder(paymentData);
          
          if (paymentResult) {
            await fetchActiveOrders();
            showSuccess('Pagamento realizado com sucesso!');
            setShowStablecoinModal(false);
            setCurrentView('activeOrders');
          } else {
            showError('Falha ao processar o pagamento');
          }
        } catch (signatureError) {
          console.error('Erro ao gerar assinatura:', signatureError);
          showError(signatureError.message || 'Erro ao gerar assinatura para o pagamento');
          setProcessingPayment(false);
        }
      } else {
        showError('Selecione uma stablecoin para continuar');
        setProcessingPayment(false);
      }
    } catch (error) {
      console.error('Erro ao processar pagamento:', error);
      if (error.message) {
        showError(error.message);
      } else {
        showError('Erro ao processar o pagamento');
      }
    } finally {
      if (processingPayment) {
        setProcessingPayment(false);
        await fetchActiveOrders();
      }
    }
  };

  // Filtered orders based on status filter
  const filteredActiveOrders = activeOrders.filter(order => {
    if (orderStatusFilter === 'all') return true;
    return order.status_id.toString() === orderStatusFilter;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-4rem)]">
        <div className="flex flex-col items-center">
          <Loader2 className="h-12 w-12 animate-spin text-secondary" />
          <p className="mt-4 text-primary/70 dark:text-white/70">{t('stadium-orders:loading')}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-[#fafafa] bg-background">
      {/* Header */}
      <div className="bg-background-overlay text-white p-4">
        <div className="container mx-auto">
          <button 
            onClick={handleBack}
            className="flex items-center text-white/80 hover:text-white mb-2"
          >
            <ArrowLeft size={18} className="mr-1" />
            <span>{t('stadium-orders:button.back')}</span>
          </button>
          
          <div className="flex items-center justify-between">
            <h1 className="text-xl font-bold">
              {currentView === 'establishments' && t('stadium-orders:title.establishments')}
              {currentView === 'menu' && selectedEstablishment?.name}
              {currentView === 'cart' && t('stadium-orders:title.cart')}
              {currentView === 'confirmation' && t('stadium-orders:title.confirmation')}
              {currentView === 'activeOrders' && t('stadium-orders:title.activeOrders')}
            </h1>
            
            {/* Header actions */}
            <div className="flex items-center gap-2">
              {/* Active orders button */}
              {activeOrders.length > 0 && currentView !== 'activeOrders' && (
                <Button 
                  variant="secondary" 
                  size="sm" 
                  className="flex items-center" 
                  onClick={handleViewActiveOrders}
                >
                  <Clock size={16} className="mr-1" />
                  <span className="text-black">{activeOrders.length}</span>
                </Button>
              )}
              
              {/* Cart button in header */}
              {(currentView === 'menu' && cart.length > 0) && (
                <Button 
                  variant="secondary" 
                  size="sm" 
                  className="flex items-center" 
                  onClick={handleViewCart}
                >
                  <ShoppingCart size={16} className="mr-1" />
                  <span>{cart.reduce((total, item) => total + item.quantity, 0)}</span>
                </Button>
              )}
            </div>
          </div>
          
          {club && (
            <div className="text-sm text-white/80 mt-1">
              {club.name}
              {gameInfo && (
                <span className="ml-2">| {gameInfo.home_club_name} vs {gameInfo.away_club_name}</span>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-6 pb-24">
        {/* Establishments View */}
        {currentView === 'establishments' && (
          <div className="space-y-4">
            {/* Active orders compact banner */}
            {activeOrders.length > 0 && (
              <div onClick={handleViewActiveOrders} className="bg-secondary/10 rounded-lg p-4 flex justify-between items-center cursor-pointer mb-6 border border-secondary/20">
                <div className="flex items-center">
                  <Clock size={20} className="text-secondary mr-2" />
                  <div>
                    <h3 className="font-medium text-primary dark:text-white">
                      {t('stadium-orders:activeOrdersCount', { count: activeOrders.length })}
                    </h3>
                    <p className="text-sm text-primary/70 dark:text-white/70">{t('stadium-orders:tapToTrackOrders')}</p>
                  </div>
                </div>
                <ChevronRight size={20} className="text-primary/50 dark:text-white/50" />
              </div>
            )}
            
            {/* Game Information Card */}
            {gameInfo && (
              <div className="bg-background-overlay rounded-lg p-4 mb-4 shadow-sm">
                <h2 className="text-lg font-bold text-primary dark:text-white">{t('stadium-orders:gameInfo.title')}</h2>
                <div className="flex items-center mt-2">
                  <div className="h-2 w-2 rounded-full bg-red-500 animate-pulse mr-2"></div>
                  <span className="text-sm font-medium text-primary dark:text-white">
                    {gameInfo.home_club_name} vs {gameInfo.away_club_name}
                  </span>
                </div>
                <p className="text-sm text-primary/70 dark:text-white/70 mt-1">
                  {t('stadium-orders:gameInfo.stadium')}: {gameInfo.stadium_name}
                </p>
                <p className="text-sm text-primary/70 dark:text-white/70 mt-1">
                  {t('stadium-orders:gameInfo.currentScore')}: 0 - 0
                </p>
                <p className="text-xs text-primary/60 dark:text-white/60 mt-1">
                  {gameInfo.is_home_team ? t('stadium-orders:gameInfo.homeTeam') : t('stadium-orders:gameInfo.awayTeam')}
                </p>
              </div>
            )}
            
            <h2 className="text-lg font-medium text-primary dark:text-white mb-4">
              {t('stadium-orders:selectEstablishment')}
            </h2>
            
            {establishments.length > 0 ? (
              <>
                {establishments.map((establishment) => (
                  <div 
                    key={establishment.id}
                    className="bg-background-overlay rounded-lg p-4 shadow-sm cursor-pointer"
                    onClick={() => handleSelectEstablishment(establishment)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <div className="w-12 h-12 rounded-full bg-background flex items-center justify-center mr-4">
                          <img 
                            src={establishment.image} 
                            alt={establishment.establishment_name}
                            className="w-full h-full object-cover rounded-full"
                            onError={(e) => e.target.src = 'https://via.placeholder.com/80?text=No+Image'}
                          />
                        </div>  
                        <div>
                          <h3 className="font-medium text-primary dark:text-white">{establishment.establishment_name}</h3>
                          <p className="text-sm text-primary/70 dark:text-white/70">{establishment.description || ''}</p>
                        </div>
                      </div>
                      <ChevronRight size={20} className="text-primary/50 dark:text-white/50" />
                    </div>
                  </div>
                ))
              }</>
            ) : (
              <div className="bg-background-overlay rounded-lg p-6 text-center shadow-sm">
                <p className="text-primary/70 dark:text-white/70">{t('stadium-orders:noEstablishments')}</p>
              </div>
            )}
          </div>
        )}

        {/* Menu Items View */}
        {currentView === 'menu' && (
          <div className="space-y-4">
            <h2 className="text-lg font-medium text-primary dark:text-white mb-4">
              {t('stadium-orders:title.menu')}
            </h2>
            
            {menuItems.length > 0 ? (
              menuItems.map((item) => {
                const cartItem = cart.find(i => i.id === item.id);
                const quantity = cartItem ? cartItem.quantity : 0;
                
                return (
                  <div 
                    key={item.id}
                    className="bg-background-overlay rounded-lg p-4 shadow-sm"
                  >
                    <div className="flex justify-between">
                      <div className="flex">
                        {item.image && (
                          <div className="mr-4 w-20 h-20 flex-shrink-0">
                            <img 
                              src={item.image} 
                              alt={item.name}
                              className="w-full h-full object-cover rounded-md"
                              onError={(e) => e.target.src = 'https://via.placeholder.com/80?text=No+Image'}
                            />
                          </div>
                        )}
                        <div>
                          <h3 className="font-medium text-primary dark:text-white">{item.name}</h3>
                          <p className="text-sm text-primary/70 dark:text-white/70 mt-1">{item.description}</p>
                          <div className="mt-2">
                            <p className="font-medium text-primary dark:text-white">R$ {item.value_real.toFixed(2)}</p>
                          </div>
                        </div>
                      </div>
                      
                      {quantity > 0 ? (
                        <div className="flex items-center">
                          <Button 
                            variant="outline" 
                            size="icon" 
                            className="h-8 w-8"
                            onClick={() => handleRemoveFromCart(item)}
                          >
                            <Minus size={16} className="dark:text-white" />
                          </Button>
                          <span className="mx-3 font-medium text-primary dark:text-white">{quantity}</span>
                          <Button 
                            variant="outline" 
                            size="icon" 
                            className="h-8 w-8"
                            onClick={() => handleAddToCart(item)}
                          >
                            <Plus size={16} className="dark:text-white" />
                          </Button>
                        </div>
                      ) : (
                        <Button 
                          variant="secondary" 
                          size="sm"
                          onClick={() => handleAddToCart(item)}
                        >
                          {t('stadium-orders:button.addToCart')}
                        </Button>
                      )}
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="bg-background-overlay rounded-lg p-6 text-center shadow-sm">
                <p className="text-primary/70 dark:text-white/70">{t('stadium-orders:noMenuItems')}</p>
              </div>
            )}
          </div>
        )}

        {/* Cart View */}
        {currentView === 'cart' && (
          <div className="space-y-4">
            <h2 className="text-lg font-medium text-primary dark:text-white mb-4">
              {t('stadium-orders:title.cart')}
            </h2>
            
            {cart.length > 0 ? (
              <>
                <div className="bg-background-overlay rounded-lg p-4 shadow-sm">
                  <h3 className="font-medium text-primary dark:text-white mb-3">
                    {selectedEstablishment?.establishment_name}
                  </h3>
                  
                  <div className="divide-y divide-gray-100 dark:divide-gray-800">
                    {cart.map((item) => (
                      <div key={item.id} className="py-3 flex justify-between items-center">
                        <div className="flex items-center">
                          {item.image && (
                            <div className="mr-3 w-12 h-12 flex-shrink-0">
                              <img 
                                src={item.image} 
                                alt={item.name}
                                className="w-full h-full object-cover rounded-md"
                                onError={(e) => e.target.src = 'https://via.placeholder.com/48?text=No+Image'}
                              />
                            </div>
                          )}
                          <div className="mr-3 flex items-center">
                            <span className="font-medium text-primary dark:text-white">
                              {item.quantity}x
                            </span>
                          </div>
                          <div>
                            <h4 className="text-primary dark:text-white">{item.name}</h4>
                            <p className="text-sm text-primary/70 dark:text-white/70">R$ {item.value_real.toFixed(2)}</p>
                          </div>
                        </div>
                        
                        <div className="flex items-center">
                          <div className="text-right mr-4">
                            <p className="font-medium text-primary dark:text-white">
                              R$ {(item.value_real * item.quantity).toFixed(2)}
                            </p>
                          </div>
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-8 w-8 text-red-500"
                            onClick={() => handleDeleteFromCart(item.id)}
                          >
                            <X size={16} />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-800">
                    <div className="flex justify-between items-center">
                      <span className="text-primary dark:text-white font-bold">{t('stadium-orders:total')}</span>
                      <div className="text-right">
                        <p className="font-bold text-lg text-primary dark:text-white">
                          R$ {calculateTotal().toFixed(2)}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
                
                <Button 
                  className="w-full mt-4" 
                  size="lg"
                  onClick={handlePlaceOrder}
                  disabled={placingOrder}
                >
                  {placingOrder ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      {t('stadium-orders:processing')}
                    </>
                  ) : (
                    t('stadium-orders:button.placeOrder')
                  )}
                </Button>
              </>
            ) : (
              <div className="bg-background-overlay rounded-lg p-6 text-center shadow-sm">
                <p className="text-primary/70 dark:text-white/70">{t('stadium-orders:cartEmpty')}</p>
                <Button 
                  variant="secondary" 
                  className="mt-4" 
                  onClick={() => setCurrentView('menu')}
                >
                  {t('stadium-orders:button.backToMenu')}
                </Button>
              </div>
            )}
          </div>
        )}

        {/* Active Orders View */}
        {currentView === 'activeOrders' && (
          <div className="space-y-4">
            <h2 className="text-lg font-medium text-primary dark:text-white mb-4">
              {t('stadium-orders:title.activeOrders')}
            </h2>
            
            {/* Filter tabs */}
            <div className="flex flex-wrap gap-2 mb-6">
              <Button 
                variant={orderStatusFilter === 'all' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setOrderStatusFilter('all')}
                className={`
                  rounded-full font-medium 
                  ${orderStatusFilter === 'all' 
                    ? 'bg-primary text-white shadow-md' 
                    : 'bg-white/10 text-primary dark:text-white border-primary/20 dark:border-white/20 hover:bg-white/20 hover:border-primary/30 dark:hover:border-white/30'}
                `}
              >
                <ListTodo size={16} className="mr-1.5" />
                {t('stadium-orders:filter.all')}
              </Button>
              <Button 
                variant={orderStatusFilter === '1' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setOrderStatusFilter('1')}
                className={`
                  rounded-full font-medium
                  ${orderStatusFilter === '1' 
                    ? 'bg-amber-500 text-white shadow-md' 
                    : 'bg-white/10 text-primary dark:text-white border-primary/20 dark:border-white/20 hover:bg-white/20 hover:border-primary/30 dark:hover:border-white/30'}
                `}
              >
                <CreditCard size={16} className="mr-1.5" />
                {t('stadium-orders:filter.awaiting_payment')}
              </Button>
              <Button 
                variant={orderStatusFilter === '2' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setOrderStatusFilter('2')}
                className={`
                  rounded-full font-medium
                  ${orderStatusFilter === '2' 
                    ? 'bg-green-500 text-white shadow-md' 
                    : 'bg-white/10 text-primary dark:text-white border-primary/20 dark:border-white/20 hover:bg-white/20 hover:border-primary/30 dark:hover:border-white/30'}
                `}
              >
                <Check size={16} className="mr-1.5" />
                {t('stadium-orders:filter.ready_for_pickup')}
              </Button>
            </div>
            
            {activeOrders.length > 0 ? (
              filteredActiveOrders.length > 0 ? (
                filteredActiveOrders.map((order) => (
                  <div 
                    key={order.id}
                    className="bg-background-overlay rounded-lg p-4 shadow-sm"
                  >
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <h3 className="font-medium text-primary dark:text-white">Pedido #{order.id}</h3>
                        <p className="text-sm text-primary/70 dark:text-white/70">{order?.establishment_name}</p>
                      </div>
                      <div className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(order.status_id)}`}>
                        {getStatusName(order.status_id)}
                      </div>
                    </div>
                    
                    <div className="divide-y divide-gray-100 dark:divide-gray-800">
                      {order.products.map((item, idx) => (
                        <div key={idx} className="py-2 flex justify-between">
                          <span className="text-primary/80 dark:text-white/80">
                            {item.quantity}x {item.product_name}
                          </span>
                          <div className="text-right">
                            <p className="font-medium text-primary dark:text-white">
                              R$ {(item.value_real * item.quantity).toFixed(2)}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                    
                    <div className="mt-3 pt-3 border-t border-gray-100 dark:border-gray-800">
                      <div className="flex justify-between items-center">
                        <div>
                          <p className="text-primary/70 dark:text-white/70 text-sm">{t('stadium-orders:total')}</p>
                          <p className="font-bold text-lg text-primary dark:text-white">
                            R$ {order.total_real.toFixed(2)}
                          </p>
                        </div>
                        
                        <div className="text-right">
                          <p className="text-primary/70 dark:text-white/70 text-sm">{t('stadium-orders:pickupLocation')}</p>
                          <p className="font-medium text-primary dark:text-white">{order?.establishment_name || 'sem local de retirada'}</p>
                        </div>
                      </div>
                      
                      {/* Botão de pagamento para ordens com status_id igual a 1 */}
                      {order.status_id === 1 && (
                        <Button
                          className="w-full mt-4"
                          onClick={() => handlePayment(order)}
                          disabled={processingPayment}
                        >
                          {processingPayment ? (
                            <>
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                              {t('stadium-orders:payment.processingPayment')}
                            </>
                          ) : (
                            <>
                              <CreditCard className="mr-2 h-4 w-4" />
                              {t('stadium-orders:button.payNow')}
                            </>
                          )}
                        </Button>
                      )}
                      
                      {/* Exibir hash da transação para pedidos pagos (status 2) */}
                      {order.status_id === 2 && order.transaction_hash && (
                        <div className="mt-4 bg-[#071e36] dark:bg-[#071e36] p-3 rounded-lg">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center">
                    
                                <div className="flex items-center text-xs text-gray-400">
                                  <span className="inline-flex items-center">
                                    <Receipt size={12} className="mr-1" />
                                    {order.transaction_hash.length > 16 
                                      ? `${order.transaction_hash.substring(0, 8)}...${order.transaction_hash.substring(order.transaction_hash.length - 8)}` 
                                      : order.transaction_hash}
                                  </span>
                                  <a 
                                    href={`${BLOCK_EXPLORER_URL}tx/${order.transaction_hash}`} 
                                    target="_blank" 
                                    rel="noopener noreferrer"
                                    className="ml-2 inline-flex items-center text-blue-400 hover:text-blue-300"
                                    onClick={(e) => e.stopPropagation()}
                                  >
                                    <ExternalLink size={17} className="mr-1" />
                                    {t('stadium-orders:button.explore')}
                                  </a>
                                </div>
                            
                            </div>
                            <div className="text-right">
                              <p className="text-xs text-gray-400">
                                {new Date().toLocaleDateString()}
                              </p>
                            </div>
                          </div>
                        </div>
                      )}
                      
                      {/* Estimated time or other info */}
                      {order.status === 'PROCESSING' && (
                        <div className="mt-3 bg-blue-50 dark:bg-blue-900/20 p-3 rounded-md text-sm">
                          <p className="text-blue-700 dark:text-blue-300">
                            {t('stadium-orders:counter.estimatedTime')}: {order?.estimated_time || t('stadium-orders:counter.noEstimatedTime')}
                          </p>
                        </div>
                      )}
                      
                      {/* Ready for pickup message */}
                      {order.status === 'READY' && (
                        <div className="mt-3 bg-green-50 dark:bg-green-900/20 p-3 rounded-md text-sm">
                          <p className="text-green-700 dark:text-green-300 font-medium">
                            {t('stadium-orders:counter.readyForPickup')}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                ))
              ) : (
                <div className="bg-background-overlay rounded-lg p-6 text-center shadow-sm">
                  <p className="text-primary/70 dark:text-white/70">{t('stadium-orders:noOrdersWithStatus')}</p>
                </div>
              )
            ) : (
              <div className="bg-background-overlay rounded-lg p-6 text-center shadow-sm">
                <p className="text-primary/70 dark:text-white/70">{t('stadium-orders:noActiveOrders')}</p>
                <Button 
                  variant="secondary" 
                  className="mt-4" 
                  onClick={() => setCurrentView('establishments')}
                >
                  {t('stadium-orders:button.makeOrder')}
                </Button>
              </div>
            )}
          </div>
        )}

        {/* Confirmation View */}
        {currentView === 'confirmation' && order && (
          <div className="space-y-4">
            <div className="flex flex-col items-center justify-center py-8">
              <div className="w-16 h-16 rounded-full bg-green-100 dark:bg-green-900 flex items-center justify-center mb-4">
                <Check size={32} className="text-green-600 dark:text-green-400" />
              </div>
              
              <h2 className="text-xl font-bold text-primary dark:text-white mb-2">
                {t('stadium-orders:orderConfirmed')}
              </h2>
              
              <p className="text-primary/70 dark:text-white/70 text-center mb-4">
                {t('stadium-orders:orderSuccessMessage', { id: order.id })}
              </p>
              
              <div className="bg-background-overlay rounded-lg p-4 shadow-sm w-full max-w-md">
                <h3 className="font-medium text-primary dark:text-white mb-3">
                  {t('stadium-orders:orderDetails')}
                </h3>
                
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-primary/70 dark:text-white/70">{t('stadium-orders:orderNumber')}:</span>
                    <span className="font-medium text-primary dark:text-white">{order.id}</span>
                  </div>
                  
                  <div className="flex justify-between">
                    <span className="text-primary/70 dark:text-white/70">{t('stadium-orders:establishment')}:</span>
                    <span className="font-medium text-primary dark:text-white">{order.establishment_name}</span>
                  </div>
                  
                  <div className="flex justify-between">
                    <span className="text-primary/70 dark:text-white/70">{t('stadium-orders:statusLabel')}:</span>
                    <span className="font-medium text-green-600 dark:text-green-400">{t('stadium-orders:status.awaiting_payment')}</span>
                  </div>
                  
                  <div className="flex justify-between">
                    <span className="text-primary/70 dark:text-white/70">{t('stadium-orders:totalValue')}:</span>
                    <span className="font-bold text-primary dark:text-white">R$ {order.total_real?.toFixed(2)}</span>
                  </div>
                  
                  <div className="flex justify-between">
                    <span className="text-primary/70 dark:text-white/70">{t('stadium-orders:pickupLocation')}:</span>
                    <span className="font-medium text-primary dark:text-white">{order.establishment_name || 'Balcão #' + order.id}</span>
                  </div>
                </div>

                {/* Botão de pagamento */}
                <Button
                  className="w-full mt-6"
                  onClick={() => handlePayment(order)}
                  disabled={processingPayment}
                >
                  {processingPayment ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      {t('stadium-orders:payment.processingPayment')}
                    </>
                  ) : (
                    <>
                      <CreditCard className="mr-2 h-4 w-4" />
                      {t('stadium-orders:button.payNow')}
                    </>
                  )}
                </Button>
              </div>
              
              <div className="mt-8 flex flex-col sm:flex-row gap-4 w-full max-w-md">
                <Button 
                  className="flex-1"
                  variant="outline"
                  onClick={() => navigate(`/clubs/${clubId}`)}
                >
                  <ArrowLeft size={16} className="mr-2 dark:text-white" />
                  <span className="dark:text-white">{t('stadium-orders:button.returnToGame')}</span>
                </Button>
                
                <Button 
                  className="flex-1"
                  onClick={() => handleViewActiveOrders()}
                >
                  <Clock size={16} className="mr-2" />
                  {t('stadium-orders:button.viewOrders')}
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Modal de seleção de método de pagamento */}
      {showPaymentModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-[#000000] rounded-lg w-full max-w-md overflow-hidden shadow-xl">
            <div className="p-5">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-bold text-primary dark:text-white">
                  {t('stadium-orders:payment.selectMethod')}
                </h3>
                <Button variant="ghost" size="icon" onClick={() => setShowPaymentModal(false)}>
                  <X size={18} />
                </Button>
              </div>
              
              <div className="space-y-3 mb-4">
                {/* PIX - desabilitado */}
                <div 
                  className="bg-background-overlay rounded-lg p-4 flex items-center border border-gray-200 dark:border-gray-800 opacity-50 cursor-not-allowed"
                >
                  <div className="w-10 h-10 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center mr-3">
                    <span className="text-green-600 dark:text-green-500 font-bold">PIX</span>
                  </div>
                  <div>
                    <p className="font-medium text-primary dark:text-white">Pix</p>
                    <p className="text-sm text-primary/70 dark:text-white/70">{t('stadium-orders:payment.instantPayment')}</p>
                  </div>
                </div>
                
                {/* Cartão - desabilitado */}
                <div 
                  className="bg-background-overlay rounded-lg p-4 flex items-center border border-gray-200 dark:border-gray-800 opacity-50 cursor-not-allowed"
                >
                  <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center mr-3">
                    <CreditCard size={20} className="text-blue-600 dark:text-blue-500" />
                  </div>
                  <div>
                    <p className="font-medium text-primary dark:text-white">{t('stadium-orders:payment.creditCard')}</p>
                    <p className="text-sm text-primary/70 dark:text-white/70">{t('stadium-orders:payment.availableCards')}</p>
                  </div>
                </div>
                
                {/* Stablecoin - ativo */}
                <div 
                  className="bg-background-overlay rounded-lg p-4 flex items-center border border-primary dark:border-primary cursor-pointer hover:bg-primary/5 dark:hover:bg-primary/10 transition-colors"
                  onClick={() => handlePayment(order)}
                >
                  <div className="w-10 h-10 rounded-full bg-yellow-100 dark:bg-yellow-900/30 flex items-center justify-center overflow-hidden mr-3">
                    {selectedStablecoin?.image ? (
                      <img 
                        src={selectedStablecoin.image} 
                        alt={selectedStablecoin.symbol || 'Stablecoin'} 
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.style.display = 'none';
                          e.target.parentNode.innerHTML = '<div class="text-yellow-600 dark:text-yellow-500 font-bold">$</div>';
                        }}
                      />
                    ) : (
                      <div className="text-yellow-600 dark:text-yellow-500 font-bold">$</div>
                    )}
                  </div>
                  <div>
                    <p className="font-medium text-primary dark:text-white">{t('stadium-orders:payment.stablecoin')}</p>
                    <p className="text-sm text-primary/70 dark:text-white/70">{t('stadium-orders:payment.stablecoinDesc')}</p>
                  </div>
                </div>
              </div>
              
              <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-800">
                <div className="flex justify-between items-center">
                  <span className="text-primary/70 dark:text-white/70">{t('stadium-orders:totalToPay')}:</span>
                  <span className="font-bold text-lg text-primary dark:text-white">
                    R$ {order?.total_real?.toFixed(2) || '0.00'}
                  </span>
                </div>
              </div>
              <Button 
                className="w-full mt-2 text-foreground"
                variant="outline"
                onClick={() => setShowPaymentModal(false)}
              >
                {t('stadium-orders:button.cancel')}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de seleção de stablecoin */}
      {showStablecoinModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-[#000000] rounded-lg w-full max-w-md overflow-hidden shadow-xl">
            <div className="p-5">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-bold text-primary dark:text-white">
                  {t('stadium-orders:payment.selectStablecoin')}
                </h3>
                <Button variant="ghost" size="icon" onClick={() => setShowStablecoinModal(false)}>
                  <X size={18} />
                </Button>
              </div>
              
              <div className="mt-4 mb-4">
                <h4 className="font-medium text-primary dark:text-white mb-3">{t('stadium-orders:payment.availableStablecoins')}</h4>
                
                {stablecoins.length > 0 ? (
                  <div className="space-y-2">
                    {stablecoins.map((coin) => (
                      <div 
                        key={coin.id}
                        className={`bg-background-overlay rounded-lg p-4 flex items-center border ${
                          coin.id === 3 
                            ? 'border-primary dark:border-primary cursor-pointer hover:bg-primary/5 dark:hover:bg-primary/10' 
                            : 'border-gray-200 dark:border-gray-800 opacity-50 cursor-not-allowed'
                        } transition-colors`}
                        onClick={() => coin.id === 3 && setSelectedStablecoin(coin)}
                      >
                        <div className="mr-3 w-10 h-10 rounded-full bg-yellow-100 dark:bg-yellow-900/30 flex items-center justify-center overflow-hidden">
                          {coin.image ? (
                            <img 
                              src={coin.image} 
                              alt={coin.symbol || 'Stablecoin'} 
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                e.target.onerror = null;
                                e.target.style.display = 'none';
                                e.target.parentNode.innerHTML = '<div class="text-yellow-600 dark:text-yellow-500 font-bold">$</div>';
                              }}
                            />
                          ) : (
                            <div className="text-yellow-600 dark:text-yellow-500 font-bold">$</div>
                          )}
                        </div>
                        <div>
                          <p className="font-medium text-primary dark:text-white">{coin.name || 'Stablecoin'}</p>
                          <p className="text-sm text-primary/70 dark:text-white/70">{coin.symbol || 'USDT'}</p>
                        </div>
                        {coin.id === 3 && selectedStablecoin?.id === coin.id && (
                          <div className="ml-auto">
                            <Check className="text-primary dark:text-primary h-5 w-5" />
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-primary/70 dark:text-white/70">{t('stadium-orders:noEstablishments')}</p>
                )}
                
                <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-800">
                  <div className="flex justify-between items-center">
                    <span className="text-primary/70 dark:text-white/70">{t('stadium-orders:totalToPay')}:</span>
                    <span className="font-bold text-lg text-primary dark:text-white">
                      R$ {order?.total_real?.toFixed(2) || '0.00'}
                    </span>
                  </div>
                </div>
              </div>
              
              <Button 
                className="w-full mt-6"
                onClick={() => handlePayment(order)}
                disabled={processingPayment || !selectedStablecoin}
              >
                {processingPayment ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    {t('stadium-orders:payment.processingPayment')}
                  </>
                ) : (
                  t('stadium-orders:button.confirmPayment')
                )}
              </Button>
              
              <Button 
                className="w-full mt-2 text-foreground"
                variant="outline"
                onClick={() => setShowStablecoinModal(false)}
              >
                {t('stadium-orders:button.cancel')}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de saldo insuficiente */}
      {showInsufficientFundsModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-[#000000] rounded-lg w-full max-w-md overflow-hidden shadow-xl">
            <div className="p-5">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-bold text-primary dark:text-white">
                  {t('stadium-orders:payment.insufficient.title')}
                </h3>
                <Button variant="ghost" size="icon" onClick={() => setShowInsufficientFundsModal(false)}>
                  <X size={18} />
                </Button>
              </div>
              
              <div className="mb-6">
                <div className="flex items-center justify-center mb-4">
                  <div className="w-16 h-16 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
                    <AlertCircle size={32} className="text-red-600 dark:text-red-400" />
                  </div>
                </div>
                
                <p className="text-center text-primary dark:text-white mb-2">
                  {t('stadium-orders:payment.insufficient.message')}
                </p>
                
                <div className="bg-background-overlay rounded-lg p-4 my-4">
                  <div className="flex justify-between items-center">
                    <span className="text-primary/70 dark:text-white/70">{t('stadium-orders:payment.insufficient.currentBalance')}:</span>
                    <span className="font-medium text-primary dark:text-white">
                      {stablecoinBalance?.balance || '0.0'} {stablecoinBalance?.symbol || 'BRZ'}
                    </span>
                  </div>
                  <div className="flex justify-between items-center mt-2">
                    <span className="text-primary/70 dark:text-white/70">{t('stadium-orders:payment.insufficient.requiredAmount')}:</span>
                    <span className="font-medium text-primary dark:text-white">
                      R$ {order?.total_real?.toFixed(2) || '0.00'}
                    </span>
                  </div>
                </div>
                
                <p className="text-sm text-primary/70 dark:text-white/70 text-center">
                  {t('stadium-orders:payment.insufficient.advice')}
                </p>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-3">
                <Button 
                  variant="outline" 
                  onClick={() => setShowInsufficientFundsModal(false)}
                  className="flex-1"
                >
                  {t('stadium-orders:button.cancel')}
                </Button>
                <Button 
                  onClick={() => {
                    setShowInsufficientFundsModal(false);
                    navigate('/tokens?type=stablecoin');
                  }}
                  className="flex-1"
                >
                  {t('stadium-orders:button.buyBRZ')}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Fixed Cart Button */}
      {(currentView === 'menu' && cart.length > 0) && (
        <div className="fixed bottom-0 left-0 right-0 bg-background-overlay p-4 shadow-lg border-t border-gray-100 dark:border-gray-800">
          <div className="container mx-auto">
            <Button 
              className="w-full" 
              size="lg"
              onClick={handleViewCart}
            >
              <ShoppingCart size={18} className="mr-2" />
              {t('stadium-orders:button.viewCart_items', { 
                count: cart.reduce((total, item) => total + item.quantity, 0),
                total: calculateTotal().toFixed(2)
              })}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
} 