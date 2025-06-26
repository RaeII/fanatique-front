import { Shield, Target, TrendingUp, Navigation, Sparkles, Info } from 'lucide-react';

const CardEffectIndicator = ({ selectedCard, betData }) => {
  if (!selectedCard) return null;

  const getCardIcon = (cardName) => {
    switch (cardName) {
      case 'Sem Risco':
        return <Shield className="w-4 h-4" />;
      case 'Última Chance':
        return <Target className="w-4 h-4" />;
      case 'Reconhecimento Extra':
        return <TrendingUp className="w-4 h-4" />;
      case 'Drible':
        return <Navigation className="w-4 h-4" />;
      case 'Margem de Erro':
        return <Sparkles className="w-4 h-4" />;
      default:
        return <Sparkles className="w-4 h-4" />;
    }
  };

  const getCardEffect = (cardName, betData) => {
    switch (cardName) {
      case 'Sem Risco':
        return 'Proteção total: Se perder, 100% do valor será devolvido';
      case 'Última Chance':
        return 'Flexibilidade: Pode alterar odds até o segundo tempo';
      case 'Reconhecimento Extra':
        return `Multiplicador: $REP será multiplicado por ${betData?.repMultiplier || 1.5}x`;
      case 'Drible':
        return betData?.bet_type === 'multiple' ? 
          'Tolerância: Pode errar 1 palpite e ainda manter as odds' :
          'Carta aplicável apenas a apostas múltiplas';
      case 'Margem de Erro':
        return 'Flexibilidade: Margem de erro de 1 unidade em over/under';
      default:
        return 'Efeito especial ativado';
    }
  };

  const getRarityColor = (rarity) => {
    switch (rarity) {
      case 'lendaria':
        return 'from-yellow-500 to-orange-500';
      case 'rara':
        return 'from-purple-500 to-pink-500';
      case 'comum':
        return 'from-blue-500 to-cyan-500';
      default:
        return 'from-gray-500 to-gray-600';
    }
  };

  return (
    <div className="mb-3 p-3 rounded-lg bg-gradient-to-r from-secondary/10 to-primary/10 border border-secondary/20">
      <div className="flex items-center mb-2">
        <div className={`
          w-6 h-6 rounded-full bg-gradient-to-br ${getRarityColor(selectedCard.rarity)} 
          flex items-center justify-center mr-2
        `}>
          {getCardIcon(selectedCard.name)}
        </div>
        <span className="text-xs font-semibold text-secondary">
          Efeito: {selectedCard.name}
        </span>
      </div>
      
      <div className="flex items-start">
        <Info className="w-3 h-3 text-white/60 mr-2 mt-0.5 flex-shrink-0" />
        <p className="text-xs text-white/70 leading-relaxed">
          {getCardEffect(selectedCard.name, betData)}
        </p>
      </div>
    </div>
  );
};

export default CardEffectIndicator; 