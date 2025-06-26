import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useUserContext } from '../hooks/useUserContext';
import { useWalletContext } from '../hooks/useWalletContext';
import { User, Trophy, Star, ShoppingBag, Ticket, Heart, UserCheck, Calendar, Clock, Settings, Edit, Loader2, Award, BadgeCheck, Lock, CheckCircle2, Medal, Target, Crown, Gift, Pin } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { showSuccess, showError } from '../lib/toast';
import userApi from '../api/user';
import clubApi from '../api/club';

// StatCard component for displaying user metrics
function StatCard({ icon, title, value, label }) {
  return (
    <div className="p-4 rounded-lg shadow-sm icon">
      <div className="flex items-center gap-3">
        <div className="p-2 rounded-full">
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

// Club Card component for displaying clubs the user follows
function ClubCard({ club, isHeartClub }) {
  return (
    <div className="bg-background-overlay p-4 rounded-lg shadow-sm flex items-center gap-4">
      <div className="h-14 w-14 rounded-full overflow-hidden bg-gray-100 dark:bg-gray-800 flex-shrink-0">
        {club.image ? (
          <img src={club.image} alt={club.club_name} className="h-full w-full object-cover" />
        ) : (
          <div className="h-full w-full flex items-center justify-center text-gray-400">
            <User size={24} />
          </div>
        )}
      </div>
      <div className="flex-grow">
        <div className="flex items-center gap-2">
          <h3 className="text-base font-semibold text-text-adaptive dark:text-white">{club.name}</h3>
          {isHeartClub && (
            <div className="p-0.5 rounded-full bg-red-100 dark:bg-red-900/20">
              <Heart size={14} className="text-red-500 fill-red-500" />
            </div>
          )}
        </div>
        {/* <p className="text-xs text-primary/60 dark:text-white/60">
          {club.club_type_name}
        </p> */}
      </div>
    </div>
  );
}

// Achievement Card component
function AchievementCard({ achievement, isPinned, onPinClick }) {
  const { t } = useTranslation(['common', 'achievements']);
  return (
    <div className={`bg-background-overlay p-4 rounded-lg shadow-sm border ${achievement.completed ? 'border-green-500/30' : 'border-gray-300/30 dark:border-white/10'} ${isPinned ? 'ring-2 ring-primary' : ''}`}>
      <div className="flex items-start gap-4">
        <div className={`h-16 w-16 rounded-lg flex-shrink-0 flex items-center justify-center ${achievement.completed ? 'bg-green-100 dark:bg-green-900/20' : 'bg-gray-100 dark:bg-gray-800'}`}>
          <div className="relative">
            {achievement.icon}
            {achievement.completed ? (
              <div className="absolute -bottom-2 -right-2 bg-green-500 rounded-full p-0.5">
                <BadgeCheck size={16} className="text-white" />
              </div>
            ) : (
              <div className="absolute -bottom-2 -right-2 bg-gray-500 rounded-full p-0.5">
                <Lock size={16} className="text-white" />
              </div>
            )}
          </div>
        </div>
        <div className="flex-grow">
          <div className="flex justify-between items-start">
            <div>
              <h3 className={`text-base font-semibold ${achievement.completed ? 'text-text-adaptive dark:text-white' : 'text-gray-500 dark:text-gray-400'}`}>
                {achievement.title}
              </h3>
              <p className={`text-xs ${achievement.completed ? 'text-text-adaptive/60 dark:text-white/60' : 'text-gray-500 dark:text-gray-400'}`}>
                {achievement.description}
              </p>
            </div>
            {achievement.completedDate && (
              <span className="text-xs text-green-600 dark:text-green-400">
                {achievement.completedDate}
              </span>
            )}
          </div>
          
          {!achievement.completed && achievement.progress && (
            <div className="mt-2">
              <div className="flex justify-between text-xs mb-1">
                <span>{achievement.progress.current}/{achievement.progress.required}</span>
                <span>{Math.round((achievement.progress.current / achievement.progress.required) * 100)}%</span>
              </div>
              <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-primary dark:bg-primary rounded-full" 
                  style={{ width: `${(achievement.progress.current / achievement.progress.required) * 100}%` }}
                ></div>
              </div>
            </div>
          )}
          
          {achievement.completed && (
            <div className="mt-2">
              <Button 
                variant="outline" 
                size="sm" 
                className={`w-full ${isPinned ? 'bg-primary/10 text-white dark:border-white/40' : 'border-white/30 dark:border-white/40 text-white'}`}
                onClick={() => onPinClick(achievement.id)}
                disabled={!achievement.completed}
              >
                <Pin size={14} className={`mr-1 ${isPinned ? 'fill-primary' : ''}`} />
                {isPinned ? t('profile.featured') : t('profile.setAsFeatured')}
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// Quest Card Component
function QuestCard({ quest, isPinned, onPinClick }) {
  const { t } = useTranslation(['common', 'quests']);
  return (
    <div className={`bg-background-overlay p-4 rounded-lg shadow-sm border border-primary/20 dark:border-white/10 ${isPinned ? 'ring-2 ring-primary' : ''}`}>
      <div className="flex items-start gap-4">
        <div className="h-16 w-16 rounded-lg flex-shrink-0 flex items-center justify-center bg-tertiary/10 dark:bg-tertiary">
          <Star size={28} className="text-white" />
        </div>
        <div className="flex-grow">
          <h3 className="text-base font-semibold text-text-adaptive dark:text-white">
            {quest.title}
          </h3>
          <p className="text-xs text-text-adaptive/60 dark:text-white/60 mb-2">
            {quest.description}
          </p>
          
          <div className="flex items-center justify-between">
            <span className="text-xs text-text-adaptive/60 dark:text-white/60">
              {t('profile.completed')}: {quest.completedDate}
            </span>
            <Button 
              variant="outline" 
              size="sm" 
              className={`${isPinned ? 'bg-primary/10 text-white dark:border-white/40' : 'border-white/30 dark:border-white/40 text-white'}`}
              onClick={() => onPinClick(quest.id)}
            >
              <Pin size={14} className={`mr-1 ${isPinned ? 'fill-primary' : ''}`} />
              {isPinned ? t('profile.featured') : t('profile.setAsFeatured')}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

// Featured Item Display component
function FeaturedItemCard({ item, type }) {
  const { t } = useTranslation(['common']);
  if (!item) return null;
  
  return (
    <div className="bg-background-overlay p-4 rounded-lg shadow-sm border border-primary">      
      <div className="flex items-start gap-4">
        <div className="h-12 w-12 rounded-lg flex-shrink-0 flex items-center justify-center bg-tertiary/10 icon">
          {type === t('profile.achievement') ? item.icon : <Star size={24} className="text-white" />}
        </div>
        <div>
          <h4 className="text-sm font-semibold text-text-adaptive dark:text-white">{item.title}</h4>
          <p className="text-xs text-text-adaptive/60 dark:text-white/60">{item.description}</p>
        </div>
      </div>
    </div>
  );
}

export default function ProfilePage() {
  const { t } = useTranslation(['common', 'achievements', 'quests']);
  const navigate = useNavigate();
  const { userData, loading, error, userClubsData, updateUserData } = useUserContext();
  const { isAuthenticated, isInitialized } = useWalletContext();
  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [totalStats, setTotalStats] = useState({
    points: 0,
    quests: 0, 
    orders: 0,
    tickets: 0
  });
  const [activeTab, setActiveTab] = useState('overview');
  
  // State for featured items
  const [featuredAchievement, setFeaturedAchievement] = useState(null);
  const [featuredQuest, setFeaturedQuest] = useState(null);
  
  // Mock achievements data
  const achievements = useMemo(() => [
    {
      id: 1,
      title: t('achievements:firstSteps.title', "First Steps"),
      description: t('achievements:firstSteps.description', "Complete your first quest"),
      completed: true,
      completedDate: "Jan 15, 2023",
      icon: <CheckCircle2 size={28} className="text-green-500" />,
      rarity: "common"
    },
    {
      id: 2,
      title: t('achievements:clubExplorer.title', "Club Explorer"),
      description: t('achievements:clubExplorer.description', "Follow 3 different clubs"),
      completed: true,
      completedDate: "Feb 3, 2023",
      icon: <Heart size={28} className="text-red-500" />,
      rarity: "common"
    },
    {
      id: 3,
      title: t('achievements:questMaster.title', "Quest Master"),
      description: t('achievements:questMaster.description', "Complete 10 quests"),
      completed: false,
      progress: {
        current: 7,
        required: 10
      },
      icon: <Target size={28} className="text-blue-500" />,
      rarity: "uncommon"
    },
    {
      id: 4,
      title: t('achievements:ticketCollector.title', "Ticket Collector"),
      description: t('achievements:ticketCollector.description', "Purchase 5 tickets to events"),
      completed: false,
      progress: {
        current: 2,
        required: 5
      },
      icon: <Ticket size={28} className="text-purple-500" />,
      rarity: "uncommon"
    },
    {
      id: 5,
      title: t('achievements:loyalFan.title', "Loyal Fan"),
      description: t('achievements:loyalFan.description', "Follow the same heart club for 30 days"),
      completed: true,
      completedDate: "Mar 10, 2023",
      icon: <Medal size={28} className="text-yellow-500" />,
      rarity: "rare"
    },
    {
      id: 6,
      title: t('achievements:earlySupporter.title', "Early Supporter"),
      description: t('achievements:earlySupporter.description', "Be one of the first 1000 users to join the platform"),
      completed: true,
      completedDate: "Dec 1, 2022",
      icon: <Trophy size={28} className="text-amber-500" />,
      rarity: "legendary"
    },
    {
      id: 7,
      title: t('achievements:pointHoarder.title', "Point Hoarder"),
      description: t('achievements:pointHoarder.description', "Accumulate 10,000 points across all clubs"),
      completed: false,
      progress: {
        current: 3250,
        required: 10000
      },
      icon: <Star size={28} className="text-yellow-500" />,
      rarity: "epic"
    },
    {
      id: 8,
      title: t('achievements:merchEnthusiast.title', "Merch Enthusiast"),
      description: t('achievements:merchEnthusiast.description', "Purchase 3 different merchandise items"),
      completed: false,
      progress: {
        current: 1,
        required: 3
      },
      icon: <ShoppingBag size={28} className="text-green-500" />,
      rarity: "uncommon"
    },
    {
      id: 9,
      title: t('achievements:royalty.title', "Royalty"),
      description: t('achievements:royalty.description', "Reach the highest fan tier in any club"),
      completed: false,
      icon: <Crown size={28} className="text-amber-500" />,
      rarity: "legendary"
    },
    {
      id: 10,
      title: t('achievements:luckyWinner.title', "Lucky Winner"),
      description: t('achievements:luckyWinner.description', "Win a giveaway or contest"),
      completed: true,
      completedDate: "Apr 5, 2023",
      icon: <Gift size={28} className="text-pink-500" />,
      rarity: "rare"
    }
  ], [t]);

  // Mock quests data
  const completedQuests = useMemo(() => [
    {
      id: 1,
      title: t('quests:dailyLogin.title', "Daily Login"),
      description: t('quests:dailyLogin.description', "Log in 7 days in a row"),
      completedDate: "May 15, 2023",
      points: 50
    },
    {
      id: 2,
      title: t('quests:matchPrediction.title', "Match Prediction"),
      description: t('quests:matchPrediction.description', "Correctly predict the outcome of a match"),
      completedDate: "May 12, 2023",
      points: 100
    },
    {
      id: 3,
      title: t('quests:firstPurchase.title', "First Purchase"),
      description: t('quests:firstPurchase.description', "Make your first merchandise purchase"),
      completedDate: "Apr 30, 2023",
      points: 150
    },
    {
      id: 4,
      title: t('quests:socialShare.title', "Social Share"),
      description: t('quests:socialShare.description', "Share club content on social media"),
      completedDate: "Apr 28, 2023",
      points: 75
    }
  ], [t]);
  
  // Calculate achievement progress stats
  const achievementStats = {
    total: achievements.length,
    completed: achievements.filter(a => a.completed).length,
    percentage: Math.round((achievements.filter(a => a.completed).length / achievements.length) * 100)
  };

  // Set form data when user data changes
  useEffect(() => {
    if (userData) {
      setFormData({
        name: userData.name || '',
      });
    }
  }, [userData]);

  // Redirect to home if not authenticated
  useEffect(() => {
    if (isInitialized && !isAuthenticated) {
      navigate('/');
    }
  }, [isAuthenticated, isInitialized, navigate]);

  // Fetch total stats across all clubs
  useEffect(() => {
    const fetchTotalStats = async () => {
      if (!userClubsData?.clubs?.length) {
        return;
      }
      
      let points = 0;
      let quests = 0;
      let orders = 0;
      let tickets = 0;
      
      for (const club of userClubsData.clubs) {
        try {
          const stats = await clubApi.getUserClubStats(club.club_id);
          if (stats) {
            points += parseInt(stats.points || 0);
            quests += parseInt(stats.quests || 0);
            orders += parseInt(stats.orders || 0);
            tickets += parseInt(stats.tickets || 0);
          }
        } catch (error) {
          console.error(`Error fetching stats for club ${club.club_id}:`, error);
        }
      }
      
      setTotalStats({
        points,
        quests,
        orders,
        tickets
      });
    };
    
    fetchTotalStats();
  }, [userClubsData]);

  // Load featured items from local storage or API
  useEffect(() => {
    try {
      const storedAchievement = localStorage.getItem('featuredAchievement');
      const storedQuest = localStorage.getItem('featuredQuest');
      
      if (storedAchievement) {
        const achievementId = parseInt(storedAchievement);
        const achievement = achievements.find(a => a.id === achievementId && a.completed);
        if (achievement) {
          setFeaturedAchievement(achievement);
        }
      }
      
      if (storedQuest) {
        const questId = parseInt(storedQuest);
        const quest = completedQuests.find(q => q.id === questId);
        if (quest) {
          setFeaturedQuest(quest);
        }
      }
    } catch (error) {
      console.error('Error loading featured items:', error);
    }
  }, [achievements, completedQuests]);
  
  // Save featured items to local storage or API
  const saveFeaturedItems = async () => {
    try {
      // Save to local storage for now
      if (featuredAchievement) {
        localStorage.setItem('featuredAchievement', featuredAchievement.id.toString());
      } else {
        localStorage.removeItem('featuredAchievement');
      }
      
      if (featuredQuest) {
        localStorage.setItem('featuredQuest', featuredQuest.id.toString());
      } else {
        localStorage.removeItem('featuredQuest');
      }
      
      // In a real app, you would save to API as well
      // await userApi.updateFeaturedItems({
      //   achievementId: featuredAchievement?.id,
      //   questId: featuredQuest?.id
      // });
      
      showSuccess('Featured items updated');
    } catch (error) {
      console.error('Error saving featured items:', error);
      showError('Failed to update featured items');
    }
  };

  const handlePinAchievement = (achievementId) => {
    const achievement = achievements.find(a => a.id === achievementId);
    
    if (featuredAchievement?.id === achievementId) {
      setFeaturedAchievement(null);
    } else if (achievement && achievement.completed) {
      setFeaturedAchievement(achievement);
    }
    
    // Save changes
    setTimeout(saveFeaturedItems, 100);
  };
  
  const handlePinQuest = (questId) => {
    const quest = completedQuests.find(q => q.id === questId);
    
    if (featuredQuest?.id === questId) {
      setFeaturedQuest(null);
    } else {
      setFeaturedQuest(quest);
    }
    
    // Save changes
    setTimeout(saveFeaturedItems, 100);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      await userApi.updateUserProfile(formData);
      await updateUserData();
      setEditMode(false);
      showSuccess('Profile updated successfully');
    } catch (error) {
      console.error('Error updating profile:', error);
      showError('Failed to update profile');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  if (loading) {
    return (
      <div className="container max-w-4xl mx-auto py-8 px-4">
        <div className="flex justify-center items-center h-40">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container max-w-4xl mx-auto py-8 px-4">
        <div className="p-4 rounded-lg bg-destructive/10 border border-destructive text-destructive">
          <p className="font-semibold">{t('profile.errorLoading')}</p>
          <p className="text-sm">{error}</p>
          <Button 
            className="mt-4"
            onClick={updateUserData}
          >
            {t('actions.retry')}
          </Button>
        </div>
      </div>
    );
  }

  if (!userData) {
    return (
      <div className="container max-w-4xl mx-auto py-8 px-4">
        <div className="p-4 rounded-lg bg-background/50 border border-border">
          <p className="text-muted-foreground">{t('profile.notAvailable')}</p>
        </div>
      </div>
    );
  }

  const registrationDate = userData.register_date ? new Date(userData.register_date).toLocaleDateString() : t('common.notAvailable');

  return (
    <div className="container max-w-4xl mx-auto py-8 px-4 min-h-[calc(100vh-4rem)]">
      {/* Profile Header */}
      <div className="mb-8">
        <div className="rounded-xl overflow-hidden mb-6 bg-gradient-to-r from-primary to-secondary/80 p-8">
          <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
            <div className="h-24 w-24 rounded-full bg-white/20 flex items-center justify-center text-white">
              <User size={48} className="text-black" />
            </div>
            
            <div className="flex-grow text-center md:text-left">
              {editMode ? (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label htmlFor="name" className="block text-xs text-black/80 mb-1">{t('profile.name')}</label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      disabled={true}
                      value={formData.name}
                      onChange={handleInputChange}
                      className="w-full p-2 rounded-md border border-white/20 bg-white/10 text-black"
                      placeholder={t('profile.yourName')}
                    />
                  </div>
                  
                  <div className="flex gap-2">
                    <Button 
                      type="button" 
                      variant="outline"
                      onClick={() => setEditMode(false)}
                      className="border-black text-black hover:bg-white/10"
                    >
                      {t('actions.cancel')}
                    </Button>
                    <Button 
                      type="submit" 
                      disabled={isSubmitting}
                      className="bg-tertiary/90 text-white hover:bg-tertiary/90"
                    >
                      {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                      {t('actions.save')}
                    </Button>
                  </div>
                </form>
              ) : (
                <>
                  <h1 className="text-2xl font-bold mb-1 text-black">{userData.name}</h1>
                  <p className="text-sm text-black/80 mb-4">{userData.wallet_address}</p>
                  
                  <div className="flex flex-wrap gap-4">
                    <div className="flex items-center text-black/80 text-sm">
                      <Calendar size={16} className="mr-2" />
                      {t('profile.joined')}: {registrationDate}
                    </div>
                    {userData.update_date && (
                      <div className="flex items-center text-black/80 text-sm">
                        <Clock size={16} className="mr-2" />
                        {t('profile.lastUpdated')}: {new Date(userData.update_date).toLocaleDateString()}
                      </div>
                    )}
                  </div>
                  
                  <Button 
                    variant="outline" 
                    className="mt-4 border-foreground text-black hover:bg-tertiary/10 dark:border-black dark:text-black dark:hover:bg-black/10"
                    onClick={() => setEditMode(true)}
                  >
                    <Edit size={16} className="mr-2 text-black" />
                    {t('profile.editProfile')}
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
      
      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <StatCard
          icon={<Trophy size={24} className="" />}
          title={t('profile.points')}
          value={totalStats.points.toLocaleString()}
          label={t('profile.earnedPoints')}
        />
        <StatCard
          icon={<Star size={24} className="" />}
          title={t('profile.completedQuests')}
          value={totalStats.quests.toLocaleString()}
          label={t('profile.quests')}
        />
        <StatCard
          icon={<ShoppingBag size={24} className="" />}
          title={t('profile.orders')}
          value={totalStats.orders.toLocaleString()}
          label={t('profile.placedOrders')}
        />
        <StatCard
          icon={<Ticket size={24} className="" />}
          title={t('profile.tickets')}
          value={totalStats.tickets.toLocaleString()}
          label={t('profile.purchasedTickets')}
        />
      </div>
      
      {/* Featured Items Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
        <FeaturedItemCard 
          item={featuredAchievement} 
          type={t('profile.achievement')} 
        />
        <FeaturedItemCard 
          item={featuredQuest} 
          type={t('profile.quest')} 
        />
      </div>
      
      {/* Achievement Progress */}
      <div className="mb-8 bg-background-overlay p-4 rounded-lg shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-full icon">
              <Award size={24} className="" />
            </div>
            <div>
              <h3 className="text-xs font-medium text-text-adaptive/60 dark:text-white/60">{t('profile.achievements')}</h3>
              <p className="text-xl font-bold text-text-adaptive dark:text-white">{achievementStats.completed}/{achievementStats.total}</p>
            </div>
          </div>
          <div className="flex-grow max-w-md">
            <div className="flex justify-between text-xs mb-1">
              <span className="text-text-adaptive/70 dark:text-white/70">{t('profile.progress')}</span>
              <span className="text-text-adaptive/70 dark:text-white/70">{achievementStats.percentage}%</span>
            </div>
            <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
              <div 
                className="h-full bg-primary dark:bg-primary rounded-full" 
                style={{ width: `${achievementStats.percentage}%` }}
              ></div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Tabs for different sections */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="w-full mb-6">
          <TabsTrigger value="overview" className="flex-grow">{t('profile.overview')}</TabsTrigger>
          <TabsTrigger value="achievements" className="flex-grow">{t('profile.achievements')}</TabsTrigger>
          <TabsTrigger value="quests" className="flex-grow">{t('profile.quests')}</TabsTrigger>
          <TabsTrigger value="settings" className="flex-grow">{t('profile.settings')}</TabsTrigger>
        </TabsList>
        
        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 gap-6">
            <div className="bg-background-overlay p-6 rounded-lg shadow-sm">
              <h2 className="text-lg font-semibold text-text-adaptive dark:text-white mb-4">{t('profile.accountInfo')}</h2>
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h3 className="text-sm font-medium text-text-adaptive/60 dark:text-white/60">{t('profile.name')}</h3>
                    <p className="text-text-adaptive dark:text-white">{userData.name}</p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-text-adaptive/60 dark:text-white/60">{t('profile.wallet')}</h3>
                    <p className="text-text-adaptive dark:text-white font-mono text-sm truncate">{userData.wallet_address}</p>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h3 className="text-sm font-medium text-text-adaptive/60 dark:text-white/60">{t('profile.registrationDate')}</h3>
                    <p className="text-text-adaptive dark:text-white">{registrationDate}</p>
                  </div>
                  {userData.update_date && (
                    <div>
                      <h3 className="text-sm font-medium text-text-adaptive/60 dark:text-white/60">{t('profile.lastUpdated')}</h3>
                      <p className="text-text-adaptive dark:text-white">{new Date(userData.update_date).toLocaleDateString()}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </TabsContent>
        
        <TabsContent value="achievements" className="space-y-6">
          <div className="bg-background-overlay p-6 rounded-lg shadow-sm">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-lg font-semibold text-text-adaptive dark:text-white">{t('profile.achievements')}</h2>
              <div className="flex items-center gap-2">
                <div className="w-40 h-4 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-primary dark:bg-primary rounded-full" 
                    style={{ width: `${achievementStats.percentage}%` }}
                  ></div>
                </div>
                <span className="text-sm text-text-adaptive/70 dark:text-white/70">
                  {achievementStats.completed}/{achievementStats.total}
                </span>
              </div>
            </div>
            
            <div className="grid grid-cols-1 gap-4">
              {/* Rarity filter buttons */}
              <div className="flex flex-wrap gap-2 mb-4">
                <Button variant="outline" size="sm" className="bg-primary/10 dark:bg-primary/30 border-primary/40 dark:border-primary/60 text-text-adaptive dark:text-white font-medium">
                  {t('profile.all')}
                </Button>
                <Button variant="outline" size="sm" className="border-gray-300 dark:border-gray-600 text-text-adaptive dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800">{t('profile.common')}</Button>
                <Button variant="outline" size="sm" className="border-blue-300 dark:border-blue-600 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20">{t('profile.uncommon')}</Button>
                <Button variant="outline" size="sm" className="border-purple-300 dark:border-purple-600 text-purple-600 dark:text-purple-400 hover:bg-purple-50 dark:hover:bg-purple-900/20">{t('profile.rare')}</Button>
                <Button variant="outline" size="sm" className="border-pink-300 dark:border-pink-600 text-pink-600 dark:text-pink-400 hover:bg-pink-50 dark:hover:bg-pink-900/20">{t('profile.epic')}</Button>
                <Button variant="outline" size="sm" className="border-amber-300 dark:border-amber-600 text-amber-600 dark:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-900/20">{t('profile.legendary')}</Button>
              </div>
              
              {/* Achievement cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {achievements.map(achievement => (
                  <AchievementCard 
                    key={achievement.id}
                    achievement={achievement}
                    isPinned={featuredAchievement?.id === achievement.id}
                    onPinClick={handlePinAchievement}
                  />
                ))}
              </div>
            </div>
          </div>
          
          {/* Recent achievements */}
          <div className="bg-background-overlay p-6 rounded-lg shadow-sm">
            <h2 className="text-lg font-semibold text-text-adaptive dark:text-white mb-4">{t('profile.recentlyUnlocked')}</h2>
            
            {achievements.filter(a => a.completed).length > 0 ? (
              <div className="space-y-4">
                {achievements
                  .filter(a => a.completed)
                  .sort((a, b) => new Date(b.completedDate) - new Date(a.completedDate))
                  .slice(0, 3)
                  .map(achievement => (
                    <div key={achievement.id} className="flex items-center gap-3 p-3 rounded-lg bg-green-50 dark:bg-green-900/10 border border-green-100 dark:border-green-900/30">
                      <div className="h-10 w-10 rounded-full bg-green-100 dark:bg-green-900/20 flex items-center justify-center">
                        {achievement.icon}
                      </div>
                      <div>
                        <h4 className="text-sm font-medium text-text-adaptive dark:text-white">{achievement.title}</h4>
                        <p className="text-xs text-text-adaptive/60 dark:text-white/60">{t('profile.unlockedOn')} {achievement.completedDate}</p>
                      </div>
                    </div>
                  ))
                }
              </div>
            ) : (
              <div className="p-4 rounded-lg border border-dashed border-foreground/20 dark:border-white/20 text-center">
                <p className="text-text-adaptive/70 dark:text-white/70">{t('profile.noAchievementsYet')}</p>
              </div>
            )}
          </div>
        </TabsContent>
        
        {/* New Quests Tab */}
        <TabsContent value="quests" className="space-y-6">
          <div className="bg-background-overlay p-6 rounded-lg shadow-sm">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-lg font-semibold text-text-adaptive dark:text-white">{t('profile.completedQuests')}</h2>
              <span className="text-sm bg-primary/10 px-2 py-1 rounded-full text-text-adaptive">
                {completedQuests.length} {t('profile.quests').toLowerCase()}
              </span>
            </div>
            
            <div className="grid grid-cols-1 gap-4">
              {completedQuests.map(quest => (
                <QuestCard 
                  key={quest.id}
                  quest={quest}
                  isPinned={featuredQuest?.id === quest.id}
                  onPinClick={handlePinQuest}
                />
              ))}
            </div>
          </div>
        </TabsContent>
        

        
        <TabsContent value="settings" className="space-y-6">
          <div className="bg-background-overlay p-6 rounded-lg shadow-sm">
            <h2 className="text-lg font-semibold text-text-adaptive dark:text-white mb-4">{t('profile.accountSettings')}</h2>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="settings-name" className="block text-sm font-medium text-foreground/80 mb-1">
                  {t('profile.displayName')}
                </label>
                <input
                  type="text"
                  id="settings-name"
                  name="name"
                  disabled={true}
                  value={formData.name}
                  onChange={handleInputChange}
                  className="w-full p-2 rounded-md border border-foreground/20 dark:border-white/20 bg-background dark:bg-[#0D0718] text-foreground"
                  placeholder={t('profile.yourDisplayName')}
                />
              </div>
              
              <Button 
                type="submit" 
                disabled={isSubmitting}
                className="mt-2 bg-tertiary/90 text-white hover:bg-tertiary/90"
              >
                {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Settings size={16} className="mr-2" />}
                {t('actions.saveChanges')}
              </Button>
            </form>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
} 