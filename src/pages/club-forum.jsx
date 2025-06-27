import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Plus, MessageCircle, Clock, Search, Flame, TrendingUp, Users, Filter, Tag, ArrowLeft, Home, Bell, Bookmark, Settings, User, Calendar, MoreHorizontal } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Textarea } from '../components/ui/textarea';
import { Input } from '../components/ui/input';
import { Separator } from '../components/ui/separator';
import { Avatar } from '../components/ui/avatar';
import { Card } from '../components/ui/card';
import { ForumPostCard } from '../components/ui/forum-post-card';
import { useWalletContext } from '../hooks/useWalletContext';
import { useUserContext } from '../hooks/useUserContext';
import { showError, showSuccess } from '../lib/toast';
import forumApi from '../api/forum';
import clubApi from '../api/club';
import { useTranslation } from 'react-i18next';

// Tab navigation item for Twitter-like header
const NavItem = ({ icon, label, active, onClick }) => (
  <button
    className={`flex items-center gap-2 px-4 py-3 transition-colors ${
      active 
        ? 'font-bold border-b-4 border-tertiary text-tertiary dark:text-blue-400 bg-tertiary/10 dark:bg-blue-900/30' 
        : 'text-text-adaptive dark:text-gray-100 border-b-4 border-transparent hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-tertiary dark:hover:text-blue-400'
    }`}
    onClick={onClick}
  >
    {icon}
    <span className="hidden sm:inline">{label}</span>
  </button>
);

// Category badges for forum posts
const CategoryBadge = ({ category, active, onClick }) => {
  const { t } = useTranslation(['forum']);
  
  const getIcon = (cat) => {
    switch (cat) {
      case 'all': return <Users size={16} />;
      case 'trending': return <TrendingUp size={16} />;
      case 'hot': return <Flame size={16} />;
      case 'match': return <Tag size={16} />;
      case 'general': return <MessageCircle size={16} />;
      default: return <MessageCircle size={16} />;
    }
  };
  
  return (
    <button 
      className={`flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition-colors ${
        active 
          ? 'bg-secondary text-text-adaptive shadow-md' 
          : 'bg-gray-100 dark:bg-gray-800 text-text-adaptive dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-700'
      }`}
      onClick={() => onClick(category)}
    >
      {getIcon(category)}
      <span>{t(`forum:categories.${category}`)}</span>
    </button>
  );
};

export default function ClubForumPage() {
  const { clubId } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated, isInitialized } = useWalletContext();
  const { isFollowingClub, isUserHeartClub } = useUserContext();
  const { t } = useTranslation(['forum', 'common']);
  
  const [loading, setLoading] = useState(true);
  const [posts, setPosts] = useState([]);
  const [filteredPosts, setFilteredPosts] = useState([]);
  const [clubData, setClubData] = useState(null);
  const [newPostTitle, setNewPostTitle] = useState('');
  const [newPostContent, setNewPostContent] = useState('');
  const [submitLoading, setSubmitLoading] = useState(false);
  const [activeCategory, setActiveCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  
  // For Twitter-like tabs
  const [activeTab, _setActiveTab] = useState('latest');
  
  // User is viewing the create post form in expanded mode
  const [expandedCreatePost, setExpandedCreatePost] = useState(false);
  
  const categories = ['all', 'trending', 'hot', 'match', 'general'];
  
  useEffect(() => {
    const checkAccessAndLoadData = async () => {
      try {
        if (isInitialized && !isAuthenticated) {
          navigate('/');
          return;
        }
        
        // Check if user is following this club or has it as heart club
        const hasAccess = await isFollowingClub(clubId) || await isUserHeartClub(clubId);
        if (!hasAccess) {
          showError(t('forum:forum.noAccess'));
          navigate(`/clubs/${clubId}`);
          return;
        }
        
        setLoading(true);
        
        // Load club data
        const club = await clubApi.getClubById(clubId);
        setClubData(club);
        
        // Load forum posts
        await loadPosts();
      } catch (error) {
        console.error('Error loading forum data:', error);
        showError(t('forum:forum.error'));
      } finally {
        setLoading(false);
      }
    };
    
    checkAccessAndLoadData();
  }, [clubId, isAuthenticated, navigate, isFollowingClub, isUserHeartClub, t]);
  
  // Filter posts when category or search changes
  useEffect(() => {
    filterPosts();
  }, [posts, activeCategory, searchQuery, activeTab]);
  
  const filterPosts = () => {
    let result = [...posts];
    
    // Filter by category
    if (activeCategory !== 'all') {
      result = result.filter(post => post.category === activeCategory);
    }
    
    // Filter by tab
    if (activeTab === 'trending') {
      result = result.sort((a, b) => b.likes - a.likes);
    }
    
    // Filter by search query
    if (searchQuery.trim() !== '') {
      const query = searchQuery.toLowerCase();
      result = result.filter(post => 
        post.title.toLowerCase().includes(query) || 
        post.content.toLowerCase().includes(query) ||
        post.author.name.toLowerCase().includes(query)
      );
    }
    
    setFilteredPosts(result);
  };
  
  const loadPosts = async () => {
    try {
      const forumPosts = await forumApi.getClubPosts(clubId);
      setPosts(forumPosts);
      setFilteredPosts(forumPosts);
    } catch (error) {
      console.error('Error loading posts:', error);
      showError(t('forum:forum.loadPostsError'));
    }
  };
  
  const handleSubmitPost = async () => {
    try {
      if (!newPostTitle.trim()) {
        showError('Post title is required');
        return;
      }
      
      if (!newPostContent.trim()) {
        showError('Post content is required');
        return;
      }
      
      setSubmitLoading(true);
      
      await forumApi.createPost({
        clubId,
        title: newPostTitle,
        content: newPostContent,
        category: 'general' // Default category for new posts
      });
      
      // Reset form and reload posts
      setNewPostTitle('');
      setNewPostContent('');
      setExpandedCreatePost(false);
      showSuccess(t('forum:forum.createSuccess'));
      
      // Reload posts to show the new one
      await loadPosts();
    } catch (error) {
      console.error('Error creating post:', error);
      showError(t('forum:forum.createPostError'));
    } finally {
      setSubmitLoading(false);
    }
  };
  
  const handleLikePost = async (postId) => {
    try {
      await forumApi.likePost(postId);
      
      // Update the local state to reflect the like
      setPosts(posts.map(post => {
        if (post.id === postId) {
          return {
            ...post,
            likes: post.likes + 1,
            userLiked: true
          };
        }
        return post;
      }));
    } catch (error) {
      console.error('Error liking post:', error);
      showError(t('forum:forum.likePostError'));
    }
  };
  
  const handleViewComments = (postId) => {
    // Navigate to post detail view with comments
    navigate(`/clubs/${clubId}/forum/post/${postId}`);
  };
  
  // Make entire post card clickable
  const handlePostClick = (postId) => {
    navigate(`/clubs/${clubId}/forum/post/${postId}`);
  };
  
  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="flex justify-center items-center h-screen">
          <div className="relative">
            <div className="animate-spin w-10 h-10 border-4 border-primary/20 border-t-primary rounded-full"></div>
          </div>
          <p className="ml-3 text-primary/60 dark:text-white/60">{t('forum:forum.loading')}</p>
        </div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-background">
      {/* <header className="sticky top-0 z-10 bg-background-overlay dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 backdrop-blur-sm bg-white/80 dark:bg-gray-900/80">
        <div className="flex overflow-x-auto border-b-2 border-gray-200 dark:border-gray-700">
          <NavItem 
            icon={<Home size={18} className={activeTab === 'latest' ? 'text-tertiary dark:text-blue-400' : ''} />} 
            label={t('forum:tabs.latest')}
            active={activeTab === 'latest'} 
            onClick={() => setActiveTab('latest')}
          />
          <NavItem 
            icon={<TrendingUp size={18} className={activeTab === 'trending' ? 'text-tertiary dark:text-blue-400' : ''} />} 
            label={t('forum:tabs.trending')}
            active={activeTab === 'trending'} 
            onClick={() => setActiveTab('trending')}
          />
          <NavItem 
            icon={<MessageCircle size={18} className={activeTab === 'mine' ? 'text-tertiary dark:text-blue-400' : ''} />} 
            label={t('forum:tabs.mine')}
            active={activeTab === 'mine'} 
            onClick={() => setActiveTab('mine')}
          />
        </div>
      </header> */}
      
      <div className="container mx-auto max-w-screen-xl">
        <div className="grid grid-cols-1 lg:grid-cols-12 min-h-screen">
          {/* Left sidebar - Twitter style */}
          <aside className="hidden lg:block lg:col-span-3 px-4 py-6 border-r border-gray-200 dark:border-gray-800">
            <div className="sticky top-20 space-y-6">
              <div className="flex flex-col space-y-1">
                <Button 
                  variant="normal" 
                  className="justify-start text-lg font-semibold py-3 px-4 rounded-full text-text-adaptive dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-tertiary"
                >
                  <Bell size={20} className="mr-4" />
                  <span>{t('forum:sidebar.notifications')}</span>
                </Button>
                <Button 
                  variant="normal" 
                  className="justify-start text-lg font-semibold py-3 px-4 rounded-full text-text-adaptive dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-tertiary"
                >
                  <Bookmark size={20} className="mr-4" />
                  <span>{t('forum:sidebar.bookmarks')}</span>
                </Button>
              </div>
              
              <Button className="w-full rounded-full py-6 bg-secondary hover:bg-secondary/90 text-text-adaptive">
                {t('forum:sidebar.newPost')}
              </Button>
              
              {/* <div className="mt-auto">
                <div className="flex items-center gap-3 p-3 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full cursor-pointer">
                  <Avatar className="h-10 w-10">
                    <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=CurrentUser" alt="Your profile" />
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold truncate">Your Name</p>
                    <p className="text-gray-500 dark:text-gray-400 text-sm truncate">@username</p>
                  </div>
                  <MoreHorizontal size={16} className="text-gray-500" />
                </div>
              </div> */}
            </div>
          </aside>
          
          {/* Main content - Timeline */}
          <main className="lg:col-span-5 border-r border-gray-200 dark:border-gray-800">
            {/* Create post input - Twitter style */}
            <div className="border-b border-gray-200 dark:border-gray-800 p-2 sm:p-4">
              <div className="flex gap-2 sm:gap-3">
                <Avatar className="h-8 w-8 sm:h-10 sm:w-10 flex-shrink-0">
                  <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=CurrentUser" alt="Your profile" />
                </Avatar>
                
                <div className="flex-1 space-y-3 sm:space-y-4 min-w-0 overflow-hidden">
                  {!expandedCreatePost ? (
                    <div className="flex flex-col gap-2">
                      <button 
                        onClick={() => setExpandedCreatePost(true)}
                        className="text-left text-gray-600 dark:text-gray-300 hover:text-tertiary font-medium"
                      >
                        {t('forum:createPost.prompt')}
                      </button>
                    </div>
                  ) : (
                    <>
                      <Input
                        placeholder={t('forum:createPost.title')}
                        value={newPostTitle}
                        onChange={(e) => setNewPostTitle(e.target.value)}
                        className="border-0 border-b border-gray-200 dark:border-gray-800 rounded-none px-0 text-lg font-bold focus-visible:ring-0 w-full"
                      />
                      <Textarea
                        placeholder={t('forum:createPost.prompt')}
                        className="min-h-[100px] border-0 resize-none focus-visible:ring-0 px-0 w-full"
                        value={newPostContent}
                        onChange={(e) => setNewPostContent(e.target.value)}
                      />
                      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-0 pt-2 border-t border-gray-200 dark:border-gray-800">
                        <div className="flex flex-wrap gap-1 w-full sm:w-auto">
                          {categories.map(category => (
                            <Button 
                              key={category} 
                              variant="normal" 
                              size="sm" 
                              className="rounded-full text-xs text-text-adaptive dark:text-gray-200 hover:text-tertiary hover:bg-gray-100 dark:hover:bg-gray-800"
                            >
                              {category !== 'all' ? t(`forum:categories.${category}`) : t('forum:createPost.categories.general')}
                            </Button>
                          ))}
                        </div>
                        <div className="flex gap-2 w-full sm:w-auto justify-end mt-2 sm:mt-0">
                          <Button 
                            variant="outline" 
                            size="sm" 
                            onClick={() => {
                              setExpandedCreatePost(false);
                              setNewPostTitle('');
                              setNewPostContent('');
                            }}
                            className="rounded-full border-gray-400 dark:border-gray-500 text-text-adaptive dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-white"
                          >
                            {t('forum:createPost.cancel')}
                          </Button>
                          <Button 
                            size="sm"
                            onClick={handleSubmitPost}
                            disabled={submitLoading || !newPostTitle.trim() || !newPostContent.trim()}
                            className="rounded-full bg-primary hover:bg-primary/90 text-text-adaptive"
                          >
                            {submitLoading ? (
                              <span className="flex items-center gap-2">
                                <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full"></div>
                                <span>{t('forum:createPost.posting')}</span>
                              </span>
                            ) : t('forum:createPost.post')}
                          </Button>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>
            
            {/* Categories filter */}
            <div className="p-3 overflow-x-auto flex items-center gap-2 border-b border-gray-200 dark:border-gray-800">
              {categories.map(category => (
                <CategoryBadge 
                  className=""
                  key={category} 
                  category={category} 
                  active={activeCategory === category}
                  onClick={setActiveCategory}
                />
              ))}
            </div>
            
            {/* Posts list - Twitter style feed */}
            {filteredPosts.length === 0 ? (
              <div className="flex flex-col items-center justify-center p-10 text-center h-[50vh]">
                <MessageCircle size={48} className="text-gray-400 mb-4" />
                {searchQuery.trim() !== '' ? (
                  <>
                    <h3 className="text-xl font-medium mb-2">{t('forum:emptyState.noResults.title')}</h3>
                    <p className="text-gray-500 dark:text-gray-400 mb-6">{t('forum:emptyState.noResults.description')}</p>
                    <Button 
                      onClick={() => setSearchQuery('')}
                      className="rounded-full"
                    >
                      {t('forum:emptyState.noResults.button')}
                    </Button>
                  </>
                ) : activeCategory !== 'all' ? (
                  <>
                    <h3 className="text-xl font-medium mb-2">{t('forum:emptyState.noCategory.title')}</h3>
                    <p className="text-gray-500 dark:text-gray-400 mb-6">{t('forum:emptyState.noCategory.description')}</p>
                    <Button 
                      onClick={() => setActiveCategory('all')}
                      className="rounded-full bg-tertiary hover:bg-tertiary/90"
                    >
                      {t('forum:emptyState.noCategory.button')}
                    </Button>
                  </>
                ) : (
                  <>
                    <h3 className="text-xl font-medium mb-2">{t('forum:emptyState.noPosts.title')}</h3>
                    <p className="text-gray-500 dark:text-gray-400 mb-6">{t('forum:emptyState.noPosts.description')}</p>
                    <Button 
                      onClick={() => setExpandedCreatePost(true)}
                      className="rounded-full"
                    >
                      {t('forum:emptyState.noPosts.button')}
                    </Button>
                  </>
                )}
              </div>
            ) : (
              <div>
                {filteredPosts.map((post) => (
                  <div 
                    key={post.id} 
                    className="border-b border-gray-200 dark:border-gray-800 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-900/50" 
                    onClick={() => handlePostClick(post.id)}
                  >
                    <ForumPostCard 
                      post={post} 
                      onLike={handleLikePost}
                      onClickComments={handleViewComments}
                    />
                  </div>
                ))}
              </div>
            )}
          </main>
          
          {/* Right sidebar - Search, trends, who to follow */}
          <aside className="hidden lg:block lg:col-span-4 px-6 py-4">
            <div className="sticky top-20 space-y-6">
              {/* Search */}
              <div className="relative">
                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                  <Search size={18} className="text-gray-400" />
                </div>
                <Input
                  type="search"
                  placeholder={t('forum:rightSidebar.search')}
                  className="pl-10 w-full rounded-full bg-gray-100 dark:bg-gray-800 border-0"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              
              {/* Club info */}
              {clubData && (
                <Card className="overflow-hidden rounded-xl">
                  <div className="h-32 bg-gradient-to-r from-black to-primary/80"></div>
                  <div className="p-4 relative">
                    <Avatar className="absolute -top-10 left-4 w-20 h-20 border-4 border-white dark:border-gray-900">
                      <img 
                        src={clubData.image || 'https://via.placeholder.com/80'} 
                        alt={clubData.name}
                        className="w-full h-full object-cover"
                      />
                    </Avatar>
                    <div className="pt-10">
                      <h2 className="text-xl font-bold">{clubData.name}</h2>
                      <p className="text-gray-500 dark:text-gray-400 text-sm">@{clubData.name.toLowerCase().replace(/\s/g, '')}</p>
                      
                      <p className="my-3 text-sm">{t('forum:rightSidebar.clubInfo.officialForum')}</p>
                      
                      <div className="flex items-center gap-4 text-sm">
                        <div className="flex items-center gap-1">
                          <span className="font-bold">{Math.floor(Math.random() * 500) + 1000}</span>
                          <span className="text-gray-500 dark:text-gray-400">{t('forum:rightSidebar.clubInfo.followers')}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <span className="font-bold">{Math.floor(Math.random() * 100) + 50}</span>
                          <span className="text-gray-500 dark:text-gray-400">{t('forum:rightSidebar.clubInfo.following')}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </Card>
              )}
              
              {/* Trending section */}
              <Card className="overflow-hidden rounded-xl">
                <div className="p-4">
                  <h3 className="font-bold text-xl mb-4">{t('forum:rightSidebar.trending')}</h3>
                  
                  <div className="space-y-4">
                    {Array.from({ length: 4 }).map((_, index) => (
                      <div key={index} className="cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 p-2 rounded">
                        <p className="text-xs text-gray-500 dark:text-gray-400">{t('forum:rightSidebar.trendingTopic')} {index + 1}</p>
                        <p className="font-bold">
                          {t(`forum:rightSidebar.trendingTopics.${index}`)}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">{Math.floor(Math.random() * 1000) + 100} {t('forum:rightSidebar.posts')}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </Card>
              
              {/* Who to follow */}
              <Card className="overflow-hidden rounded-xl">
                <div className="p-4">
                  <h3 className="font-bold text-xl mb-4">{t('forum:rightSidebar.whoToFollow')}</h3>
                  
                  <div className="space-y-4">
                    {Array.from({ length: 3 }).map((_, index) => (
                      <div key={index} className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <Avatar className="h-10 w-10">
                            <img 
                              src={`https://api.dicebear.com/7.x/avataaars/svg?seed=User${index}`} 
                              alt="User" 
                            />
                          </Avatar>
                          <div>
                            <p className="font-bold">{['John Fan', 'Mary Supporter', 'Alex True'][index]}</p>
                            <p className="text-xs text-gray-500 dark:text-gray-400">@{['johnfan', 'marysupporter', 'alextrue'][index]}</p>
                          </div>
                        </div>
                        <Button size="sm" className="rounded-full bg-secondary hover:bg-secondary/90 text-text-adaptive">
                          {t('forum:rightSidebar.follow')}
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              </Card>
              
              {/* Forum stats */}
              <div className="text-sm text-gray-500 dark:text-gray-400 space-y-2">
                <div className="flex items-center gap-1">
                  <Users size={14} />
                  <span>{t('forum:rightSidebar.stats.activeUsers')}: {Math.round(posts.length * 1.5)}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Calendar size={14} />
                  <span>{t('forum:rightSidebar.stats.communitySince')}: Sep 2023</span>
                </div>
                <div className="flex items-center gap-1">
                  <MessageCircle size={14} />
                  <span>{t('forum:rightSidebar.stats.totalPosts')}: {posts.length}</span>
                </div>
                
                <p className="text-xs mt-3">{t('forum:rightSidebar.stats.copyright')}</p>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
} 