import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useUserContext } from '../hooks/useUserContext';
import { 
  Trophy,
  Loader2, 
} from 'lucide-react';
import { Button } from '../components/ui/button';
import { showError } from '../lib/toast';
import matchApi from '../api/match';
import MatchCard from '../components/MatchCard';

export default function MatchesPage() {
  const navigate = useNavigate();
  const { t } = useTranslation('matches');
  const { userClubsData } = useUserContext();
  const [loading, setLoading] = useState(true);
  const [, setMatches] = useState({
      upcoming: [],
      past: []
    });
  const [heartClubMatch, setHeartClubMatch] = useState(null);
  
  // Get the heart club data
  const heartClub = userClubsData?.heart_club?.club;

  useEffect(() => {
    const fetchMatches = async () => {
      if (!heartClub) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        
        // Buscar apenas a partida do clube do coração
        await checkHeartClubMatch(heartClub.id);
      } catch (error) {
        console.error('Error fetching matches:', error);
        showError(t('matches.errors.failedToLoad', 'Failed to load matches'));
      } finally {
        setLoading(false);
      }
    };

    fetchMatches();
  }, [heartClub, t]);

  const checkHeartClubMatch = async (clubId) => {
    try {
      const clubGames = await matchApi.getMatchesByClub(clubId);
      if (clubGames.length > 0) {
        // Se uma partida for encontrada onde o clube está participando, defina-a
        const clubGame = clubGames[0];
        const isCurrentClubHomeTeam = clubGame.home_club_id === clubId;
        
        // Classificar as partidas em próximas e passadas
        const now = new Date();
        const upcoming = [];
        const past = [];
        
        clubGames.forEach(match => {
          const matchDate = new Date(match.date);
          if (matchDate > now) {
            upcoming.push(match);
          } else {
            past.push(match);
          }
        });
        
        // Sort upcoming matches by date (ascending)
        upcoming.sort((a, b) => new Date(a.date) - new Date(b.date));
        
        // Sort past matches by date (descending)
        past.sort((a, b) => new Date(b.date) - new Date(a.date));
        
        setMatches({
          upcoming,
          past
        });

        setHeartClubMatch({
          ...clubGame,
          isHomeTeam: isCurrentClubHomeTeam
        });
      } else {
        // Nenhuma partida ao vivo encontrada para este clube
        setHeartClubMatch(null);
        setMatches({
          upcoming: [],
          past: []
        });
      }
    } catch (error) {
      console.error('Erro ao verificar partida do clube do coração:', error);
      setHeartClubMatch(null);
      setMatches({
        upcoming: [],
        past: []
      });
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-4rem)]">
        <div className="flex flex-col items-center">
          <Loader2 className="h-12 w-12 animate-spin text-secondary" />
          <p className="mt-4 text-primary/70 dark:text-white/70">{t('matches.loading', 'Loading matches...')}</p>
        </div>
      </div>
    );
  }

  if (!heartClub) {
    return (
      <div className="min-h-[calc(100vh-4rem)] bg-[#fafafa] dark:bg-[#0d0117] flex flex-col items-center justify-center p-4">
        <Trophy size={64} className="text-primary/30 dark:text-white/30 mb-4" />
        <h1 className="text-xl font-bold text-primary dark:text-white mb-2">{t('matches.noHeartClub.title', 'No Heart Club Selected')}</h1>
        <p className="text-center text-primary/70 dark:text-white/70 mb-6">
          {t('matches.noHeartClub.description', 'You need to select a heart club to view matches.')}
        </p>
        <Button onClick={() => navigate('/dashboard')}>
          {t('matches.noHeartClub.goToDashboard', 'Go to Dashboard')}
        </Button>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-background">
      <div className="container mx-auto px-4 py-6">
        <div className="flex items-center mb-6">
          <h1 className="text-2xl font-bold text-primary dark:text-white">
            {t('matches.title', '{{clubName}} Matches', { clubName: heartClub.name })}
          </h1>
        </div>


        {/* Partida do clube do coração (se existir) */}
        {heartClubMatch && (
          <div className="mb-8">
            <h2 className="text-xl font-semibold mb-4">{t('matches.liveMatch', 'Partida Atual')}</h2>
            <MatchCard 
              match={heartClubMatch}
              club={heartClub}
              isPast={false}
              isLive={true}
              onClick={() => navigate(`/game/${heartClub.id}/${heartClubMatch.id}`, { state: { club: heartClub } })}
            />
          </div>
        )}
      </div>
    </div>
  );
} 