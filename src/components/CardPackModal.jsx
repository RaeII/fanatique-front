import React, { useState, useEffect } from 'react';

const CardPackModal = ({ isOpen, onClose, cards = [] }) => {
  const [currentCardIndex, setCurrentCardIndex] = useState(0);

  useEffect(() => {
    if (isOpen && cards.length > 0) {
      setCurrentCardIndex(0);
    }
  }, [isOpen, cards]);

  if (!isOpen) return null;

  const handleNextCard = () => {
    if (currentCardIndex < cards.length - 1) {
      setCurrentCardIndex(currentCardIndex + 1);
    } else {
      onClose();
    }
  };

  const handlePrevCard = () => {
    if (currentCardIndex > 0) {
      setCurrentCardIndex(currentCardIndex - 1);
    }
  };

  const getRarityStyles = (rarity) => {
    switch (rarity) {
      case 'comum':
        return {
          border: 'border-gray-300',
          bg: 'bg-gradient-to-br from-gray-50 to-gray-100',
          shadow: 'shadow-gray-200',
          glow: 'shadow-lg shadow-gray-200/50'
        };
      case 'rara':
        return {
          border: 'border-blue-300',
          bg: 'bg-gradient-to-br from-blue-50 to-blue-100',
          shadow: 'shadow-blue-200',
          glow: 'shadow-xl shadow-blue-200/50'
        };
      case 'lendaria':
        return {
          border: 'border-yellow-300',
          bg: 'bg-gradient-to-br from-yellow-50 to-yellow-100',
          shadow: 'shadow-yellow-200',
          glow: 'shadow-2xl shadow-yellow-200/60'
        };
      default:
        return {
          border: 'border-gray-300',
          bg: 'bg-gradient-to-br from-gray-50 to-gray-100',
          shadow: 'shadow-gray-200',
          glow: 'shadow-lg shadow-gray-200/50'
        };
    }
  };

  const getRarityBadge = (rarity) => {
    switch (rarity) {
      case 'comum':
        return {
          bg: 'bg-gradient-to-r from-gray-400 to-gray-500',
          text: 'text-white',
          icon: '⚪'
        };
      case 'rara':
        return {
          bg: 'bg-gradient-to-r from-blue-400 to-blue-600',
          text: 'text-white',
          icon: '🔵'
        };
      case 'lendaria':
        return {
          bg: 'bg-gradient-to-r from-yellow-400 to-yellow-600',
          text: 'text-white',
          icon: '🟡'
        };
      default:
        return {
          bg: 'bg-gradient-to-r from-gray-400 to-gray-500',
          text: 'text-white',
          icon: '⚪'
        };
    }
  };

  const getRarityText = (rarity) => {
    switch (rarity) {
      case 'comum':
        return 'Common';
      case 'rara':
        return 'Rare';
      case 'lendaria':
        return 'Legendary';
      default:
        return rarity;
    }
  };

  const currentCard = cards[currentCardIndex];
  const rarityStyles = currentCard ? getRarityStyles(currentCard.rarity) : {};
  const rarityBadge = currentCard ? getRarityBadge(currentCard.rarity) : {};

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-lg w-full mx-4 overflow-hidden shadow-2xl transform transition-all">
        {/* Header com gradiente */}
        <div className="bg-gradient-to-r from-green-500 to-green-600 px-6 py-4 text-white">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold flex items-center gap-2">
                🎉 Cartas de Boas-vindas!
              </h2>
              <p className="text-green-100 text-sm mt-1">
                Você recebeu {cards.length} cartas especiais para começar sua jornada!
              </p>
            </div>
            <button
              onClick={onClose}
              className="text-white/80 hover:text-white transition-colors p-1 hover:bg-white/20 rounded-full"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Card Display */}
        <div className="p-6">
          {currentCard && (
            <div className="text-center">
              {/* Card Container */}
              <div className={`
                ${rarityStyles.border} ${rarityStyles.bg} ${rarityStyles.glow}
                border-2 rounded-2xl p-6 mb-6 transform transition-all duration-300 hover:scale-105
              `}>
                {/* Raridade Badge */}
                <div className="flex justify-center mb-4">
                  <span className={`
                    ${rarityBadge.bg} ${rarityBadge.text}
                    px-4 py-2 rounded-full text-sm font-bold shadow-lg flex items-center gap-2
                  `}>
                    <span className="text-lg">{rarityBadge.icon}</span>
                    {getRarityText(currentCard.rarity)}
                  </span>
                </div>

                {/* Card Image */}
                <div className="mb-6 flex justify-center">
                  <div className="relative">
                    <img
                      src={`/pack/${currentCard.image_name}`}
                      alt={currentCard.name}
                      className="w-48 h-48 object-contain rounded-2xl shadow-lg"
                      onError={(e) => {
                        e.target.style.display = 'none';
                      }}
                    />
                    {/* Efeito de brilho para cartas lendárias */}
                    {currentCard.rarity === 'lendaria' && (
                      <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-transparent via-yellow-200/30 to-transparent animate-pulse"></div>
                    )}
                  </div>
                </div>

                {/* Card Info */}
                <div className="space-y-3">
                  <h3 className="text-2xl font-bold text-gray-800 leading-tight">
                    {currentCard.name}
                  </h3>
                  <p className="text-gray-600 text-sm leading-relaxed bg-white/60 rounded-xl p-3 border border-gray-200">
                    {currentCard.description}
                  </p>
                </div>
              </div>

              {/* Card Counter com estilo melhorado */}
              <div className="flex justify-center mb-6">
                <div className="bg-gray-100 rounded-full px-4 py-2 flex items-center gap-2">
                  <div className="flex gap-1">
                    {Array.from({ length: cards.length }, (_, i) => (
                      <div
                        key={i}
                        className={`w-2 h-2 rounded-full transition-all ${
                          i === currentCardIndex ? 'bg-green-500 scale-125' : 'bg-gray-300'
                        }`}
                      />
                    ))}
                  </div>
                  <span className="text-gray-600 text-sm font-medium ml-2">
                    {currentCardIndex + 1} de {cards.length}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="flex justify-between items-center gap-4">
            <button
              onClick={handlePrevCard}
              disabled={currentCardIndex === 0}
              className={`
                flex-1 px-4 py-3 rounded-xl font-medium transition-all flex items-center justify-center gap-2
                ${currentCardIndex === 0
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300 hover:shadow-md'
                }
              `}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Anterior
            </button>

            <button
              onClick={handleNextCard}
              className="flex-1 px-6 py-3 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-xl font-medium hover:from-green-600 hover:to-green-700 transition-all shadow-lg hover:shadow-xl flex items-center justify-center gap-2"
            >
              {currentCardIndex === cards.length - 1 ? (
                <>
                  Finalizar
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </>
              ) : (
                <>
                  Próxima
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CardPackModal; 