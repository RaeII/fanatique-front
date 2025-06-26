import { useState } from 'react';
import { X, Sparkles, Star, Trophy, Circle, Check } from 'lucide-react';
import { Button } from './ui/button';

const CardSelectionModal = ({ isOpen, onClose, availableCards, onSelectCard, selectedCards = [] }) => {
  const [hoveredCard, setHoveredCard] = useState(null);
  
  if (!isOpen) return null;

  // Verificar se uma carta está selecionada
  const isCardSelected = (cardId) => {
    return selectedCards.some(card => card.id === cardId);
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

  const getRarityDotColor = (rarity) => {
    switch (rarity) {
      case 'lendaria':
        return 'bg-yellow-400';
      case 'rara':
        return 'bg-blue-400';
      case 'comum':
        return 'bg-gray-400';
      default:
        return 'bg-gray-400';
    }
  };

  const handleCardSelect = (card) => {
    onSelectCard(card);
    // Não fechamos mais o modal automaticamente para permitir seleção múltipla
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-[100] p-4">
      <div className="bg-background-overlay rounded-2xl border border-white/10 shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-hidden">
        {/* Header - Minimalista */}
        <div className="px-6 py-4 border-b border-white/10 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-white">
            Selecionar Carta
          </h2>
          <button
            onClick={onClose}
            className="text-white/60 hover:text-white p-1 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-hidden">
          {availableCards.length === 0 ? (
            <div className="text-center py-12">
              <Sparkles className="w-12 h-12 text-white/30 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-white mb-2">
                Nenhuma carta disponível
              </h3>
              <p className="text-white/60">
                Você não possui cartas especiais no momento.
              </p>
            </div>
          ) : (
            <div className="max-h-96 overflow-y-auto overflow-x-hidden">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 p-1">
                {availableCards.map((card) => (
                  <div
                    key={card.id}
                    className={`
                      group relative rounded-2xl overflow-hidden transition-all duration-300 
                      hover:scale-[1.01] cursor-pointer border border-white/10 shadow-lg
                      ${isCardSelected(card.id) ? 'ring-2 ring-secondary' : ''}
                      ${hoveredCard?.id === card.id ? 'ring-1 ring-white/30' : ''}
                    `}
                    onClick={() => handleCardSelect(card)}
                    onMouseEnter={() => setHoveredCard(card)}
                    onMouseLeave={() => setHoveredCard(null)}
                  >
                  {/* Card Image */}
                  <div className="aspect-[9/11] bg-gradient-to-br from-gray-800 to-gray-900 relative overflow-hidden">
                    <img
                      src={`/pack/${card.image_name}`}
                      alt={card.name}
                      className="w-full h-full object-cover"
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
                  <div className={`absolute top-2 right-2 w-3 h-3 rounded-full ${getRarityDotColor(card.rarity)}`} />

                  {/* Selection indicator */}
                  {isCardSelected(card.id) && (
                    <div className="absolute top-2 left-2">
                      <div className="w-6 h-6 bg-secondary rounded-full flex items-center justify-center">
                        <Check className="w-4 h-4 text-black" />
                      </div>
                    </div>
                  )}

                  {/* Hover Effect */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                </div>
              ))}
              </div>
            </div>
          )}

          {/* Card Description Section - Altura Fixa */}
          {availableCards.length > 0 && (
            <div className="mt-6 pt-4 border-t border-white/10">
              <div className="bg-white/5 rounded-lg p-4 border border-white/10 h-24 flex flex-col justify-center">
                {hoveredCard ? (
                  <>
                    <div className="flex items-center mb-2">
                      <div className="flex items-center">
                        {getRarityIcon(hoveredCard.rarity)}
                        <span className="ml-2 font-semibold text-white">
                          {hoveredCard.name}
                        </span>
                      </div>
                      <div className="ml-auto">
                        <span className="text-xs text-white/60 bg-white/10 px-2 py-1 rounded-full">
                          {getRarityText(hoveredCard.rarity)}
                        </span>
                      </div>
                    </div>
                    <p className="text-white/80 text-sm leading-relaxed">
                      {hoveredCard.description}
                    </p>
                  </>
                ) : (
                  <div className="text-center text-white/40">
                    <Sparkles className="w-6 h-6 mx-auto mb-1 opacity-50" />
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="mt-6 pt-4 border-t border-white/10 flex justify-end space-x-3">
            {selectedCards.length > 0 && (
              <Button
                onClick={() => onSelectCard(null)}
                variant="outline"
                className="border-red-500/50 text-red-400 hover:bg-red-500/10 hover:text-red-300"
              >
                Remover Todas ({selectedCards.length})
              </Button>
            )}
            <Button
              onClick={onClose}
              className="bg-gradient-to-r from-secondary to-primary hover:from-secondary/90 hover:to-primary/90 text-black"
            >
              Concluir
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CardSelectionModal; 