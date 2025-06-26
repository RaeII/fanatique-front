import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useWalletContext } from '../hooks/useWalletContext';
import { 
  Loader2, 
  ArrowLeft, 
  TrendingUp,
  TrendingDown,
  Calendar,
  Trophy,
  Clock,
  Filter,
  RefreshCw,
  ExternalLink,
  Users,
  Sparkles,
  Star,
  Circle
} from 'lucide-react';
import { Button } from '../components/ui/button';
import { showError, showSuccess } from '../lib/toast';
import userBetsApi from '../api/userBets';
import matchApi from '../api/match';
import cardSystem from '../utils/cardSystem';

export default function MyBetsPage() {
  const navigate = useNavigate();
  const { isAuthenticated, isInitialized, getUserData, account: walletAddress } = useWalletContext();
  const [loading, setLoading] = useState(true);
  const [userBets, setUserBets] = useState([]);
  const [filteredBets, setFilteredBets] = useState([]);
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [refreshing, setRefreshing] = useState(false);
  const [matchesData, setMatchesData] = useState({});
  const [loadingMatches, setLoadingMatches] = useState(false);
  const [betCards, setBetCards] = useState({}); // Cartas por aposta

  // Função para carregar apostas do usuário
  const loadUserBets = async () => {
    try {
      const response = await userBetsApi.getMyBets({ limit: 100 });
      if (response.status === 'SUCCESS' && response.content) {
        setUserBets(response.content);
        setFilteredBets(response.content);
        
        // Carregar dados das partidas
        await loadMatchesData(response.content);
        
        // Carregar cartas das apostas
        await loadBetCards(response.content);
      }
    } catch (error) {
      console.error('Erro ao carregar apostas do usuário:', error);
      showError('Erro ao carregar suas apostas');
      setUserBets([]);
      setFilteredBets([]);
    }
  };

  // Função para carregar cartas das apostas
  const loadBetCards = async (bets) => {
    if (!walletAddress) return;
    
    try {
      const cardsData = {};
      
      bets.forEach(bet => {
        const cards = cardSystem.getCardsUsedInBet(walletAddress, bet);
        if (cards.length > 0) {
          cardsData[bet.id] = cards;
        }
      });
      
      setBetCards(cardsData);
    } catch (error) {
      console.error('Erro ao carregar cartas das apostas:', error);
    }
  };

  // Função para carregar dados das partidas
  const loadMatchesData = async (bets) => {
    try {
      setLoadingMatches(true);
      const matchIds = [...new Set(bets.map(bet => bet.match_id).filter(Boolean))];
      const matchesInfo = {};
      
      for (const matchId of matchIds) {
        try {
          const matchData = await matchApi.getMatchById(matchId);
          if (matchData) {
            matchesInfo[matchId] = matchData;
          }
        } catch (error) {
          console.error(`Erro ao carregar dados da partida ${matchId}:`, error);
        }
      }
      
      setMatchesData(matchesInfo);
    } catch (error) {
      console.error('Erro ao carregar dados das partidas:', error);
    } finally {
      setLoadingMatches(false);
    }
  };

  // Função para atualizar as apostas
  const handleRefresh = async () => {
    setRefreshing(true);
    await loadUserBets();
    setRefreshing(false);
    showSuccess('Apostas atualizadas!');
  };

  // Função para filtrar apostas
  const applyFilters = () => {
    let filtered = [...userBets];

    if (statusFilter !== 'all') {
      filtered = filtered.filter(bet => bet.status === statusFilter);
    }

    if (typeFilter !== 'all') {
      filtered = filtered.filter(bet => bet.bet_type === typeFilter);
    }

    setFilteredBets(filtered);
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

        // Load user bets
        await loadUserBets();
      } catch (error) {
        console.error('Error loading data:', error);
        showError('Falha ao carregar dados das apostas');
        navigate('/');
      } finally {
        setLoading(false);
      }
    };

    checkAuthAndLoadData();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated, navigate, getUserData]);

  // Aplicar filtros quando mudarem
  useEffect(() => {
    applyFilters();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [statusFilter, typeFilter, userBets]);

  const handleBackToDashboard = () => {
    navigate('/');
  };

  // Função para obter cor da raridade
  const getRarityColor = (rarity) => {
    switch (rarity) {
      case 'lendaria':
        return 'border-yellow-500/50 bg-yellow-500/10 text-yellow-400';
      case 'rara':
        return 'border-blue-500/50 bg-blue-500/10 text-blue-400';
      case 'comum':
        return 'border-gray-500/50 bg-gray-500/10 text-gray-400';
      default:
        return 'border-gray-500/50 bg-gray-500/10 text-gray-400';
    }
  };

  // Calcular estatísticas
  const stats = {
    total: userBets.length,
    pending: userBets.filter(bet => bet.status === 'pending').length,
    won: userBets.filter(bet => bet.status === 'won').length,
    lost: userBets.filter(bet => bet.status === 'lost').length,
    totalStaked: userBets.reduce((sum, bet) => sum + (Number(bet.bet_amount) || 0), 0),
    totalWon: userBets.filter(bet => bet.status === 'won').reduce((sum, bet) => sum + (Number(bet.potential_payout) || 0), 0)
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-4rem)] bg-background">
        <div className="flex flex-col items-center">
          <Loader2 className="h-12 w-12 animate-spin text-secondary" />
          <p className="mt-4 text-white/70">Carregando suas apostas...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-background">
      {/* Header */}
      <div className="relative gradientBackground overflow-hidden">
        <div className="container mx-auto px-4 py-10 relative z-10">
          {/* Back button */}
          <button
            onClick={handleBackToDashboard}
            className="flex items-center text-white/80 hover:text-white mb-6 transition-colors"
          >
            <ArrowLeft size={18} className="mr-1" />
            <span>Voltar</span>
          </button>

          {/* Title and Stats */}
          <div className="flex flex-col md:flex-row md:items-center md:justify-between">
            <div className="text-white">
              <h1 className="text-3xl font-bold mb-2 flex items-center">
                <Trophy className="mr-3" size={32} />
                Minhas Apostas
              </h1>
              <p className="text-white/80">
                Acompanhe todas as suas apostas e resultados
              </p>
            </div>
            
            {/* Refresh Button */}
            <div className="mt-4 md:mt-0">
              <Button
                onClick={handleRefresh}
                disabled={refreshing}
                className="bg-white/20 hover:bg-white/30 text-white border border-white/30 backdrop-blur-sm transition-all duration-300"
              >
                {refreshing ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <RefreshCw className="w-4 h-4 mr-2" />
                )}
                Atualizar
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
          <div className="bg-background-overlay rounded-xl p-4 text-center border border-white/5 backdrop-blur-sm">
            <div className="text-2xl font-bold text-primary mb-1">{stats.total}</div>
            <div className="text-sm text-white/60">Total</div>
          </div>
          <div className="bg-background-overlay rounded-xl p-4 text-center border border-white/5 backdrop-blur-sm">
            <div className="text-2xl font-bold text-yellow-400 mb-1">{stats.pending}</div>
            <div className="text-sm text-white/60">Pendentes</div>
          </div>
          <div className="bg-background-overlay rounded-xl p-4 text-center border border-white/5 backdrop-blur-sm">
            <div className="text-2xl font-bold text-green-400 mb-1">{stats.won}</div>
            <div className="text-sm text-white/60">Ganhas</div>
          </div>
          <div className="bg-background-overlay rounded-xl p-4 text-center border border-white/5 backdrop-blur-sm">
            <div className="text-2xl font-bold text-red-400 mb-1">{stats.lost}</div>
            <div className="text-sm text-white/60">Perdidas</div>
          </div>
          <div className="bg-background-overlay rounded-xl p-4 text-center border border-white/5 backdrop-blur-sm">
            <div className="text-2xl font-bold text-secondary mb-1">{stats.totalStaked.toFixed(2)}</div>
            <div className="text-sm text-white/60">CHIPS Apostados</div>
          </div>
          <div className="bg-background-overlay rounded-xl p-4 text-center border border-white/5 backdrop-blur-sm">
            <div className="text-2xl font-bold text-green-400 mb-1">{stats.totalWon.toFixed(2)}</div>
            <div className="text-sm text-white/60">CHIPS Ganhos</div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-background-overlay rounded-xl p-6 mb-8 border border-white/5 backdrop-blur-sm">
          <div className="flex items-center mb-4">
            <div className="w-2 h-2 bg-secondary rounded-full mr-3"></div>
            <h3 className="text-lg font-semibold text-white">Filtros</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-white/80 mb-2">
                Status
              </label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full px-4 py-2 border border-white/20 rounded-lg bg-black/40 text-white focus:outline-none focus:ring-2 focus:ring-secondary focus:border-secondary backdrop-blur-sm transition-all duration-300 [&>option]:bg-black [&>option]:text-white [&>option]:py-2"
              >
                <option value="all" className="bg-black text-white">Todos</option>
                <option value="pending" className="bg-black text-white">Pendentes</option>
                <option value="won" className="bg-black text-white">Ganhas</option>
                <option value="lost" className="bg-black text-white">Perdidas</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-white/80 mb-2">
                Tipo
              </label>
              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                className="w-full px-4 py-2 border border-white/20 rounded-lg bg-black/40 text-white focus:outline-none focus:ring-2 focus:ring-secondary focus:border-secondary backdrop-blur-sm transition-all duration-300 [&>option]:bg-black [&>option]:text-white [&>option]:py-2"
              >
                <option value="all" className="bg-black text-white">Todos</option>
                <option value="single" className="bg-black text-white">Simples</option>
                <option value="multiple" className="bg-black text-white">Múltipla</option>
              </select>
            </div>
          </div>
        </div>

        {/* Bets List */}
        {filteredBets.length > 0 ? (
          <div className="space-y-8">
            {filteredBets.map((bet) => (
              <div key={bet.id} className="bg-background-overlay rounded-xl p-6 border border-white/5 backdrop-blur-sm hover:border-white/10 transition-all duration-300 shadow-lg shadow-black/20 hover:shadow-xl hover:shadow-black/30">
                <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center mb-2">
                      <div className="text-lg font-semibold text-white mr-4">
                        {bet.bet_type === 'single' ? 'Aposta Simples' : 'Aposta Múltipla'}
                      </div>
     
                    </div>
                    <div className="flex items-center text-sm text-white/60 mb-1">
                      <Calendar size={16} className="mr-2" />
                      <span>{new Date(bet.created_at).toLocaleDateString('pt-BR')} às {new Date(bet.created_at).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}</span>
                    </div>
                    <div className="text-sm text-white/60">
                      {bet.details?.length || 0} seleção(ões)
                    </div>
                  </div>
                  
                  <div className="mt-3 lg:mt-0 lg:text-right">
                    <div className="grid grid-cols-3 lg:grid-cols-1 gap-3 lg:gap-2">
                      <div className="text-center lg:text-right">
                        <div className="text-xs text-white/60">Valor</div>
                        <div className="font-semibold text-white">{Number(bet.bet_amount || 0).toFixed(2)} CHIPS</div>
                      </div>
                      <div className="text-center lg:text-right">
                        <div className="text-xs text-white/60">Odd</div>
                        <div className="font-semibold text-primary">{Number(bet.total_odds || 0).toFixed(2)}</div>
                      </div>
                      <div className="text-center lg:text-right">
                        <div className="text-xs text-white/60">Retorno</div>
                        <div className="font-semibold text-secondary">
                          {Number(bet.potential_payout || 0).toFixed(2)} CHIPS
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Bet Details */}
                {bet.details && bet.details.length > 0 && (
                  <div className="border-t border-white/10 pt-4">
                    <h4 className="text-sm font-medium text-white mb-4 flex items-center">
                      <div className="w-1 h-1 bg-secondary rounded-full mr-2"></div>
                      Detalhes da Aposta:
                    </h4>
                    <div className="space-y-3">
                      {bet.details.map((detail, index) => (
                        <div key={index} className={`
                          relative p-4 rounded-xl border-2 transition-all duration-300 hover:scale-[1.02]
                          ${index % 2 === 0 
                            ? 'bg-gradient-to-r from-black/30 to-black/20 border-white/10 hover:border-secondary/30' 
                            : 'bg-gradient-to-r from-black/20 to-black/30 border-white/8 hover:border-primary/30'
                          }
                        `}>
                          {/* Indicador de número da seleção */}
                          <div className="absolute -top-2 -left-2 w-6 h-6 bg-secondary rounded-full flex items-center justify-center text-xs font-bold text-black border-2 border-white/20">
                            {index + 1}
                          </div>
                          
                          <div className="flex justify-between items-center">
                            <div className="flex items-center space-x-3">
                              <div className="w-2 h-8 bg-gradient-to-b from-secondary to-primary rounded-full opacity-60"></div>
                              <div>
                                <span className="text-white font-medium">
                                  Seleção {index + 1}
                                </span>
                                <div className="text-xs text-white/60 mt-1">
                                  {detail.description || 'Aposta esportiva'}
                                </div>
                              </div>
                            </div>
                            
                            <div className="flex items-center space-x-3">
                              <div className="text-right">
                                <div className="text-xs text-white/50 uppercase tracking-wide">Odd</div>
                                <div className="font-bold text-lg bg-gradient-to-r from-secondary to-primary bg-clip-text text-transparent">
                                  {Number(detail.odd_value || 0).toFixed(2)}
                                </div>
                              </div>
                              <div className="w-8 h-8 bg-secondary/20 rounded-full flex items-center justify-center border border-secondary/30">
                                <TrendingUp size={14} className="text-secondary" />
                              </div>
                            </div>
                          </div>
                          
                          {/* Linha separadora sutil para apostas múltiplas */}
                          {bet.details.length > 1 && index < bet.details.length - 1 && (
                            <div className="absolute -bottom-1.5 left-1/2 transform -translate-x-1/2 w-12 h-0.5 bg-gradient-to-r from-transparent via-white/20 to-transparent"></div>
                          )}
                        </div>
                      ))}
                    </div>
                    
                    {/* Total da aposta múltipla */}
                    {bet.details.length > 1 && (
                      <div className="mt-4 p-3 bg-gradient-to-r from-secondary/10 to-primary/10 rounded-lg border border-secondary/20">
                        <div className="flex justify-between items-center">
                          <span className="text-white/80 font-medium flex items-center">
                            <Users size={16} className="mr-2" />
                            Odd Total da Múltipla:
                          </span>
                          <span className="font-bold text-lg bg-gradient-to-r from-secondary to-primary bg-clip-text text-transparent">
                            {Number(bet.total_odds || 0).toFixed(2)}
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Cards Used */}
                {betCards[bet.id] && betCards[bet.id].length > 0 && (
                  <div className="border-t border-white/10 pt-4 mt-4">
                    <h4 className="text-sm font-medium text-white mb-3 flex items-center">
                      <Sparkles className="w-3 h-3 text-secondary mr-2" />
                      Cartas Utilizadas:
                    </h4>
                    
                    {/* Leque de Cartas */}
                    <div className="flex items-center space-x-2">
                      <div className="relative flex items-center">
                        {betCards[bet.id].map((card, index) => (
                          <div
                            key={`${card.id}-${index}`}
                            className="relative group"
                            style={{
                              transform: `rotate(${(index - (betCards[bet.id].length - 1) / 2) * 8}deg)`,
                              marginLeft: index > 0 ? '-16px' : '0px',
                              zIndex: betCards[bet.id].length - index
                            }}
                          >
                            <div className="w-12 h-16 rounded-lg overflow-hidden border-2 border-white/20 shadow-lg bg-gradient-to-br from-gray-800 to-gray-900 transition-all duration-300 hover:scale-110 hover:z-50">
                              <img
                                src={`/pack/${card.image_name}`}
                                alt={card.name}
                                className="w-full h-full object-cover"
                                onError={(e) => {
                                  // Fallback para gradiente com ícone se imagem não carregar
                                  e.target.style.display = 'none';
                                  e.target.parentElement.innerHTML = `
                                    <div class="w-full h-full flex items-center justify-center ${getRarityColor(card.rarity).split(' ')[1]} ${getRarityColor(card.rarity).split(' ')[2]}">
                                      <div class="text-center">
                                        ${card.rarity === 'lendaria' ? '🏆' : card.rarity === 'rara' ? '⭐' : '⚪'}
                                      </div>
                                    </div>
                                  `;
                                }}
                              />
                              
                              {/* Tooltip com nome da carta */}
                              <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-black/80 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity duration-300 whitespace-nowrap pointer-events-none z-50">
                                {card.name}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                      
                      {/* Badge com quantidade */}
                      <div className="ml-4 flex items-center space-x-2">
                        <div className="bg-secondary/20 border border-secondary/30 rounded-full px-2 py-1 text-xs text-secondary font-medium">
                          {betCards[bet.id].length} carta{betCards[bet.id].length > 1 ? 's' : ''}
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Match Info */}
                {bet.match_id && loadingMatches && (
                  <div className="border-t border-white/10 pt-4 mt-4">
                    <div className="flex items-center text-sm text-white/60">
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      <span>Carregando informações da partida...</span>
                    </div>
                  </div>
                )}
                
                {bet.match_id && !loadingMatches && matchesData[bet.match_id] && (
                  <div className="border-t border-white/10 pt-4 mt-4">
                    <div className="bg-black/20 rounded-lg p-4 border border-white/5">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <span className="font-medium text-white">
                            {matchesData[bet.match_id].home_club_name} x {matchesData[bet.match_id].away_club_name}
                          </span>
                        </div>
                        <Button
                          onClick={() => {
                            // Encontrar o clube relacionado à aposta (assumindo que é o home club por padrão)
                            const clubId = matchesData[bet.match_id].home_club_id;
                            navigate(`/game/${clubId}/${bet.match_id}`);
                          }}
                          className="bg-secondary/20 hover:bg-secondary/30 text-secondary border border-secondary/30 backdrop-blur-sm transition-all duration-300"
                          size="sm"
                        >
                          <ExternalLink size={14} className="mr-1" />
                          Ver Odds
                        </Button>
                      </div>
                    </div>
                  </div>
                )}
                
                {/* Fallback para quando não há dados da partida */}
                {bet.match_id && !loadingMatches && !matchesData[bet.match_id] && (
                  <div className="border-t border-white/10 pt-4 mt-4">
                    <div className="flex items-center text-sm text-white/60">
                      <Clock size={16} className="mr-2" />
                      <span>Partida ID: {bet.match_id}</span>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <div className="bg-background-overlay rounded-xl p-8 border border-white/5 backdrop-blur-sm max-w-md mx-auto">
              <TrendingDown size={64} className="mx-auto text-white/30 mb-6" />
              <h3 className="text-xl font-semibold text-white mb-4">
                {userBets.length === 0 ? 'Nenhuma aposta encontrada' : 'Nenhuma aposta corresponde aos filtros'}
              </h3>
              <p className="text-white/60 mb-6">
                {userBets.length === 0 
                  ? 'Você ainda não fez nenhuma aposta. Que tal começar agora?'
                  : 'Tente ajustar os filtros para ver mais resultados.'
                }
              </p>
              {userBets.length === 0 && (
                <Button
                  onClick={() => navigate('/clubs')}
                  className="bg-gradient-to-r from-secondary to-primary hover:from-secondary/90 hover:to-primary/90 text-black font-semibold transition-all duration-300"
                >
                  <TrendingUp className="w-4 h-4 mr-2" />
                  Fazer Primeira Aposta
                </Button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 