import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useWalletContext } from '../hooks/useWalletContext';
//import { showInfo, showError } from '../lib/toast';
import { Button } from '../components/ui/button';
import { useUserContext } from '../hooks/useUserContext';
//import { useCardSystem } from '../hooks/useCardSystem';
import matchApi from '../api/match';
import MatchCard from '../components/MatchCard';
import { LoginHandler } from '../components/LoginHandler';


export default function DashboardPage() {
  const { t } = useTranslation('common');
  const navigate = useNavigate();
  const { 
    account, 
    isAuthenticated,
    isConnected, 
    connectWallet
  } = useWalletContext();
  const { userClubsData, } = useUserContext();
  //const { getUserCards } = useCardSystem();
  //const [followedClubs, setFollowedClubs] = useState([]);
  const [heartClubMatch, setHeartClubMatch] = useState(null);
  //const [showTreasureChest, setShowTreasureChest] = useState(false);
  //const [userCards, setUserCards] = useState([]);
  // const [liveGameClubs, setLiveGameClubs] = useState([]);



  // Efeito para garantir que a carteira esteja conectada
  useEffect(() => {
    const ensureWalletConnected = async () => {
      // Se não temos uma conta mas temos autenticação, tente conectar a carteira
      if (!isConnected && isAuthenticated) {
        await connectWallet();
      }
    };

    ensureWalletConnected();
  }, [account, isAuthenticated, isConnected, connectWallet]);

  useEffect(() => {

    //setFollowedClubs(userClubsData?.clubs.map(club => club.club));

    // Verificar se o clube do coração tem uma partida
    if (userClubsData?.heart_club?.club?.id) {
      checkHeartClubMatch(userClubsData.heart_club.club.id);
    }
  }, [userClubsData]);

  const checkHeartClubMatch = async (clubId) => {
    try {
      const clubGames = await matchApi.getMatchesByClub(clubId);
      if (clubGames.length > 0) {
        // Se uma partida for encontrada onde o clube está participando, defina-a
        const clubGame = clubGames[0];
        const isCurrentClubHomeTeam = clubGame.home_club_id === clubId;

        setHeartClubMatch({
          ...clubGame,
          isHomeTeam: isCurrentClubHomeTeam
        });
      } else {
        // Nenhuma partida ao vivo encontrada para este clube
        setHeartClubMatch(null);
      }
    } catch (error) {
      console.error('Erro ao verificar partida do clube do coração:', error);
      setHeartClubMatch(null);
    }
  };

/*   const handleOpenTreasureChest = () => {
    // Carrega as cartas do usuário do cache
    if (account) {
      const userData = getUserCards(account);


      
      if (userData && userData.cards && userData.cards.length > 0) {
        setUserCards(userData.cards);
        // Abre o baú do tesouro apenas se há cartas
        setShowTreasureChest(true);
      } else {
        // Se não há cartas, não abre o baú
        showInfo('Você ainda não possui cartas! Complete seu primeiro login para receber suas cartas de boas-vindas.');
        return;
      }
    } else {
      showError('Conecte sua carteira primeiro!');
      return;
    }
  }; */


  //CONTEÚDO PRINCIPAL DO DASHBOARD
  return (
    <div className="min-h-[calc(100vh-4rem)] bg-background">
      {/* Renderizar conteúdo apenas se o usuário estiver autenticado */}
      {isAuthenticated && isConnected ? (
        <>
          {/* Barra de Ligas */}
          <div className="border-b border-white/10">
            <div className="container mx-auto px-4 py-4">
              <div className="flex items-center justify-center gap-6 overflow-x-auto">
                {/* Brasileirão */}
                <div className="flex flex-col items-center min-w-fit cursor-pointer hover:opacity-80 transition-opacity">
                  <div className="w-8 h-8 bg-white/10 rounded-full flex items-center justify-center mb-1 hover:bg-white/20 transition-colors">
                    <span className="text-lg">🇧🇷</span>
                  </div>
                  <span className="text-white text-xs font-medium">{t('dashboard.leagues.brasileirao')}</span>
                </div>

                {/* Premier League */}
                <div className="flex flex-col items-center min-w-fit cursor-pointer hover:opacity-80 transition-opacity">
                  <div className="w-8 h-8 bg-white/10 rounded-full flex items-center justify-center mb-1 hover:bg-white/20 transition-colors">
                    <span className="text-lg">🇬🇧</span>
                  </div>
                  <span className="text-white text-xs font-medium">{t('dashboard.leagues.premier')}</span>
                </div>

                {/* LaLiga */}
                <div className="flex flex-col items-center min-w-fit cursor-pointer hover:opacity-80 transition-opacity">
                  <div className="w-8 h-8 bg-white/10 rounded-full flex items-center justify-center mb-1 hover:bg-white/20 transition-colors">
                    <span className="text-lg">🇪🇸</span>
                  </div>
                  <span className="text-white text-xs font-medium">{t('dashboard.leagues.laliga')}</span>
                </div>

                {/* Bundesliga */}
                <div className="flex flex-col items-center min-w-fit cursor-pointer hover:opacity-80 transition-opacity">
                  <div className="w-8 h-8 bg-white/10 rounded-full flex items-center justify-center mb-1 hover:bg-white/20 transition-colors">
                    <span className="text-lg">🇩🇪</span>
                  </div>
                  <span className="text-white text-xs font-medium">{t('dashboard.leagues.bundesliga')}</span>
                </div>

                {/* Ligue 1 */}
                <div className="flex flex-col items-center min-w-fit cursor-pointer hover:opacity-80 transition-opacity">
                  <div className="w-8 h-8 bg-white/10 rounded-full flex items-center justify-center mb-1 hover:bg-white/20 transition-colors">
                    <span className="text-lg">🇫🇷</span>
                  </div>
                  <span className="text-white text-xs font-medium">{t('dashboard.leagues.frances')}</span>
                </div>

                {/* Argentino */}
                <div className="flex flex-col items-center min-w-fit cursor-pointer hover:opacity-80 transition-opacity">
                  <div className="w-8 h-8 bg-white/10 rounded-full flex items-center justify-center mb-1 hover:bg-white/20 transition-colors">
                    <span className="text-lg">🇦🇷</span>
                  </div>
                  <span className="text-white text-xs font-medium">{t('dashboard.leagues.argentino')}</span>
                </div>

                {/* MLS */}
                <div className="flex flex-col items-center min-w-fit cursor-pointer hover:opacity-80 transition-opacity">
                  <div className="w-8 h-8 bg-white/10 rounded-full flex items-center justify-center mb-1 hover:bg-white/20 transition-colors">
                    <span className="text-lg">🇺🇸</span>
                  </div>
                  <span className="text-white text-xs font-medium">{t('dashboard.leagues.mls')}</span>
                </div>

                {/* Português */}
                <div className="flex flex-col items-center min-w-fit cursor-pointer hover:opacity-80 transition-opacity">
                  <div className="w-8 h-8 bg-white/10 rounded-full flex items-center justify-center mb-1 hover:bg-white/20 transition-colors">
                    <span className="text-lg">🇵🇹</span>
                  </div>
                  <span className="text-white text-xs font-medium">{t('dashboard.leagues.portugues')}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Conteúdo principal */}
          <div className="container mx-auto px-4 py-8">
        {/* Botão do baú do tesouro */}
{/*         <div className="mb-6">
          <Button 
            variant="secondary"
            onClick={handleOpenTreasureChest}
            className="mb-4"
          >
            🎁 Baú do Tesouro
          </Button>
        </div> 

        {/* Partida do clube do coração (se existir) */}
        {heartClubMatch && userClubsData?.heart_club?.club && (
          <div className="mb-8">
            <MatchCard 
              match={heartClubMatch}
              club={userClubsData.heart_club.club}
              isPast={false}
              isLive={true}
              onClick={() => navigate(`/game/${userClubsData.heart_club.club.id}/${heartClubMatch.id}`, { state: { club: userClubsData.heart_club.club } })}
            />
          </div>
        )}

        {/* Banners Principais - Layout em Grid */}
        <div className="mb-8 grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Banner Stake Tokens */}
          <div 
            className="cursor-pointer transition-all duration-300 hover:scale-[1.02] group"
            onClick={() => navigate('/buy-fantokens?tab=stake')}
          >
            <div className="relative bg-background-overlay rounded-xl shadow-lg border border-white/5 overflow-hidden backdrop-blur-sm h-48">
              {/* Imagem de fundo - Parte esquerda (fichas) */}
              <div 
                className="absolute inset-0 opacity-30"
                style={{
                  backgroundImage: `url(/fantoken_table.png)`,
                  backgroundSize: '300% auto',
                  backgroundPosition: '0% 60%',
                  backgroundRepeat: 'no-repeat'
                }}
              />
              <div className="relative z-10 bg-gradient-to-br from-green-900/60 to-emerald-800/60 h-full p-6 flex flex-col justify-between">
                <div className="text-center">
                  <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-white/30 transition-colors backdrop-blur-sm">
                    <span className="text-2xl">💎</span>
                  </div>
                  <h3 className="text-lg font-semibold text-white mb-2 drop-shadow-lg">
                    {t('dashboard.banners.stakeTokens.title')}
                  </h3>
                  <p className="text-white/90 text-sm drop-shadow">
                    {t('dashboard.banners.stakeTokens.description')}
                  </p>
                </div>
                <div className="text-center">
                  <div className="text-green-300 text-xs font-medium drop-shadow">
                    {t('dashboard.banners.stakeTokens.action')}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Banner Comprar Tokens */}
          <div 
            className="cursor-pointer transition-all duration-300 hover:scale-[1.02] group"
            onClick={() => navigate('/buy-fantokens')}
          >
            <div className="relative bg-background-overlay rounded-xl shadow-lg border border-white/5 overflow-hidden backdrop-blur-sm h-48">
              {/* Imagem de fundo - Parte central (fantokens) */}
              <div 
                className="absolute inset-0 opacity-30"
                style={{
                  backgroundImage: `url(/fantoken_table.png)`,
                  backgroundSize: '300% auto',
                  backgroundPosition: '50% 60%',
                  backgroundRepeat: 'no-repeat'
                }}
              />
              <div className="relative z-10 bg-gradient-to-br from-blue-900/60 to-indigo-800/60 h-full p-6 flex flex-col justify-between">
                <div className="text-center">
                  <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-white/30 transition-colors backdrop-blur-sm">
                    <span className="text-2xl">🪙</span>
                  </div>
                  <h3 className="text-lg font-semibold text-white mb-2 drop-shadow-lg">
                    {t('dashboard.banners.buyTokens.title')}
                  </h3>
                  <p className="text-white/90 text-sm drop-shadow">
                    {t('dashboard.banners.buyTokens.description')}
                  </p>
                </div>
                <div className="text-center">
                  <div className="text-blue-300 text-xs font-medium drop-shadow">
                    {t('dashboard.banners.buyTokens.action')}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Banner Cartas */}
          <div 
            className="cursor-pointer transition-all duration-300 hover:scale-[1.02] group"
            onClick={() => navigate('/cards')}
          >
            <div className="relative bg-background-overlay rounded-xl shadow-lg border border-white/5 overflow-hidden backdrop-blur-sm h-48">
              {/* Imagem de fundo - Parte direita (cartas) */}
              <div 
                className="absolute inset-0 opacity-30"
                style={{
                  backgroundImage: `url(/fantoken_table.png)`,
                  backgroundSize: '300% auto',
                  backgroundPosition: '100% 60%',
                  backgroundRepeat: 'no-repeat'
                }}
              />
              <div className="relative z-10 bg-gradient-to-br from-purple-900/60 to-pink-800/60 h-full p-6 flex flex-col justify-between">
                <div className="text-center">
                  <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-white/30 transition-colors backdrop-blur-sm">
                    <span className="text-2xl">🃏</span>
                  </div>
                  <h3 className="text-lg font-semibold text-white mb-2 drop-shadow-lg">
                    {t('dashboard.banners.cards.title')}
                  </h3>
                  <p className="text-white/90 text-sm drop-shadow">
                    {t('dashboard.banners.cards.description')}
                  </p>
                </div>
                <div className="text-center">
                  <div className="text-purple-300 text-xs font-medium drop-shadow">
                    {t('dashboard.banners.cards.action')}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Banner Poker em breve */}
        <div className="mb-8">
          <div className="relative overflow-hidden rounded-lg bg-gradient-to-r from-gray-900/90 to-gray-800/90 backdrop-blur-sm">
            <div className="absolute inset-0">
              <img 
                src="/table_poker.png" 
                alt="Mesa de Poker" 
                className="w-full h-full object-cover opacity-30"
              />
            </div>
            <div className="relative z-10 px-6 py-10 text-center">
              <h2 className="text-2xl font-bold text-white mb-2">
                {t('dashboard.banners.poker.title')}
              </h2>
              <p className="text-gray-300 text-sm">
                {t('dashboard.banners.poker.description')}
              </p>
            </div>
          </div>
          </div>
          
        </div>
        
        {/* Componente da animação do baú */}
        {/* <TreasureChestAnimation 
          show={showTreasureChest}
          onClose={() => setShowTreasureChest(false)}
          cards={userCards}
        /> */}
        </>
      ) : (
        /* Conteúdo para usuários não logados */
        <div className="relative">
          {/* Hero Section Minimalista */}
          <section className="bg-backg text-white py-16 md:py-20 imageBackground">
            <div className="container mx-auto px-4 text-center">
              <h1 className="text-4xl md:text-5xl font-bold leading-tight mb-6">
                {t('dashboard.welcome.title')} <span className="text-primary">Fanatique</span>
              </h1>
              <p className="text-lg md:text-xl mb-8 text-white/80 max-w-2xl mx-auto">
                {t('dashboard.welcome.subtitle')}
              </p>
              
              {/* Call to Action */}
              <div className="mb-12">
                <LoginHandler 
                  showAsButton={true}
                  buttonLabel={t('dashboard.welcome.cta')}
                />
              </div>
              
              {/* Features Grid Minimalista */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto mt-16">
                <div className="bg-black/30 backdrop-blur-sm border border-white/10 rounded-xl p-6 hover:bg-black/40 transition-all duration-300">
                  <div className="w-12 h-12 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-2xl">💎</span>
                  </div>
                  <h3 className="text-lg font-semibold text-white mb-2">{t('dashboard.welcome.features.stake.title')}</h3>
                  <p className="text-white/70 text-sm">{t('dashboard.welcome.features.stake.description')}</p>
                </div>
                
                <div className="bg-black/30 backdrop-blur-sm border border-white/10 rounded-xl p-6 hover:bg-black/40 transition-all duration-300">
                  <div className="w-12 h-12 bg-blue-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-2xl">🎮</span>
                  </div>
                  <h3 className="text-lg font-semibold text-white mb-2">{t('dashboard.welcome.features.bet.title')}</h3>
                  <p className="text-white/70 text-sm">{t('dashboard.welcome.features.bet.description')}</p>
                </div>
                
                <div className="bg-black/30 backdrop-blur-sm border border-white/10 rounded-xl p-6 hover:bg-black/40 transition-all duration-300">
                  <div className="w-12 h-12 bg-purple-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-2xl">🃏</span>
                  </div>
                  <h3 className="text-lg font-semibold text-white mb-2">{t('dashboard.welcome.features.cards.title')}</h3>
                  <p className="text-white/70 text-sm">{t('dashboard.welcome.features.cards.description')}</p>
                </div>
              </div>
            </div>
          </section>

          {/* Transition Wave */}
          <div className="relative h-20 bg-backg">
            <svg className="absolute bottom-0 left-0 w-full" 
              viewBox="0 0 1440 120" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M0 120L48 108C96 96 192 72 288 60C384 48 480 48 576 54C672 60 768 72 864 78C960 84 1056 84 1152 72C1248 60 1344 36 1392 24L1440 12V120H1392C1344 120 1248 120 1152 120C1056 120 960 120 864 120C768 120 672 120 576 120C480 120 384 120 288 120C192 120 96 120 48 120H0Z" 
              fill="rgb(var(--backgroun))" />
            </svg>
            
            {/* Logo central */}
            <div className="absolute left-1/2 bottom-4 transform -translate-x-1/2 z-10">
              <div className="relative">
                <div className="absolute inset-0 bg-secondary/20 rounded-full blur-xl transform scale-150 animate-pulse-slow"></div>
                <img src="/logo_green.png" alt="Fanatique" className="w-16 h-16 relative z-10" />
              </div>
            </div>
          </div>

          {/* Seção de Benefícios */}
          <section className="py-12 bg-backg">
            <div className="container mx-auto px-4">
              <div className="text-center mb-8">
                <h2 className="text-2xl md:text-3xl font-bold text-white mb-3">
                  {t('dashboard.benefits.title')}
                </h2>
                <p className="text-white/70 max-w-xl mx-auto">
                  {t('dashboard.benefits.subtitle')}
                </p>
              </div>
              
                             <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
                 <div className="flex items-start gap-4">
                   <div className="w-10 h-10 bg-primary/20 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                     <span className="text-primary text-lg">🃏</span>
                   </div>
                   <div>
                     <h3 className="text-lg font-semibold text-white mb-2">{t('dashboard.benefits.items.gamification.title')}</h3>
                     <p className="text-white/70 text-sm">{t('dashboard.benefits.items.gamification.description')}</p>
                   </div>
                 </div>
                 
                 <div className="flex items-start gap-4">
                   <div className="w-10 h-10 bg-primary/20 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                     <span className="text-primary text-lg">🏆</span>
                   </div>
                   <div>
                     <h3 className="text-lg font-semibold text-white mb-2">{t('dashboard.benefits.items.rewards.title')}</h3>
                     <p className="text-white/70 text-sm">{t('dashboard.benefits.items.rewards.description')}</p>
                   </div>
                 </div>
                 
                 <div className="flex items-start gap-4">
                   <div className="w-10 h-10 bg-primary/20 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                     <span className="text-primary text-lg">⚡</span>
                   </div>
                   <div>
                     <h3 className="text-lg font-semibold text-white mb-2">{t('dashboard.benefits.items.odds.title')}</h3>
                     <p className="text-white/70 text-sm">{t('dashboard.benefits.items.odds.description')}</p>
                   </div>
                 </div>
                 
                 <div className="flex items-start gap-4">
                   <div className="w-10 h-10 bg-primary/20 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                     <span className="text-primary text-lg">💎</span>
                   </div>
                   <div>
                     <h3 className="text-lg font-semibold text-white mb-2">{t('dashboard.benefits.items.staking.title')}</h3>
                     <p className="text-white/70 text-sm">{t('dashboard.benefits.items.staking.description')}</p>
                   </div>
                 </div>
               </div>
            </div>
          </section>
        </div>
      )}
    </div>
  );
}

