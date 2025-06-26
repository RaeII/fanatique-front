import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useWalletContext } from '../hooks/useWalletContext';
import { 
  ArrowLeft, 
  Loader2, 
  Star,
  Package,
  Trophy,
  Sparkles,
  Gift,
  Circle
} from 'lucide-react';
import { Button } from '../components/ui/button';
import { showError } from '../lib/toast';
import cardSystem from '../utils/cardSystem';
export default function CardsPage() {
  const navigate = useNavigate();
  const { isAuthenticated, isInitialized, account } = useWalletContext();
  const [loading, setLoading] = useState(true);
  const [userCards, setUserCards] = useState([]);
  const [cardStats, setCardStats] = useState(null);
  const [selectedCard, setSelectedCard] = useState(null);

  useEffect(() => {
    const checkAuthAndLoadCards = async () => {
      try {
        if (isInitialized && !isAuthenticated) {
          navigate('/app');
          return;
        }

        if (!account) {
          setLoading(false);
          return;
        }

        setLoading(true);

        // Carregar cartas do usuário
        const userData = cardSystem.getUserCards(account);

        if (userData && userData.cards) {
          setUserCards(userData.cards);
        }

        // Carregar estatísticas das cartas
        const stats = cardSystem.getUserCardStats(account);
        setCardStats(stats);

      } catch (error) {
        console.error('Erro ao carregar cartas:', error);
        showError('Erro ao carregar suas cartas');
      } finally {
        setLoading(false);
      }
    };

    checkAuthAndLoadCards();
  }, [isAuthenticated, isInitialized, account, navigate]);

  const handleBackToDashboard = () => {
    navigate('/dashboard');
  };



  const getRarityIcon = (rarity) => {
    switch (rarity) {
      case 'comum':
        return <Circle size={20} className="text-gray-400" />;
      case 'rara':
        return <Star size={20} className="text-blue-400" />;
      case 'lendaria':
        return <Trophy size={20} className="text-yellow-400" />;
      default:
        return <Circle size={20} className="text-gray-400" />;
    }
  };

  const getRarityText = (rarity) => {
    switch (rarity) {
      case 'comum':
        return 'Comum';
      case 'rara':
        return 'Rara';
      case 'lendaria':
        return 'Lendária';
      default:
        return rarity;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-4rem)] bg-background">
        <div className="flex flex-col items-center">
          <Loader2 className="h-12 w-12 animate-spin text-secondary" />
          <p className="mt-4 text-text-adaptive/70 dark:text-white/70">Carregando suas cartas...</p>
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
            className="flex items-center text-white/80 hover:text-white mb-6"
          >
            <ArrowLeft size={18} className="mr-1" />
            <span>Voltar</span>
          </button>

          {/* Page Header */}
          <div className="text-white flex flex-col items-center text-center">
            <div className="relative flex items-center justify-center mb-4">
              <div className="w-20 h-20 rounded-full bg-white/10 flex items-center justify-center">
                <Sparkles size={40} className="text-secondary" />
              </div>
            </div>
            <div>
              <h1 className="text-3xl font-bold mb-2">Minhas Cartas</h1>
              <p className="text-white/80 max-w-2xl mx-auto">
                Gerencie sua coleção de cartas especiais e veja suas estatísticas
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Section */}
      {cardStats && (
        <div className="container mx-auto px-4 py-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-background-overlay rounded-2xl p-4 border border-white/5 backdrop-blur-sm shadow-lg hover:shadow-xl transition-all">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-white/60 text-sm">Total</p>
                  <p className="text-2xl font-bold text-white">{cardStats.total}</p>
                </div>
                <Package className="text-white/40" size={24} />
              </div>
            </div>
            
            <div className="bg-background-overlay rounded-2xl p-4 border border-white/5 backdrop-blur-sm shadow-lg hover:shadow-xl transition-all">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-white/60 text-sm">Lendárias</p>
                  <p className="text-2xl font-bold text-yellow-400">{cardStats.lendaria}</p>
                </div>
                <Trophy className="text-yellow-400" size={24} />
              </div>
            </div>
            
            <div className="bg-background-overlay rounded-2xl p-4 border border-white/5 backdrop-blur-sm shadow-lg hover:shadow-xl transition-all">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-white/60 text-sm">Raras</p>
                  <p className="text-2xl font-bold text-blue-400">{cardStats.rara}</p>
                </div>
                <Star className="text-blue-400" size={24} />
              </div>
            </div>
            
            <div className="bg-background-overlay rounded-2xl p-4 border border-white/5 backdrop-blur-sm shadow-lg hover:shadow-xl transition-all">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-white/60 text-sm">Comuns</p>
                  <p className="text-2xl font-bold text-gray-400">{cardStats.comum}</p>
                </div>
                <Circle className="text-gray-400" size={24} />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Cards Collection */}
      <div className="container mx-auto px-4 pb-8">
        {userCards.length > 0 ? (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-white">Sua Coleção</h2>
              <div className="text-sm text-white/60">
                {userCards.length} carta{userCards.length !== 1 ? 's' : ''}
              </div>
            </div>
            
            <div className="flex justify-center">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 max-w-5xl">
              {userCards.map((card, index) => (
                <div 
                  key={`${card.id}-${index}`}
                  className="group relative rounded-2xl overflow-hidden transition-all duration-300 hover:scale-[1.02] hover:shadow-xl cursor-pointer border border-white/10 shadow-lg"
                  onClick={() => setSelectedCard(card)}
                >
                  {/* Card Image */}
                  <div className="aspect-[9/11] bg-gradient-to-br from-gray-800 to-gray-900 relative overflow-hidden">
                    <img
                      src={`/pack/${card.image_name}`}
                      alt={card.name}
                      className="w-full h-full object-cover rounded-t-2xl"
                      onError={(e) => {
                        e.target.style.display = 'none';
                      }}
                    />
                  </div>

                  {/* Card Info */}
                  <div className="p-3 bg-black/40">
                    <h3 className="text-sm font-bold text-white mb-2 truncate">
                      {card.name}
                    </h3>
                    
                    {/* Attributes */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        {getRarityIcon(card.rarity)}
                        <span className="ml-1 text-xs text-white/80">
                          {getRarityText(card.rarity)}
                        </span>
                      </div>
                      <div className="text-xs text-white/60">
                        #{card.id}
                      </div>
                    </div>
                  </div>

                  {/* Rarity indicator */}
                  <div className={`absolute top-2 right-2 w-3 h-3 rounded-full ${
                    card.rarity === 'lendaria' ? 'bg-yellow-400' :
                    card.rarity === 'rara' ? 'bg-blue-400' :
                    'bg-gray-400'
                  }`} />

                  {/* Hover Effect */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                </div>
              ))}
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center py-16">
            <div className="bg-background-overlay rounded-2xl p-8 border border-white/5 shadow-lg">
              <div className="relative mb-6">
                <Gift size={64} className="mx-auto text-white/30" />
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent rounded-full animate-pulse"></div>
              </div>
              <h3 className="text-xl font-semibold text-white mb-4">
                Nenhuma carta encontrada
              </h3>
              <p className="text-white/60 max-w-md mx-auto mb-6 leading-relaxed">
                Você ainda não possui cartas em sua coleção. Complete missões e faça apostas para ganhar cartas especiais!
              </p>
              <Button
                onClick={() => navigate('/dashboard')}
                className="bg-gradient-to-r from-secondary to-primary hover:from-secondary/90 hover:to-primary/90 text-black font-semibold rounded-xl px-6 py-3 transition-all shadow-lg hover:shadow-xl"
              >
                Ir para Dashboard
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Card Detail Modal */}
      {selectedCard && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-background-overlay rounded-2xl max-w-md w-full mx-4 border border-white/10 backdrop-blur-md shadow-2xl overflow-hidden">
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-gray-800 to-gray-900 p-4 border-b border-white/10">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  {getRarityIcon(selectedCard.rarity)}
                  <span className="ml-2 font-bold text-white">
                    {getRarityText(selectedCard.rarity)}
                  </span>
                </div>
                <button
                  onClick={() => setSelectedCard(null)}
                  className="text-white/80 hover:text-white transition-colors p-1 hover:bg-white/20 rounded-full"
                >
                  <ArrowLeft size={20} />
                </button>
              </div>
            </div>

            {/* Modal Content */}
            <div className="p-6 text-center">
              <div className="mb-6 flex justify-center">
                
                <div className="relative"
      
                  
                >
                  <img
                    src={`/pack/${selectedCard.image_name}`}
                    alt={selectedCard.name}
                    className="h-60 w-auto object-contain rounded-2xl shadow-lg"
                    onError={(e) => {
                      e.target.style.display = 'none';
                    }}
                  
                  />

                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-2xl font-bold text-white leading-tight">
                  {selectedCard.name}
                </h3>
                <p className="text-white/80 leading-relaxed bg-white/5 rounded-xl p-3 border border-white/10">
                  {selectedCard.description}
                </p>
                <div className="pt-4 border-t border-white/10">
                  <div className="flex items-center justify-center gap-2">
                    <span className="text-sm text-white/60">Carta #{selectedCard.id}</span>
                    <span className="text-white/40">•</span>
                    <span className={`text-sm font-medium ${
                      selectedCard.rarity === 'lendaria' ? 'text-yellow-400' :
                      selectedCard.rarity === 'rara' ? 'text-blue-400' :
                      'text-gray-400'
                    }`}>
                      {getRarityText(selectedCard.rarity)}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-white/10 bg-black/20">
              <Button
                onClick={() => setSelectedCard(null)}
                className="w-full bg-gradient-to-r from-gray-600 to-gray-700 hover:from-gray-700 hover:to-gray-800 text-white font-medium rounded-xl py-3 transition-all"
              >
                Fechar
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 