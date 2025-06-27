import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useWalletContext } from '../hooks/useWalletContext';
import { 
  MapPin, 
  Loader2, 
  ArrowLeft, 
  Timer,
  TrendingUp,
  TrendingDown,
  GripVertical,
  Minimize2,
  Maximize2,
  X,
  Check,
  Sparkles,
  Shield,
  Target,
  Navigation
} from 'lucide-react';
import { Button } from '../components/ui/button';
import { showError, showSuccess } from '../lib/toast';
import clubApi from '../api/club';
import matchApi from '../api/match';
import oddsApi from '../api/odds';
import userBetsApi from '../api/userBets';
import { useTranslation } from 'react-i18next';
import CardSelectionModal from '../components/CardSelectionModal';
import cardSystem from '../utils/cardSystem';

export default function GamePage() {
  const navigate = useNavigate();
  const { clubId, gameId } = useParams();
  const { isAuthenticated, isInitialized, getUserData, account: walletAddress } = useWalletContext();
  const [loading, setLoading] = useState(true);
  const [gameInfo, setGameInfo] = useState(null);
  const [selectedBets, setSelectedBets] = useState([]);
  const [bettingMarkets, setBettingMarkets] = useState([]);
  const [betAmount, setBetAmount] = useState(null);
  const [isPlacingBet, setIsPlacingBet] = useState(false);
  
  // Estados para drag do cupom
  const [isDragging, setIsDragging] = useState(false);
  const [dragPosition, setDragPosition] = useState({ x: 0 });
  const dragData = useRef({ startX: 0, initialX: 0 });
  const couponRef = useRef(null);
  
  // Estado para controlar se o cupom está minimizado
  const [isCouponMinimized, setIsCouponMinimized] = useState(false);

  // Estados para o sistema de cartas
  const [availableCards, setAvailableCards] = useState([]);
  const [selectedCards, setSelectedCards] = useState([]);
  const [isCardModalOpen, setIsCardModalOpen] = useState(false);
  const [cardAnimation, setCardAnimation] = useState(false);

  const { t } = useTranslation(['game', 'common']);

  // UTILITY FUNCTIONS FOR BETTING
  const calculateOdds = (selections) => {
    if (!selections || selections.length === 0) return 0;
    
    return selections.reduce((total, selection) => {
      // Support both 'odd' (selectedBets) and 'odd_value' (betData.details)
      const oddValue = selection.odd || selection.odd_value || 1;
      return total * oddValue;
    }, 1);
  };
  
  const calculatePayout = (amount, odds) => {
    if (!amount || amount <= 0 || !odds) return 0;
    return parseFloat((amount * odds).toFixed(2));
  };

  // Função para carregar mercados de apostas da API
  const loadBettingMarkets = async () => {
    try {
      const response = await oddsApi.getAllMarkets();
      if (response.status === 'SUCCESS' && response.content) {
        setBettingMarkets(response.content);
      }
    } catch (error) {
      console.error('Erro ao carregar mercados de apostas:', error);
      showError('Erro ao carregar mercados de apostas');
      // Fallback para dados mockados em caso de erro
      setBettingMarkets([]);
    }
  };

  // Carregar cartas disponíveis do usuário
  const loadUserCards = async () => {
    if (!walletAddress) return;
    
    try {
      const userCards = cardSystem.getAvailableCards(walletAddress);
      setAvailableCards(userCards);
      
      // Se o usuário não tem cartas, gera cartas de boas-vindas
      if (!userCards || userCards.length === 0) {
        const newCards = cardSystem.processNewUser(walletAddress, 'pt');
        setAvailableCards(newCards);
      }
    } catch (error) {
      console.error('Erro ao carregar cartas do usuário:', error);
    }
  };

  // Função para selecionar/deselecionar cartas
  const handleSelectCard = (card) => {
    if (!card) {
      // Remover todas as cartas
      setSelectedCards([]);
      showSuccess(t('game:betting.success.allCardsRemoved'));
      return;
    }

    const isCardSelected = selectedCards.some(c => c.id === card.id);
    
    if (isCardSelected) {
      // Remover carta específica
      setSelectedCards(selectedCards.filter(c => c.id !== card.id));
      showSuccess(t('game:betting.success.cardRemoved', { cardName: card.name }));
    } else {
      // Adicionar nova carta
      setSelectedCards([...selectedCards, card]);
      setCardAnimation(true);
      setTimeout(() => setCardAnimation(false), 1000);
      showSuccess(t('game:betting.success.cardAdded', { cardName: card.name }));
    }
  };

  // Função para processar a aposta
  const handlePlaceBet = async () => {
    if (!isAuthenticated) {
      showError(t('common:errors.auth_required'));
      return;
    }
    
    if (selectedBets.length === 0) {
      showError(t('game:betting.errors.selectAtLeastOne'));
      return;
    }
    
    if (!betAmount || betAmount <= 0) {
      showError(t('game:betting.errors.enterValidAmount'));
      return;
    }
    
    // Verificar o saldo será feito no backend agora
    
    const totalOdds = calculateOdds(selectedBets);
    const potentialPayout = calculatePayout(betAmount, totalOdds);
    
    // Verificar se todos os selectedBets têm match_id
    if (selectedBets.some(bet => !bet.match_id)) {
      showError(t('game:betting.errors.matchIdError'));
      return;
    }
    
    let betData = {
      bet_amount: betAmount, // Corrigido para bet_amount conforme esperado pelo backend
      total_odds: totalOdds, // Corrigido para total_odds conforme esperado pelo backend
      potential_payout: potentialPayout,
      match_id: parseInt(gameId), // Adicionar o ID da partida explicitamente
      bet_type: selectedBets.length > 1 ? 'multiple' : 'single', // Adicionar tipo de aposta
      details: selectedBets.map(bet => ({
        option_id: bet.option_id,
        odd_value: bet.odd
      }))
    };

    // Aplicar efeitos das cartas se alguma foi selecionada
    if (selectedCards.length > 0) {
      betData = cardSystem.applyMultipleCardEffects(selectedCards, betData);
    }
    
    try {
      setIsPlacingBet(true);
      const result = await userBetsApi.createBet(betData);

      // Se a aposta foi bem-sucedida e há cartas selecionadas, salvar o uso das cartas
      if (selectedCards.length > 0 && result && result.content && result.content.id) {
        const betId = result.content.id; // Usar o ID real da aposta retornado pela API
        
        selectedCards.forEach(card => {
          cardSystem.saveUsedCard(walletAddress, betId, card, betData);
        });
      }
      
      // Limpar seleção
      setSelectedBets([]);
      setBetAmount(null);
      setSelectedCards([]);
      
      showSuccess(t('game:betting.success.betPlaced'));
    } catch (error) {
      console.error("Erro ao realizar aposta:", error);
      showError(error.response?.data?.message || t('game:betting.errors.betError'));
    } finally {
      setIsPlacingBet(false);
    }
  };

  useEffect(() => {
    const checkAuthAndLoadData = async () => {
      try {
        if (isInitialized && !isAuthenticated) {
          navigate('/');
          return;
        }

        setLoading(true);

        // Get user data to verify authentication
        await getUserData();

        if (clubId && gameId) {
          // Load club data
          await fetchClubById(clubId);
          
          // Load game data
          await loadGameInfo(gameId);
          
          // Load betting markets
          await loadBettingMarkets();
          
          // Load user cards
          await loadUserCards();
        } else {
          // Redirect to dashboard if no clubId or gameId is provided
          navigate('/dashboard');
          return;
        }
      } catch (error) {
        console.error('Error loading data:', error);
        showError('Failed to load game data');
        navigate('/');
      } finally {
        setLoading(false);
      }
    };

    checkAuthAndLoadData();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated, navigate, getUserData, clubId, gameId]);

  const fetchClubById = async (id) => {
    try {
      // Get club details
      const clubData = await clubApi.getClubById(id);
      if (!clubData) {
        showError('Club not found');
        navigate('/');
      }
    } catch (error) {
      console.error('Error fetching club by ID:', error);
      showError('Failed to load club details');
      navigate('/');
    }
  };

  const loadGameInfo = async (id) => {
    try {
      const game = await matchApi.getMatchById(id);
      if (!game) {
        showError('Game not found');
        navigate(`/clubs/${clubId}`);
        return;
      }
      
      // Check if the current club is playing in this game
      const isParticipating = game.home_club_id === parseInt(clubId) || game.away_club_id === parseInt(clubId);
      
      if (!isParticipating) {
        showError('Your club is not participating in this game');
        navigate(`/clubs/${clubId}`);
        return;
      }
      
      // Check if the current club is the home team (for display purposes)
      const isHomeTeam = game.home_club_id === parseInt(clubId);
      
      setGameInfo({
        ...game,
        is_home_team: isHomeTeam
      });
    } catch (error) {
      console.error('Error loading game info:', error);
      showError('Failed to load game information');
      navigate(`/clubs/${clubId}`);
    }
  };

  const handleBackToDashboard = () => {
    navigate(`/`);
  };

  const handleBetSelection = (marketId, optionId) => {
    const betId = `${marketId}_${optionId}`;
    const existingBetIndex = selectedBets.findIndex(bet => bet.id === betId);
    
    if (existingBetIndex >= 0) {
      // Remove bet if already selected
      setSelectedBets(selectedBets.filter(bet => bet.id !== betId));
    } else {
      // Check if there's already a bet from the same market
      const existingMarketBet = selectedBets.find(bet => bet.marketId === marketId);
      const isReplacingBet = !!existingMarketBet;
      
      // Remove any existing bet from the same market before adding new one
      const betsWithoutSameMarket = selectedBets.filter(bet => bet.marketId !== marketId);
      
      // Add new bet
      const market = bettingMarkets.find(m => m.id === marketId);
      const option = market?.options?.find(o => o.id === optionId);
      
      if (market && option) {
        setSelectedBets([...betsWithoutSameMarket, {
          id: betId,
          match_id: parseInt(gameId), // Adicionar o ID da partida
          market_id: marketId, // Renomeado para corresponder ao formato esperado pela API
          option_id: optionId, // Renomeado para corresponder ao formato esperado pela API
          marketId,
          marketTitle: market.name,
          option: option.label,
          description: option.description || option.label,
          odd: 2.0 // Valor padrão já que a API não retorna odds ainda
        }]);

        // Show feedback message if replacing an existing bet
        if (isReplacingBet) {
          showSuccess(t('game:betting.success.betReplaced', { marketName: market.name }));
        }
      }
    }
  };

  const isBetSelected = (marketId, optionId) => {
    const betId = `${marketId}_${optionId}`;
    return selectedBets.some(bet => bet.id === betId);
  };

  // Funções para drag do cupom
  const handleMouseMove = useCallback((e) => {
    const deltaX = e.clientX - dragData.current.startX;
    const newX = dragData.current.initialX + deltaX;
    
    // Limites: permitir ir quase até o final mas manter parte visível
    const maxX = 0; // Não pode ir para a direita além da posição inicial
    const minX = -(window.innerWidth - 100); // Deixar pelo menos 100px do cupom visível à esquerda
    
    const finalX = Math.max(minX, Math.min(maxX, newX));
    
    setDragPosition({ x: finalX });
  }, []);

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
    document.removeEventListener('mousemove', handleMouseMove);
    document.removeEventListener('mouseup', handleMouseUp);
  }, [handleMouseMove]);

  const handleMouseDown = useCallback((e) => {
    if (e.target.closest('.drag-handle') || e.target.closest('.coupon-drag-area')) {
      setIsDragging(true);
      dragData.current.startX = e.clientX;
      dragData.current.initialX = dragPosition.x;
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      e.preventDefault();
    }
  }, [dragPosition.x, handleMouseMove, handleMouseUp]);

  const handleTouchMove = useCallback((e) => {
    const deltaX = e.touches[0].clientX - dragData.current.startX;
    const newX = dragData.current.initialX + deltaX;
    
    // Limites: permitir ir quase até o final mas manter parte visível
    const maxX = 0; // Não pode ir para a direita além da posição inicial
    const minX = -(window.innerWidth - 100); // Deixar pelo menos 100px do cupom visível à esquerda
    
    setDragPosition({ x: Math.max(minX, Math.min(maxX, newX)) });
    e.preventDefault();
  }, []);

  const handleTouchEnd = useCallback(() => {
    setIsDragging(false);
    document.removeEventListener('touchmove', handleTouchMove);
    document.removeEventListener('touchend', handleTouchEnd);
  }, [handleTouchMove]);

  const handleTouchStart = useCallback((e) => {
    if (e.target.closest('.drag-handle') || e.target.closest('.coupon-drag-area')) {
      setIsDragging(true);
      dragData.current.startX = e.touches[0].clientX;
      dragData.current.initialX = dragPosition.x;
      document.addEventListener('touchmove', handleTouchMove);
      document.addEventListener('touchend', handleTouchEnd);
      e.preventDefault();
    }
  }, [dragPosition.x, handleTouchMove, handleTouchEnd]);

  // Cleanup dos event listeners
  useEffect(() => {
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      document.removeEventListener('touchmove', handleTouchMove);
      document.removeEventListener('touchend', handleTouchEnd);
    };
  }, [handleMouseMove, handleMouseUp, handleTouchMove, handleTouchEnd]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-4rem)] bg-background">
        <div className="flex flex-col items-center">
          <Loader2 className="h-12 w-12 animate-spin text-secondary" />
          <p className="mt-4 text-text-adaptive/70 dark:text-white/70">{t('game:betting.loadingBets')}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-background">
      {/* Game Header */}
      <div className="relative gradientBackground overflow-hidden">
        {/* Blurred stadium background */}
        {gameInfo && gameInfo?.stadium?.image && (
          <div
            className="absolute inset-0 opacity-80 bg-no-repeat bg-center gradientBackground"
            style={{
              backgroundImage: `url(${gameInfo.stadium.image})`,
              backgroundSize: '150%',
              filter: 'blur(7px)'
            }}
          />
        )}
        <div className="container mx-auto px-4 py-10 relative z-10">
          {/* Back button */}
          <button
            onClick={handleBackToDashboard}
            className="flex items-center text-white/80 hover:text-white mb-6"
          >
            <ArrowLeft size={18} className="mr-1" />
            <span>{t('game:betting.backButton')}</span>
          </button>

          {/* Game Info */}
          {gameInfo && (
            <div className="text-white flex flex-col items-center text-center">
              <div className="relative flex items-center justify-center mb-4">
                <div className="flex items-center">
                  <div className="w-20 h-20 rounded-full bg-white/10 flex items-center justify-center mr-4">
                    {gameInfo?.home_club?.image ? (
                      <img 
                        src={gameInfo.home_club.image} 
                        alt={gameInfo.home_club.name} 
                        className="w-16 h-16 object-contain rounded-full"
                      />
                    ) : (
                      <div className="w-16 h-16 rounded-full bg-white/20" />
                    )}
                  </div>
                  <div className="text-4xl font-bold mx-6">
                    <span className="text-white/50">VS</span>
                  </div>
                  <div className="w-20 h-20 rounded-full bg-white/10 flex items-center justify-center ml-4">
                    {gameInfo?.away_club?.image ? (
                      <img 
                        src={gameInfo.away_club.image} 
                        alt={gameInfo.away_club.name} 
                        className="w-16 h-16 object-contain rounded-full"
                      />
                    ) : (
                      <div className="w-16 h-16 rounded-full bg-white/20" />
                    )}
                  </div>
                </div>
              </div>
              <div>
                <h1 className="text-2xl font-bold">{gameInfo.home_club_name} vs {gameInfo.away_club_name}</h1>
                <div className="flex items-center justify-center mt-2">
                  <MapPin size={18} className="text-white/70 mr-1" />
                  <span>{gameInfo.stadium_name}</span>
                </div>
                <div className="flex items-center justify-center mt-1">
                  <Timer size={18} className="text-white/70 mr-1" />
                  <span>{new Date(gameInfo.match_date).toLocaleDateString('pt-BR')}</span>
                </div>
              </div>
              <p className="mt-4 text-white/80 max-w-2xl mx-auto">
                {t('game:betting.makeBets')}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Betting Markets */}
      <div className="container mx-auto px-4 py-8">
        {bettingMarkets.length > 0 ? (
          <div className="space-y-8">
            {bettingMarkets.map((market) => (
              <div key={market.id} className="bg-background-overlay rounded-xl shadow-lg border border-white/5 overflow-hidden backdrop-blur-sm">
                <div className="bg-black/30 px-6 py-4 border-b border-white/10">
                  <h3 className="text-lg font-semibold text-white flex items-center">
                    <div className="w-2 h-2 bg-secondary rounded-full mr-3"></div>
                    {market.name}  
                  </h3>
                </div>
                
                <div className="p-6">
                  {market.type === 'single' && (
                    <div className="grid grid-cols-3 gap-4">
                      {market.options?.map((option) => (
                        <button
                          key={option.id}
                          onClick={() => handleBetSelection(market.id, option.id)}
                          className={`group relative p-4 rounded-lg border transition-all duration-300 hover:scale-[1.02] ${
                            isBetSelected(market.id, option.id)
                              ? 'border-secondary bg-secondary/10 shadow-lg shadow-secondary/20'
                              : 'border-white/10 bg-black/20 hover:border-secondary/50 hover:bg-black/40'
                          }`}
                        >
                          <div className="text-center">
                            <div className="text-sm font-bold text-white mb-2">
                              {option.label}
                            </div>
                            <div className="text-xs text-white/70 mb-3">
                              {option.description}
                            </div>
                            <div className="text-lg font-bold text-secondary">
                              2.00
                            </div>
                          </div>
                          {isBetSelected(market.id, option.id) && (
                            <div className="absolute top-2 right-2">
                              <div className="w-4 h-4 bg-secondary rounded-full flex items-center justify-center">
                                <Check size={12} className="text-black" />
                              </div>
                            </div>
                          )}
                        </button>
                      ))}
                    </div>
                  )}
                  
                  {market.type === 'over_under' && (
                    <div className="grid grid-cols-2 gap-4">
                      {market.options?.map((option) => (
                        <button
                          key={option.id}
                          onClick={() => handleBetSelection(market.id, option.id)}
                          className={`group relative p-5 rounded-lg border transition-all duration-300 hover:scale-[1.02] ${
                            isBetSelected(market.id, option.id)
                              ? 'border-secondary bg-secondary/10 shadow-lg shadow-secondary/20'
                              : 'border-white/10 bg-black/20 hover:border-secondary/50 hover:bg-black/40'
                          }`}
                        >
                          <div className="text-center">
                            <div className="text-base font-semibold text-white mb-3">
                              {option.label}
                            </div>
                            <div className="text-xl font-bold text-secondary">
                              2.00
                            </div>
                          </div>
                          {isBetSelected(market.id, option.id) && (
                            <div className="absolute top-2 right-2">
                              <div className="w-4 h-4 bg-secondary rounded-full flex items-center justify-center">
                                <Check size={12} className="text-black" />
                              </div>
                            </div>
                          )}
                        </button>
                      ))}
                    </div>
                  )}
                  
                  {market.type === 'multiple_over_under' && (
                    <div className="grid grid-cols-2 gap-3">
                      {market.options?.map((option) => (
                        <button
                          key={option.id}
                          onClick={() => handleBetSelection(market.id, option.id)}
                          className={`group relative p-4 rounded-lg border transition-all duration-300 hover:scale-[1.02] ${
                            isBetSelected(market.id, option.id)
                              ? 'border-secondary bg-secondary/10 shadow-lg shadow-secondary/20'
                              : 'border-white/10 bg-black/20 hover:border-secondary/50 hover:bg-black/40'
                          }`}
                        >
                          <div className="flex justify-between items-center">
                            <div className="text-sm font-medium text-white">
                              {option.label}
                            </div>
                            <div className="text-base font-bold text-secondary">
                              2.00
                            </div>
                          </div>
                          {isBetSelected(market.id, option.id) && (
                            <div className="absolute top-1 right-1">
                              <div className="w-3 h-3 bg-secondary rounded-full flex items-center justify-center">
                                <Check size={10} className="text-black" />
                              </div>
                            </div>
                          )}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <div className="bg-background-overlay rounded-xl p-8 border border-white/5">
              <TrendingDown size={64} className="mx-auto text-white/30 mb-6" />
              <h3 className="text-xl font-semibold text-white mb-4">
                {t('game:betting.noMarketsAvailable')}
              </h3>
              <p className="text-white/60 max-w-md mx-auto">
                {t('game:betting.noMarketsDescription')}
              </p>
            </div>
          </div>
        )}

        {/* Selected Bets Summary - Cupom de Apostas */}
        {selectedBets.length > 0 && (
          <>
            {/* Cupom Expandido */}
            {!isCouponMinimized && (
              <div 
                ref={couponRef}
                className={`coupon-drag-area fixed bottom-4 w-80 bg-background-overlay rounded-xl shadow-2xl border border-white/10 overflow-hidden z-50 transition-all duration-300 backdrop-blur-md ${
                  isDragging ? 'cursor-grabbing shadow-2xl scale-105' : 'cursor-grab'
                }`}
                style={{
                  right: '1rem',
                  transform: `translateX(${dragPosition.x}px)`,
                  transition: isDragging ? 'none' : 'transform 0.3s ease-out',
                  willChange: 'transform'
                }}
                onMouseDown={handleMouseDown}
                onTouchStart={handleTouchStart}
              >
                {/* Header */}
                <div className="bg-gradient-to-r from-secondary to-primary text-black px-4 py-3 flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="bg-black text-secondary rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold mr-3">
                      {selectedBets.length}
                    </div>
                    <span className="text-sm font-bold">{t('game:betting.betSlip')}</span>
                  </div>
                  <div className="flex items-center">
                    <button
                      onClick={() => setIsCouponMinimized(true)}
                      className="text-black/70 hover:text-black mr-2 p-1 rounded"
                      title={t('game:betting.minimizeCoupon')}
                    >
                      <Minimize2 size={14} />
                    </button>
                    <div className="drag-handle flex items-center cursor-grab active:cursor-grabbing">
                      <GripVertical size={16} className="text-black/60 hover:text-black/80" />
                      <GripVertical size={16} className="text-black/60 hover:text-black/80 -ml-2" />
                    </div>
                  </div>
                </div>
                
                {/* Bets List */}
                <div className="max-h-48 overflow-y-auto">
                  {selectedBets.map((bet) => (
                    <div key={bet.id} className="px-4 py-3 border-b border-white/5 last:border-b-0 bg-black/20">
                      <div className="flex justify-between items-center">
                        <div className="flex-1 pr-3">
                          <div className="text-xs font-semibold text-white truncate">
                            {bet.marketTitle}
                          </div>
                          <div className="text-xs text-white/60 truncate mt-1">
                            {bet.description}
                          </div>
                        </div>
                        <div className="text-sm font-bold text-secondary bg-secondary/10 px-2 py-1 rounded">
                          {bet.odd.toFixed(2)}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                
                {/* Footer with Total and Bet Button */}
                <div className="bg-black/40 px-4 py-4 border-t border-white/5">
                  {/* Card Selection Section - Múltiplas Cartas */}
                  {availableCards.length > 0 && (
                    <div className="mb-3">
                      {selectedCards.length > 0 ? (
                        <div className="space-y-2">
                          {/* Botão para gerenciar cartas */}
                          <button
                            onClick={() => setIsCardModalOpen(true)}
                            onMouseDown={(e) => e.stopPropagation()}
                            onTouchStart={(e) => e.stopPropagation()}
                            className="w-full p-2 rounded-lg border border-dashed border-secondary/50 hover:border-secondary transition-colors flex items-center justify-center text-secondary hover:text-secondary/80"
                          >
                            <Sparkles className="w-4 h-4 mr-2" />
                            <span className="text-sm">{t('game:betting.cards.manageCards', { count: selectedCards.length })}</span>
                          </button>
                          
                          {/* Lista de cartas selecionadas */}
                          <div className="space-y-1">
                            {selectedCards.map((card, index) => (
                              <div
                                key={`${card.id}-${index}`}
                                className={`
                                  p-2 rounded-lg border transition-all duration-300
                                  ${card.rarity === 'lendaria' ? 'border-yellow-500/50 bg-yellow-500/10' : 
                                    card.rarity === 'rara' ? 'border-purple-500/50 bg-purple-500/10' : 
                                    'border-blue-500/50 bg-blue-500/10'}
                                  ${cardAnimation && index === selectedCards.length - 1 ? 'scale-105 shadow-md' : ''}
                                `}
                              >
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center">
                                    <Sparkles className="w-3 h-3 text-secondary mr-2" />
                                    <span className="text-xs text-white font-medium">{card.name}</span>
                                  </div>
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleSelectCard(card);
                                    }}
                                    onMouseDown={(e) => e.stopPropagation()}
                                    className="text-xs text-white/40 hover:text-red-400 transition-colors px-1"
                                  >
                                    ×
                                  </button>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      ) : (
                        <button
                          onClick={() => setIsCardModalOpen(true)}
                          onMouseDown={(e) => e.stopPropagation()}
                          onTouchStart={(e) => e.stopPropagation()}
                          className="w-full p-2 rounded-lg border border-dashed border-white/30 hover:border-secondary/60 transition-colors flex items-center justify-center text-white/60 hover:text-white"
                        >
                          <Sparkles className="w-4 h-4 mr-2" />
                          <span className="text-sm">{t('game:betting.cards.useSpecialCards')}</span>
                        </button>
                      )}
                    </div>
                  )}

                  {/* Input para valor da aposta */}
                  <div className="mb-4">
                    <div className="flex items-center">
                      <input
                        type="number"
                        value={betAmount}
                        onChange={(e) => setBetAmount(Number(e.target.value))}
                        onMouseDown={(e) => e.stopPropagation()}
                        onTouchStart={(e) => e.stopPropagation()}
                        onClick={(e) => e.stopPropagation()}
                        onFocus={(e) => e.stopPropagation()}
                        min="1"
                        step="1"
                        className="flex-1 px-3 py-2 text-sm border border-white/20 rounded-lg bg-black/40 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-secondary focus:border-secondary backdrop-blur-sm"
                        placeholder={t('game:betting.betAmount')}
                      />
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs text-white/60">{t('game:betting.totalOdds')}:</span>
                    <span className="text-sm font-bold text-secondary">
                      {calculateOdds(selectedBets).toFixed(2)}
                    </span>
                  </div>
                  
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-xs text-white/60">{t('game:betting.possibleReturn')}:</span>
                    <span className="text-sm font-bold text-primary">
                      {calculatePayout(betAmount, calculateOdds(selectedBets)).toFixed(2)} CHIPS
                    </span>
                  </div>
                  
                  {/* Card Effect Indicator - Múltiplas Cartas */}
                  {selectedCards.length > 0 && (
                    <div className="mb-3 p-2 rounded-lg bg-secondary/10 border border-secondary/20">
                      <div className="flex items-center text-xs text-white/70">
                        <Sparkles className="w-3 h-3 text-secondary mr-2" />
                        <span>
                          {selectedCards.length === 1 
                            ? t('game:betting.cards.effect', { cardName: selectedCards[0].name })
                            : t('game:betting.cards.multipleEffects', { count: selectedCards.length })
                          }
                        </span>
                      </div>
                    </div>
                  )}
                  
                  <Button 
                    onClick={handlePlaceBet}
                    disabled={isPlacingBet || selectedBets.length === 0 || !betAmount || betAmount <= 0}
                    className="w-full bg-gradient-to-r from-secondary to-primary hover:from-secondary/90 hover:to-primary/90 disabled:from-white/20 disabled:to-white/20 text-black font-semibold text-sm py-3 mb-3 rounded-lg transition-all duration-300"
                  >
                    {isPlacingBet ? (
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    ) : (
                      <Check className="mr-2 h-4 w-4" />
                    )}
                    {betAmount ? t('game:betting.placeBetWithAmount', { amount: betAmount }) : t('game:betting.placeBet')}
                  </Button>
                  
                  {/* Indicador visual de movimento */}
                  <div className="flex justify-center">
                    <div className="flex space-x-1">
                      <div className="w-6 h-1 bg-white/20 rounded-full"></div>
                      <div className="w-2 h-1 bg-white/30 rounded-full"></div>
                      <div className="w-2 h-1 bg-white/30 rounded-full"></div>
                    </div>
                  </div>
                  <div className="text-center mt-2">
                    <span className="text-xs text-white/40">
                      {t('game:betting.dragToPosition')}
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* Cupom Minimizado */}
            {isCouponMinimized && (
              <div className="fixed bottom-4 right-4 z-50">
                <div className="bg-gradient-to-r from-secondary to-primary rounded-xl shadow-2xl border border-white/20 backdrop-blur-md">
                  <button
                    onClick={() => setIsCouponMinimized(false)}
                    className="w-full hover:scale-[1.02] text-black p-4 transition-all duration-300 rounded-xl"
                    title={t('game:betting.expandCoupon')}
                  >
                    <div className="flex items-center justify-between min-w-[200px]">
                      <div className="flex items-center">
                        <div className="bg-black text-secondary rounded-full w-7 h-7 flex items-center justify-center text-xs font-bold mr-3">
                          {selectedBets.length}
                        </div>
                        <div className="text-left">
                          <div className="text-sm font-bold">{t('game:betting.activeBets')}</div>
                          <div className="text-xs opacity-80">
                            Odd: {calculateOdds(selectedBets).toFixed(2)}
                          </div>
                        </div>
                      </div>
                      <Maximize2 size={18} className="ml-3" />
                    </div>
                  </button>
                  
                  <div className="px-4 pb-3">
                    <button
                      onClick={() => {
                        setSelectedBets([]);
                        setIsCouponMinimized(false);
                      }}
                      className="w-full text-xs text-black/70 hover:text-black py-1 transition-colors"
                      title={t('game:betting.clearAllBets')}
                    >
                                              {t('game:betting.clearBets')}
                    </button>
                  </div>
                </div>
                
                {/* Indicador pulsante */}
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-secondary rounded-full animate-ping"></div>
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-secondary rounded-full"></div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Card Selection Modal */}
      <CardSelectionModal
        isOpen={isCardModalOpen}
        onClose={() => setIsCardModalOpen(false)}
        availableCards={availableCards}
        onSelectCard={handleSelectCard}
        selectedCards={selectedCards}
      />
    </div>
  );
} 