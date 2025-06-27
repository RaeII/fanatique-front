import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, MessageSquare, Share2, Bookmark, Heart, Users, Calendar, TrendingUp } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Separator } from '../components/ui/separator';
import { ForumPostCard } from '../components/ui/forum-post-card';
import { CommentList } from '../components/ui/comment-list';
import { useWalletContext } from '../hooks/useWalletContext';
import { useUserContext } from '../hooks/useUserContext';
import { showError, showSuccess } from '../lib/toast';
import forumApi from '../api/forum';
import clubApi from '../api/club';

export default function ForumPostPage() {
  const { clubId, postId } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated } = useWalletContext();
  const { isFollowingClub, isUserHeartClub } = useUserContext();
  
  const [loading, setLoading] = useState(true);
  const [post, setPost] = useState(null);
  const [clubData, setClubData] = useState(null);
  const [comments, setComments] = useState([]);
  const [commentsLoading, setCommentsLoading] = useState(false);
  
  useEffect(() => {
    const checkAccessAndLoadData = async () => {
      try {
        if (!isAuthenticated) {
          navigate('/');
          return;
        }
        
        // Check if user is following this club or has it as heart club
        const hasAccess = await isFollowingClub(clubId) || await isUserHeartClub(clubId);
        if (!hasAccess) {
          showError("You need to follow this club to access the forum");
          navigate(`/clubs/${clubId}`);
          return;
        }
        
        setLoading(true);
        
        // Load club data
        const club = await clubApi.getClubById(clubId);
        setClubData(club);
        
        // For development/testing with mock data
        if (import.meta.env.MODE === 'development') {
          const mockPost = {
            id: postId,
            title: 'Transfer rumors for next season',
            content: 'I heard we might be signing a new striker next transfer window. Anyone else hear anything about this?',
            createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
            likes: 18,
            comments: 3,
            userLiked: false,
            category: 'general',
            author: {
              id: 'user2',
              name: 'Sarah Supporter',
              avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah'
            }
          };
          setPost(mockPost);
          
          // Load comments after a brief delay
          await loadComments();
        } else {
          // Load post data
          // In a real app, you would fetch the actual post data
          const postData = await forumApi.getPostById(postId);
          setPost(postData);
          
          // Load comments
          await loadComments();
        }
      } catch (error) {
        console.error('Error loading post data:', error);
        showError('Failed to load post data');
        navigate(`/clubs/${clubId}/forum`);
      } finally {
        setLoading(false);
      }
    };
    
    checkAccessAndLoadData();
  }, [clubId, postId, isAuthenticated, navigate, isFollowingClub, isUserHeartClub]);
  
  const loadComments = async () => {
    try {
      setCommentsLoading(true);
      
      // For development/testing with mock data
      if (import.meta.env.MODE === 'development') {
        // Simulate API delay
        await new Promise((resolve) => setTimeout(resolve, 500));
        
        const mockComments = [
          {
            id: 'comment1',
            content: 'I heard the same thing! I think it would be a great addition to the team.',
            createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
            author: {
              id: 'user3',
              name: 'Mike Fan',
              avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Mike'
            }
          },
          {
            id: 'comment2',
            content: 'We really need to strengthen our defense more than attack, in my opinion.',
            createdAt: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
            author: {
              id: 'user4',
              name: 'Jessica Supporter',
              avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Jessica'
            }
          },
          {
            id: 'comment3',
            content: 'I think our current striker is doing fine, we should focus on midfield.',
            createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
            author: {
              id: 'user5',
              name: 'Thomas Fan',
              avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Thomas'
            }
          }
        ];
        
        setComments(mockComments);
      } else {
        const commentsData = await forumApi.getPostComments(postId);
        setComments(commentsData);
      }
    } catch (error) {
      console.error('Error loading comments:', error);
      showError('Failed to load comments');
    } finally {
      setCommentsLoading(false);
    }
  };
  
  const handleLikePost = async (postId) => {
    try {
      await forumApi.likePost(postId);
      
      // Update the local state to reflect the like
      setPost({
        ...post,
        likes: post.likes + 1,
        userLiked: true
      });
    } catch (error) {
      console.error('Error liking post:', error);
      showError('Failed to like post');
    }
  };
  
  const handleAddComment = async (postId, content) => {
    try {
      if (import.meta.env.MODE === 'development') {
        // Simulate API delay
        await new Promise((resolve) => setTimeout(resolve, 500));
        
        // Create mock comment
        const newComment = {
          id: `comment${Date.now()}`,
          content,
          createdAt: new Date().toISOString(),
          author: {
            id: 'currentUser',
            name: 'Current User',
            avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=CurrentUser'
          }
        };
        
        // Add to local state
        setComments([...comments, newComment]);
        
        // Update post comment count
        setPost({
          ...post,
          comments: post.comments + 1
        });
        
        showSuccess('Comment added successfully');
      } else {
        // In a real app, you would call the API
        const newComment = await forumApi.addComment(postId, content);
        
        // Add to local state
        setComments([...comments, newComment]);
        
        // Update post comment count
        setPost({
          ...post,
          comments: post.comments + 1
        });
        
        showSuccess('Comment added successfully');
      }
    } catch (error) {
      console.error('Error adding comment:', error);
      showError('Failed to add comment');
      throw error;
    }
  };
  
  const handleAction = (e) => {
    e.preventDefault();
    // These would be implemented in a real app
  };
  
  if (loading) {
    return (
      <div className="min-h-screen bg-background dark:bg-gray-950 pt-16">
        <div className="container mx-auto px-4 flex flex-col items-center justify-center">
          <div className="relative">
            <div className="animate-spin w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full"></div>
          </div>
          <p className="mt-4 text-primary/60 dark:text-white/60">Loading discussion...</p>
        </div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-background dark:bg-gray-950 pb-12">
      {/* Top navigation */}
      <div className="sticky top-0 z-10 bg-background-overlay dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 shadow-sm">
        <div className="container mx-auto px-4">
          <div className="flex items-center h-16">
            <Button 
              variant="ghost" 
              size="sm"
              className="mr-4 flex items-center gap-2"
              onClick={() => navigate(`/clubs/${clubId}/forum`)}
            >
              <ArrowLeft size={16} />
              <span>Back to Forum</span>
            </Button>
            
            {clubData && (
              <div className="flex items-center gap-2">
                <img 
                  src={clubData.image || 'https://via.placeholder.com/32'} 
                  alt={clubData.name} 
                  className="w-6 h-6 rounded-full object-cover"
                />
                <span className="font-medium text-sm">{clubData.name} Forum</span>
              </div>
            )}
          </div>
        </div>
      </div>
      
      <div className="container mx-auto px-4 pt-6">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
          {/* Main content */}
          <div className="md:col-span-8">
            {/* Post content */}
            {post && (
              <div className="space-y-4">
                <ForumPostCard 
                  post={post} 
                  onLike={handleLikePost}
                />
                
                {/* Comments section */}
                <div className="bg-background-overlay dark:bg-gray-900 rounded-lg shadow-sm border border-gray-200 dark:border-gray-800 p-4">
                  <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                    <MessageSquare size={18} className="text-tertiary" />
                    Comments ({post.comments})
                  </h2>
                  
                  {commentsLoading ? (
                    <div className="flex justify-center items-center py-8">
                      <div className="animate-spin w-5 h-5 border-2 border-primary border-t-transparent rounded-full"></div>
                      <span className="ml-3 text-sm text-primary/60 dark:text-white/60">Loading comments...</span>
                    </div>
                  ) : (
                    <CommentList 
                      comments={comments} 
                      postId={post.id} 
                      onAddComment={handleAddComment} 
                    />
                  )}
                </div>
              </div>
            )}
          </div>
          
          {/* Right sidebar */}
          <div className="md:col-span-4">
            <div className="space-y-4 sticky top-20">
              {/* Post actions card */}
              <div className="bg-background-overlay dark:bg-gray-900 rounded-lg shadow-sm border border-gray-200 dark:border-gray-800 p-4">
                <h3 className="font-medium text-sm text-gray-500 dark:text-gray-400 mb-3 uppercase">Post Actions</h3>
                
                <div className="grid grid-cols-2 gap-2 mb-2">
                  <Button 
                    variant="outline" 
                    className="flex items-center justify-center gap-2 text-sm w-full"
                    onClick={handleAction}
                  >
                    <Heart size={16} className={post?.userLiked ? "fill-rose-500 text-rose-500" : ""} />
                    <span>Like</span>
                  </Button>
                  
                  <Button 
                    variant="outline" 
                    className="flex items-center justify-center gap-2 text-sm w-full"
                    onClick={handleAction}
                  >
                    <Share2 size={16} />
                    <span>Share</span>
                  </Button>
                </div>
                
                <Button 
                  variant="outline" 
                  className="flex items-center justify-center gap-2 text-sm w-full"
                  onClick={handleAction}
                >
                  <Bookmark size={16} />
                  <span>Save Post</span>
                </Button>
              </div>
              
              {/* Community info card */}
              <div className="bg-background-overlay dark:bg-gray-900 rounded-lg shadow-sm border border-gray-200 dark:border-gray-800 p-4">
                <h3 className="font-medium text-sm text-gray-500 dark:text-gray-400 mb-3 uppercase">About Community</h3>
                
                {clubData && (
                  <div className="flex items-center gap-3 mb-3">
                    <img 
                      src={clubData.image || 'https://via.placeholder.com/40'} 
                      alt={clubData.name} 
                      className="w-10 h-10 rounded-full object-cover"
                    />
                    <div>
                      <h4 className="font-semibold text-text-adaptive dark:text-white">{clubData.name}</h4>
                      <p className="text-xs text-gray-500 dark:text-gray-400">Official club forum</p>
                    </div>
                  </div>
                )}
                
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div className="flex items-center gap-2 p-2 bg-gray-50 dark:bg-gray-800 rounded">
                    <Users size={16} className="text-gray-500" />
                    <div>
                      <div className="font-semibold text-text-adaptive dark:text-white">5.2k</div>
                      <div className="text-xs text-gray-500">Members</div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2 p-2 bg-gray-50 dark:bg-gray-800 rounded">
                    <TrendingUp size={16} className="text-gray-500" />
                    <div>
                      <div className="font-semibold text-text-adaptive dark:text-white">241</div>
                      <div className="text-xs text-gray-500">Online</div>
                    </div>
                  </div>
                </div>
                
                <Separator className="my-3" />
                
                <div className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1 mb-3">
                  <Calendar size={12} />
                  <span>Community created Sep 2023</span>
                </div>
                
                <Button className="w-full bg-primary hover:bg-primary/90 text-text-adaptive">Join Discussion</Button>
              </div>
              
              {/* Related discussions */}
              <div className="bg-background-overlay dark:bg-gray-900 rounded-lg shadow-sm border border-gray-200 dark:border-gray-800 p-4">
                <h3 className="font-medium text-sm text-gray-500 dark:text-gray-400 mb-3 uppercase">Related Discussions</h3>
                
                <div className="space-y-3">
                  {Array.from({ length: 3 }).map((_, index) => (
                    <div 
                      key={index} 
                      className="group cursor-pointer"
                      onClick={() => navigate(`/clubs/${clubId}/forum/post/${index + 1}`)}
                    >
                      <h4 className="font-medium text-sm text-text-adaptive dark:text-white group-hover:text-tertiary transition-colors">
                        {index === 0 
                          ? "Latest team news for the upcoming match" 
                          : index === 1 
                            ? "Best food options at the stadium?"
                            : "Should we sign a new defender?"
                        }
                      </h4>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                        {Math.floor(Math.random() * 20) + 2} comments • {Math.floor(Math.random() * 30) + 5} likes
                      </p>
                      {index < 2 && <Separator className="mt-3" />}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 