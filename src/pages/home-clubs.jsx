import { useState, useEffect } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useWalletContext } from '../hooks/useWalletContext';
import { ChevronRight, Star, Calendar, MapPin, Loader2, ShoppingBag, Trophy, Ticket, ArrowLeft, Heart, UserPlus, UserCheck, CheckCircle, Clock, Lock, MessageCircle } from 'lucide-react';
import { Button } from '../components/ui/button';
import { showError } from '../lib/toast';
import clubApi from '../api/club';
import userClubApi from '../api/user_club';
import { useUserContext } from '../hooks/useUserContext';
import matchApi from '../api/match';
import MatchCard from '../components/MatchCard';

export default function HomeClubsPage() {
  const navigate = useNavigate();
  const { clubId } = useParams();
  const location = useLocation();
  const { t } = useTranslation(['common', 'club']);
  const { isAuthenticated, isInitialized, getUserData } = useWalletContext();
  const [loading, setLoading] = useState(true);
  const [userClubStats, setUserClubStats] = useState(null);
  const [selectedClub, setSelectedClub] = useState(null);
  const [upcomingEvents, setUpcomingEvents] = useState([]);
  const [liveGame, setLiveGame] = useState(null);
  const [isHeartClub, setIsHeartClub] = useState(false);
  const [hasHeartClub, setHasHeartClub] = useState(false);
  const [heartClubLoading, setHeartClubLoading] = useState(false);
  const [isFollowing, setIsFollowing] = useState(false);
  const [followLoading, setFollowLoading] = useState(false);
  const [activeSport, setActiveSport] = useState('all');
  const [clubSports, setClubSports] = useState([]);
  const { isUserHeartClub, hasUserHeartClub, isFollowingClub, updateUserClubsData } = useUserContext();

  // Get the tab from URL query parameter or default to 'overview'
  const queryParams = new URLSearchParams(location.search);
  const tabParam = queryParams.get('tab');
  const sportParam = queryParams.get('sport');

  // Tab state
  const [activeTab, setActiveTab] = useState(tabParam || 'overview');
  const [activeFilter, setActiveFilter] = useState('all'); // 'all', 'available', 'inProgress', 'completed'

  // Check if user is authenticated and load data
  useEffect(() => {
    const checkAuthAndLoadData = async () => {
      try {
        // Only check authentication after wallet context is fully initialized
        if (isInitialized && !isAuthenticated) {
          navigate('/app');
          return;
        }

        setLoading(true);

        // Get user data - we call this to verify authentication
        await getUserData();

        if (clubId) {
          // Load specific club by ID
          await fetchClubById(clubId);
          // Check if there's a live game
          await checkLiveGame(clubId);
          // Check if user is following this club
          await checkIfFollowing(clubId);
        } else {
          // Redirect to dashboard if no clubId is provided
          navigate('/dashboard');
          return;
        }
      } catch (error) {
        console.error('Error loading data:', error);
        showError('Failed to load club data');
        navigate('/dashboard');
      } finally {
        setLoading(false);
      }
    };

    checkAuthAndLoadData();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated, isInitialized, navigate, getUserData, clubId]);

  const checkIfFollowing = async (clubId) => {
    try {
      // In a real app, this would be an API call to check if user is following this club
      // For demo purposes, we'll mock this with local storage
      setIsFollowing(await isFollowingClub(clubId));
    } catch (error) {
      console.error('Error checking following status:', error);
      setIsFollowing(false);
    }
  };

  const toggleFollow = async () => {
    try {
      setFollowLoading(true);
      
      // In a real app, this would be an API call to follow/unfollow the club
      // For demo purposes, we'll use local storage
      if (isFollowing) {
        // Unfollow this club
        await userClubApi.removeClubAssociation(clubId);
        setIsFollowing(false);
        // showSuccess(`You are no longer following ${selectedClub.name}`);
      } else {
        // Follow this club
        await userClubApi.addClubAssociation(clubId, 2);
        setIsFollowing(true);
        // showSuccess(`You are now following ${selectedClub.name}`);
      }
      updateUserClubsData();
    } catch (error) {
      console.error('Error toggling follow:', error);
      showError('Failed to update follow status');
    } finally {
      setFollowLoading(false);
    }
  };

  const fetchClubById = async (id) => {
    try {
      // Get club details
      const clubData = await clubApi.getClubById(id);
      if (clubData) {
        setSelectedClub(clubData);
        
        // Set club sports - in a real app, this would come from the API
        // For now, we'll mock it with some sample data
        const mockSports = [];
        
        // Check if this is a club with multiple sports
        if (clubData.name === "Flamengo") {
          mockSports.push({ id: "football", name: "Futebol", icon: "/futeboll_icon.svg" });
          mockSports.push({ id: "lol", name: "League of Legends", icon: "/lol_icon_white.svg" });
          mockSports.push({ id: "csgo", name: "CS:GO", icon: "/csgo_icon.svg" });
        } else if (clubData.name === "Furia") {
          mockSports.push({ id: "lol", name: "League of Legends", icon: "/lol_icon_white.svg" });
          mockSports.push({ id: "csgo", name: "CS:GO", icon: "/trophy-icon.svg" });
        } else if (clubData.name === "Palmeiras") {
          mockSports.push({ id: "football", name: "Futebol", icon: "/futeboll_icon.svg" });
        } else {
          // Default for other clubs
          mockSports.push({ id: "football", name: "Futebol", icon: "/futeboll_icon.svg" });
        }
        
        setClubSports(mockSports);
        
        // Set active sport from URL or default to first available sport
        if (sportParam && mockSports.some(sport => sport.id === sportParam)) {
          setActiveSport(sportParam);
        } else if (mockSports.length > 0) {
          setActiveSport(mockSports[0].id);
        }

        // Fetch events for the club
        await fetchClubEvents(id);

        // Fetch user stats for this club
        await fetchUserClubStats(id);
        
        // Check if this is the user's heart club
        await checkIfHeartClub(id);
      } else {
        showError('Club not found');
        navigate('/dashboard');
      }
    } catch (error) {
      console.error('Error fetching club by ID:', error);
      showError('Failed to load club details');
      navigate('/dashboard');
    }
  };

  const fetchUserClubStats = async (clubId) => {
    try {
      const userStats = await clubApi.getUserClubStats(clubId);
      if (userStats) {
        setUserClubStats(userStats);
      }
    } catch (error) {
      console.error('Error fetching user club stats:', error);
      // Don't redirect on stats error, just set default values
      setUserClubStats({
        points: 0,
        quests: 0,
        orders: 0,
        tickets: 0
      });
    }
  };

  const fetchClubEvents = async (clubId) => {
    try {
      const events = await clubApi.getClubEvents(clubId);
      if (events) {
        setUpcomingEvents(events);
      }
    } catch (error) {
      console.error('Error fetching club events:', error);
      setUpcomingEvents([]);
    }
  };

  const checkLiveGame = async (clubId) => {
    try {
      const clubGames = await matchApi.getMatchesByClub(clubId);
      if (clubGames.length > 0) {
        // If a game is found where the club is participating, set it
        const clubGame = clubGames[0];
        const isCurrentClubHomeTeam = clubGame.home_club_id === clubId;

        setLiveGame({
          ...clubGame,
          isHomeTeam: isCurrentClubHomeTeam
        });
      } else {
        // No live game found for this club
        setLiveGame(null);
      }
    } catch (error) {
      console.error('Error checking for live game:', error);
      setLiveGame(null);
    }
  };

  const checkIfHeartClub = async (clubId) => {
    try {
      // In a real app, this would be an API call to check if this is the user's heart club
      // For demo purposes, we'll mock this with local storage
      setIsHeartClub(await isUserHeartClub(clubId));
      setHasHeartClub(await hasUserHeartClub(clubId));
    } catch (error) {
      console.error('Error checking heart club status:', error);
      setIsHeartClub(false);
    }
  };

  const toggleHeartClub = async () => {
    try {
      setHeartClubLoading(true);
      
      if (isHeartClub) {
        // Remove this club as heart club
        await userClubApi.removeClubAssociation(clubId);
        setIsHeartClub(false);
        setHasHeartClub(false);
        // localStorage.removeItem('heartClubId');
        // showSuccess(`${selectedClub.name} is no longer your heart club`);
      } else {
        // Check if user already has a heart club
        if (hasHeartClub) {
          showError('You already have a heart club. You can only have one heart club at a time.');
        } else {
          // Set this club as heart club
          await userClubApi.addClubAssociation(clubId, 1);
          // localStorage.setItem('heartClubId', clubId);
          setIsHeartClub(true);
          // showSuccess(`${selectedClub.name} is now your heart club!`);
        }
      }
      updateUserClubsData();
    } catch (error) {

      console.error('Error toggling heart club:', error);

      if(error?.response?.data?.message) {
       showError(error.response.data.message);
      } else {
        showError('Failed to update heart club status');
      }

    } finally {
      setHeartClubLoading(false);
    }
  };

  // const handleBackToDashboard = () => {
  //   navigate('/dashboard');
  // }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-4rem)]">
        <div className="flex flex-col items-center">
          <Loader2 className="h-12 w-12 animate-spin text-secondary" />
          <p className="mt-4 text-primary/70 dark:text-white/70">{t('club:clubPage.messages.loadingClub')}</p>
        </div>
      </div>
    );
  }
 
  return (
    <div className="min-h-[calc(100vh-4rem)] bg-background">
      {/* Club Header */}
      <div className="relative gradientBackground overflow-hidden">
        {/* Blurred logo background */}
        {selectedClub && selectedClub.image && (
          <div
            className="absolute inset-0 opacity-20 bg-no-repeat bg-center"
            style={{
              backgroundImage: `url(${selectedClub.image})`,
              backgroundSize: '150%',
              filter: 'blur(10px)'
            }}
          />
        )}
        <div className="container mx-auto px-4 py-10 relative z-10">
          {/* Back button */}
          {/* <button
            onClick={handleBackToDashboard}
            className="flex items-center text-white/80 hover:text-white mb-6"
          >
            <ArrowLeft size={18} className="mr-1" />
            <span>Back to Clubs</span>
          </button> */}

          {/* Club Info */}
          {selectedClub && (
            <div className="text-white flex flex-col items-center text-center">
              <div className="relative">
                {selectedClub.image ? (
                  <img
                    src={selectedClub.image}
                    alt={selectedClub.name}
                    className="w-28 h-28 rounded-full mb-4 border-4 border-white/20"
                  />
                ) : (
                  <div className="w-28 h-28 rounded-full bg-white/20 mb-4" />
                )}
                {liveGame && (
                  <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full flex items-center animate-pulse shadow-md"
                    style={{
                      width: '72px',
                    }}
                  >
                    <div className="h-2 w-2 rounded-full bg-white mr-1"></div>
                    {t('club:clubPage.gameStatus.live')}
                  </div>
                )}
              </div>
              <div>
                <h1 className="text-3xl font-bold">{selectedClub.name}</h1>
                <div className="flex items-center justify-center mt-2">
                  <Star size={18} className="text-yellow-400 mr-1" />
                  <span>{selectedClub.fanCount || 0} {t('club:clubPage.fans')}</span>
                </div>
              </div>
              <p className="mt-4 text-white/80 max-w-2xl mx-auto">{selectedClub.description || ''}</p>
              
              <div className="flex flex-wrap gap-3 justify-center mt-4">
                {/* Heart Club Button */}
                
                {!isFollowing && ( 

                  (hasHeartClub && isHeartClub || !hasHeartClub) && (
                    <Button 
                      variant={isHeartClub ? "ghost" : "default"}
                      size="sm" 
                      className={`${isHeartClub ? 'bg-black text-white' : 'bg-white/30 hover:bg-white/40 text-white'}`}
                      onClick={toggleHeartClub}
                      disabled={heartClubLoading}
                    >
                      <Heart size={16} className={`mr-2 border-black ${isHeartClub ? 'fill-red-500' : ''}`} />
                      {heartClubLoading ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        t('club:clubPage.actions.heartClub')
                      )}
                    </Button>
                  )
                )}

                
                {/* Follow Button - shows when the club is not the heart club or when heart club button is not showing */}
                {(!isHeartClub || (hasHeartClub && !isHeartClub)) && (
                  <Button 
                    variant="default"
                    size="sm" 
                    className="bg-white/30 hover:bg-white/40 text-white border-none"
                    onClick={toggleFollow}
                    disabled={followLoading}
                  >
                    {isFollowing ? (
                      <UserCheck size={16} className="mr-2 fill-white" />
                    ) : (
                      <UserPlus size={16} className="mr-2" />
                    )}
                    {followLoading ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : isFollowing ? (
                      t('club:clubPage.actions.following')
                    ) : (
                      t('club:clubPage.actions.follow')
                    )}
                  </Button>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* User Stats */}
      <div className="container mx-auto px-4 -mt-6 relative z-20">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <StatCard
            icon={<Trophy size={24} className="icon" />}
            title={t('club:clubPage.stats.points')}
            value={userClubStats?.points || "0"}
            label={t('club:clubPage.stats.accumulated')}
          />
          <StatCard
            icon={<Star size={24} className="icon" />}
            title={t('club:clubPage.stats.quests')}
            value={userClubStats?.quests || "0"}
            label={t('club:clubPage.stats.completed')}
          />
          <StatCard
            icon={<ShoppingBag size={24} className="icon" />}
            title={t('club:clubPage.stats.orders')}
            value={userClubStats?.orders || "0"}
            label={t('club:clubPage.stats.made')}
          />
          <StatCard
            icon={<Ticket size={24} className="icon" />}
            title={t('club:clubPage.stats.tickets')}
            value={userClubStats?.tickets || "0"}
            label={t('club:clubPage.stats.purchased')}
          />
        </div>
      </div>

      {/* Sports Filter - Only show if club has multiple sports */}
      {clubSports.length > 1 && (
        <div className="container mx-auto px-4 mt-6">
          <div className="bg-background-overlay rounded-lg overflow-hidden shadow-md">
            <div className="flex overflow-x-auto scrollbar-none">
              {clubSports.map((sport) => (
                <button
                  key={sport.id}
                  className={`px-6 py-4 flex flex-1 justify-center items-center transition-all border-b-2 ${
                    activeSport === sport.id 
                      ? 'border-secondary text-secondary font-medium' 
                      : 'border-transparent text-text-adaptive/60 dark:text-white/60 hover:text-text-adaptive dark:hover:text-white hover:bg-primary/5 dark:hover:bg-white/5'
                  }`}
                  onClick={() => {
                    setActiveSport(sport.id);
                    navigate(`/clubs/${clubId}?sport=${sport.id}${activeTab !== 'overview' ? `&tab=${activeTab}` : ''}`);
                  }}
                  title={sport.name}
                >
                  <div className="flex flex-col items-center gap-1">
                    <img 
                      src={sport.icon} 
                      alt={sport.name} 
                      className="w-6 h-6 object-contain dark:filter dark:brightness-0 dark:invert" 
                    />
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Tab Navigation */}
      <div className="container mx-auto px-4 mt-2 mb-2">
        <div className="flex space-x-1 overflow-x-auto border-b border-gray-200 dark:border-gray-700">
          <Button 
            variant="ghost" 
            size="sm"
            className={`rounded-none border-b-2 px-4 ${
              activeTab === 'overview'
                ? 'border-secondary text-foreground font-semibold'
                : 'border-transparent text-foreground/70 dark:text-white/70'
            }`}
            onClick={() => {
              setActiveTab('overview');
              navigate(`/clubs/${clubId}${activeSport !== 'all' ? `?sport=${activeSport}` : ''}`);
            }}
          >
            {t('club:clubPage.tabs.overview')}
          </Button>
          <Button 
            variant="ghost" 
            size="sm"
            className={`rounded-none border-b-2 px-4 ${
              activeTab === 'events'
                ? 'border-secondary text-foreground font-semibold'
                : 'border-transparent text-foreground/70 dark:text-white/70'
            }`}
            onClick={() => {
              setActiveTab('events');
              navigate(`/clubs/${clubId}?tab=events${activeSport !== 'all' ? `&sport=${activeSport}` : ''}`);
            }}
          >
            {t('club:clubPage.tabs.events')}
          </Button>
          <Button 
            variant="ghost" 
            size="sm"
            className={`rounded-none border-b-2 px-4 ${
              activeTab === 'news'
                ? 'border-secondary text-foreground font-semibold'
                : 'border-transparent text-foreground/70 dark:text-white/70'
            }`}
            onClick={() => {
              setActiveTab('news');
              navigate(`/clubs/${clubId}?tab=news${activeSport !== 'all' ? `&sport=${activeSport}` : ''}`);
            }}
          >
            {t('club:clubPage.tabs.news')}
          </Button>
          {/* <Button
            variant="ghost" 
            size="sm"
            className={`rounded-none border-b-2 px-4 ${
              activeTab === 'forum'
                ? 'border-tertiary text-foreground font-semibold'
                : 'border-transparent text-primary/70 dark:text-white/70'
            }`}
            onClick={() => {
              setActiveTab('forum');
              navigate(`/clubs/${clubId}/forum`);
            }}
          >
            Forum
          </Button> */}
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-2 pb-20">
        {/* Sport-specific message */}
        {activeSport !== 'all' && activeSport !== 'football' && (
          <div className="bg-secondary/10 rounded-lg p-3 mb-4 border border-secondary/20">
            <p className="text-sm text-text-adaptive dark:text-white">
              {t('club:clubPage.sports.showing')} {clubSports.find(s => s.id === activeSport)?.name || activeSport} {t('club:clubPage.sports.contentFor')} {selectedClub?.name}
            </p>
          </div>
        )}
        
        {/* Live Game Banner - Always show regardless of tab */}
        {liveGame && (
          <MatchCard
            match={liveGame}
            club={selectedClub}
            isPast={false}
            isLive={true}
            onClick={() => navigate(`/game/${clubId}/${liveGame.id}`, { state: { club: selectedClub } })}
          />
        )}

        {/* Tab content */}
        {activeTab === 'overview' && (
          <>
            {/* Upcoming Events */}
            <section className="mb-8">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold text-text-adaptive dark:text-white">{t('club:clubPage.sections.upcomingEvents')}</h2>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="text-foreground"
                  onClick={() => setActiveTab('events')}
                >
                  {t('club:clubPage.actions.viewAll')} <ChevronRight size={16} className="ml-1" />
                </Button>
              </div>

              {upcomingEvents.length > 0 ? (
                <div className="space-y-3">
                  {upcomingEvents.slice(0, 2).map((event) => (
                    <div
                      key={event.id}
                      className="bg-background-overlay rounded-lg p-4 shadow-sm"
                    >
                      <h3 className="font-medium text-text-adaptive dark:text-white">{event.title}</h3>
                      <div className="flex items-center text-sm text-text-adaptive/70 dark:text-white/70 mt-2">
                        <Calendar size={16} className="mr-1" />
                        <span>{new Date(event.date).toLocaleDateString()}</span>
                      </div>
                      <div className="flex items-center text-sm text-text-adaptive/70 dark:text-white/70 mt-1">
                        <MapPin size={16} className="mr-1" />
                        <span>{event.location}</span>
                      </div>
                      <Button
                        variant="secondary"
                        size="sm"
                        className="mt-3 w-full"
                        onClick={() => navigate(`/events/${event.id}`)}
                      >
                        {t('club:clubPage.actions.viewDetails')}
                      </Button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="bg-background-overlay rounded-lg p-6 text-center shadow-sm">
                  <p className="text-text-adaptive/70 dark:text-white/70">{t('club:clubPage.messages.noUpcomingEvents')}</p>
                </div>
              )}
            </section>

            {/* Fan Activities */}
            <section className="mb-8">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold text-text-adaptive dark:text-white">{t('club:clubPage.sections.fanActivities')}</h2>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div
                  className="bg-background-overlay rounded-lg p-4 shadow-sm flex flex-col items-center text-center cursor-pointer"
                  onClick={() => {
                    setActiveTab('quests');
                    navigate(`/clubs/${clubId}?tab=quests`);
                  }}
                >
                  <div className="w-12 h-12 rounded-full bg-black flex items-center justify-center mb-2">
                    <Star size={24} className="text-foreground text-primary" />
                  </div>
                  <h3 className="font-medium text-text-adaptive dark:text-white">{t('club:clubPage.stats.quests')}</h3>
                  <p className="text-sm text-text-adaptive/70 dark:text-white/70 mt-1">{t('club:clubPage.messages.completeQuestsDescription')}</p>
                </div>

                <div
                  className="bg-background-overlay rounded-lg p-4 shadow-sm flex flex-col items-center text-center cursor-pointer"
                  onClick={() => navigate(`/pedidos?clubId=${selectedClub.id}`)}
                >
                  <div className="w-12 h-12 rounded-full bg-black flex items-center justify-center mb-2">
                    <ShoppingBag size={24} className="text-foreground text-primary" />
                  </div>
                  <h3 className="font-medium text-text-adaptive dark:text-white">{t('club:clubPage.stats.orders')}</h3>
                  <p className="text-sm text-text-adaptive/70 dark:text-white/70 mt-1">{t('club:clubPage.messages.stadiumOrdersDescription')}</p>
                </div>
              </div>
            </section>

            {/* Club News */}
            <section>
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold text-text-adaptive dark:text-white">{t('club:clubPage.sections.latestNews')}</h2>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="text-foreground"
                  onClick={() => setActiveTab('news')}
                >
                  {t('club:clubPage.actions.viewAll')} <ChevronRight size={16} className="ml-1" />
                </Button>
              </div>

              <div className="space-y-3">
                {selectedClub?.news?.length > 0 ? (
                  selectedClub.news.slice(0, 2).map((item, index) => (
                    <div
                      key={index}
                      className="bg-background-overlay rounded-lg overflow-hidden shadow-sm"
                    >
                      {item.image && (
                        <img
                          src={item.image}
                          alt={item.title}
                          className="w-full h-40 object-cover"
                        />
                      )}
                      <div className="p-4">
                        <h3 className="font-medium text-text-adaptive dark:text-white">{item.title}</h3>
                        <p className="text-sm text-text-adaptive/70 dark:text-white/70 mt-1 line-clamp-2">
                          {item.summary}
                        </p>
                        <div className="flex justify-between items-center mt-3">
                          <span className="text-xs text-text-adaptive/60 dark:text-white/60">
                            {new Date(item.date).toLocaleDateString()}
                          </span>
                          <Button
                            variant="link"
                            size="sm"
                            className="p-0 h-auto text-secondary"
                            onClick={() => navigate(`/news/${item.id}`)}
                          >
                            {t('common:actions.readMore', 'Read More')}
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="bg-background-overlay rounded-lg p-6 text-center shadow-sm">
                    <p className="text-text-adaptive/70 dark:text-white/70">{t('club:clubPage.messages.noNewsAvailable')}</p>
                  </div>
                )}
              </div>
            </section>

          </>
        )}

        {/* Quests Tab */}
        {activeTab === 'quests' && (
          <div>
            <div className="mb-6">
              <h2 className="text-xl font-bold text-text-adaptive dark:text-white">{t('club:clubPage.sections.clubQuests')}</h2>
              <p className="text-text-adaptive/70 dark:text-white/70 mt-1">
                {t('club:clubPage.messages.questsDescription')}
              </p>
            </div>

            {/* Filter tabs */}
            <div className="flex flex-wrap gap-2 mb-6">
              <Button 
                variant={activeFilter === 'all' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setActiveFilter('all')}
                className={`
                  rounded-full font-medium 
                  ${activeFilter === 'all' 
                    ? 'bg-primary text-text-adaptive shadow-md' 
                    : 'border-text-adaptive/20 dark:border-white/20 text-text-adaptive dark:text-white/70 hover:bg-primary/10 dark:hover:bg-white/10'}
                `}
              >
                {t('club:clubPage.filters.all')}
              </Button>
              <Button 
                variant={activeFilter === 'available' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setActiveFilter('available')}
                className={`
                  rounded-full font-medium
                  ${activeFilter === 'available' 
                    ? 'bg-blue-500 text-white shadow-md' 
                    : 'border-text-adaptive/20 dark:border-white/20 text-text-adaptive dark:text-white/70 hover:bg-primary/10 dark:hover:bg-white/10'}
                `}
              >
                {t('club:clubPage.filters.available')}
              </Button>
              <Button 
                variant={activeFilter === 'inProgress' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setActiveFilter('inProgress')}
                className={`
                  rounded-full font-medium
                  ${activeFilter === 'inProgress' 
                    ? 'bg-orange-500 text-white shadow-md' 
                    : 'border-text-adaptive/20 dark:border-white/20 text-text-adaptive dark:text-white/70 hover:bg-primary/10 dark:hover:bg-white/10'}
                `}
              >
                {t('club:clubPage.filters.inProgress')}
              </Button>
              <Button 
                variant={activeFilter === 'completed' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setActiveFilter('completed')}
                className={`
                  rounded-full font-medium
                  ${activeFilter === 'completed' 
                    ? 'bg-green-500 text-white shadow-md' 
                    : 'border-text-adaptive/20 dark:border-white/20 text-text-adaptive dark:text-white/70 hover:bg-primary/10 dark:hover:bg-white/10'}
                `}
              >
                {t('club:clubPage.filters.completed')}
              </Button>
            </div>
          </div>
        )}

        {/* Events Tab */}
        {activeTab === 'events' && (
          <div>
            <div className="mb-6">
              <h2 className="text-xl font-bold text-text-adaptive dark:text-white">{t('club:clubPage.sections.allEvents')}</h2>
              <p className="text-text-adaptive/70 dark:text-white/70 mt-1">
                {t('club:clubPage.messages.eventsDescription')} {selectedClub?.name}.
              </p>
            </div>

            {upcomingEvents.length > 0 ? (
              <div className="space-y-3">
                {upcomingEvents.map((event) => (
                  <div
                    key={event.id}
                    className="bg-background-overlay rounded-lg p-4 shadow-sm"
                  >
                    <h3 className="font-medium text-text-adaptive dark:text-white">{event.title}</h3>
                    <div className="flex items-center text-sm text-text-adaptive/70 dark:text-white/70 mt-2">
                      <Calendar size={16} className="mr-1" />
                      <span>{new Date(event.date).toLocaleDateString()}</span>
                    </div>
                    <div className="flex items-center text-sm text-text-adaptive/70 dark:text-white/70 mt-1">
                      <MapPin size={16} className="mr-1" />
                      <span>{event.location}</span>
                    </div>
                    <Button
                      variant="secondary"
                      size="sm"
                      className="mt-3 w-full"
                      onClick={() => navigate(`/events/${event.id}`)}
                    >
                      {t('club:clubPage.actions.viewDetails')}
                    </Button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="bg-background-overlay rounded-lg p-6 text-center shadow-sm">
                <p className="text-text-adaptive/70 dark:text-white/70">{t('club:clubPage.messages.noUpcomingEvents')}</p>
              </div>
            )}
          </div>
        )}

        {/* News Tab */}
        {activeTab === 'news' && (
          <div>
            <div className="mb-6">
              <h2 className="text-xl font-bold text-text-adaptive dark:text-white">{t('club:clubPage.sections.allNews')}</h2>
              <p className="text-text-adaptive/70 dark:text-white/70 mt-1">
                {t('club:clubPage.messages.newsDescription')} {selectedClub?.name}.
              </p>
            </div>

            <div className="space-y-3">
              {selectedClub?.news?.length > 0 ? (
                selectedClub.news.map((item, index) => (
                  <div
                    key={index}
                    className="bg-background-overlay rounded-lg overflow-hidden shadow-sm"
                  >
                    {item.image && (
                      <img
                        src={item.image}
                        alt={item.title}
                        className="w-full h-40 object-cover"
                      />
                    )}
                    <div className="p-4">
                      <h3 className="font-medium text-text-adaptive dark:text-white">{item.title}</h3>
                      <p className="text-sm text-text-adaptive/70 dark:text-white/70 mt-1 line-clamp-3">
                        {item.summary}
                      </p>
                      <div className="flex justify-between items-center mt-3">
                        <span className="text-xs text-text-adaptive/60 dark:text-white/60">
                          {new Date(item.date).toLocaleDateString()}
                        </span>
                        <Button
                          variant="link"
                          size="sm"
                          className="p-0 h-auto text-secondary"
                          onClick={() => navigate(`/news/${item.id}`)}
                        >
                          {t('common:actions.readMore', 'Read More')}
                        </Button>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="bg-background-overlay rounded-lg p-6 text-center shadow-sm">
                  <p className="text-text-adaptive/70 dark:text-white/70">{t('club:clubPage.messages.noNewsAvailable')}</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function StatCard({ icon, title, value, label }) {
  return (
    <div className="bg-background-overlay p-4 rounded-lg shadow-sm">
      <div className="flex items-center gap-3">
        <div className="p-2 rounded-full bg-tertiary/10 icon">
          {icon}
        </div>
        <div>
          <h3 className="text-xs font-medium text-text-adaptive/60 dark:text-white/60">{title}</h3>
          <p className="text-xl font-bold text-text-adaptive dark:text-white">{value}</p>
          <p className="text-xs text-text-adaptive/60 dark:text-white/60">{label}</p>
        </div>
      </div>
    </div>
  );
} 