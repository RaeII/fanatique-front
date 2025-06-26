//import { useNavigate } from 'react-router-dom';
import {  X, ChevronRight, TrendingUp } from 'lucide-react';
import { useTranslation } from 'react-i18next';
//import { Button } from './ui-v2/Button';

export default function MatchCard({ 
  match, 
  //club, 
  //isPast = false, 
  //isLive = false, 
  onClick 
}) {
  //const navigate = useNavigate();
  const { t } = useTranslation('matches');
  //const matchDate = new Date(match.date);

  return (
    <div 
      className="relative gradientBackground text-white rounded-lg p-4 mb-4 shadow-sm overflow-hidden cursor-pointer hover:shadow-lg hover:scale-[1.02] transition-all duration-300 group"
      onClick={onClick}
    >
      {/* Stadium image background */}
      <div className="absolute inset-0">
        {match?.stadium?.image && (
          <img 
            src={match.stadium.image} 
            alt={match.stadium.name} 
            className="w-full h-full object-cover"
          />
        )}
        {/* Gradient overlay to ensure text readability */}
        <div className="absolute inset-0 gradientBackground"></div>
      </div>
      
      {/* Indicador de odds no canto superior direito */}
      <div className="absolute top-3 right-3 z-10 flex items-center space-x-1 bg-black/40 backdrop-blur-sm rounded-full px-3 py-1.5 border border-white/20 group-hover:bg-secondary/20 group-hover:border-secondary/40 transition-all duration-300">
        <TrendingUp size={14} className="text-secondary group-hover:text-secondary transition-colors" />
        <span className="text-xs font-medium text-white/90 group-hover:text-white">Odds</span>
      </div>
      
      {/* Clubs logos with X in the middle - Now centered in the card */}
      <div className="flex items-center justify-center my-4 relative z-10">
        <div className="flex-shrink-0 w-16 h-16 rounded-full overflow-hidden bg-white p-1">
          {match.home_club.image ? (
            <img 
              src={match.home_club.image} 
              alt={match.home_club.name} 
              className="w-full h-full object-contain"
            />
          ) : (
            <div className="w-full h-full bg-gray-200 flex items-center justify-center">
              <span className="text-xs text-gray-500">{match.home_club.name.charAt(0)}</span>
            </div>
          )}
        </div>
        <X className="mx-3" size={20} />
        <div className="flex-shrink-0 w-16 h-16 rounded-full overflow-hidden bg-white p-1">
          {match.away_club.image ? (
            <img 
              src={match.away_club.image} 
              alt={match.away_club.name} 
              className="w-full h-full object-contain"
            />
          ) : (
            <div className="w-full h-full bg-gray-200 flex items-center justify-center">
              <span className="text-xs text-gray-500">{match.away_club.name.charAt(0)}</span>
            </div>
          )}
        </div>
      </div>
      
      {/* Match details moved to bottom */}
      <div className="flex flex-col items-center justify-center text-center relative z-10">
        <h3 className="font-medium">{match.home_club.name} vs {match.away_club.name}</h3>
        <p className="text-xs mt-1">{t('matchCard.stadium', 'Estádio')}: {match.stadium.name}</p>
        
        {/* Call to action sutil */}
        <div className="flex items-center mt-2 text-xs text-white/70 group-hover:text-secondary transition-colors duration-300">
          <span>{t('matchCard.clickToViewOdds', 'Clique para ver as odds')}</span>
          <ChevronRight size={14} className="ml-1 group-hover:translate-x-1 transition-transform duration-300" />
        </div>
      </div>
    </div>
  );
} 