import { Heart, MessageCircle, Clock, Share2, Bookmark, Tag, MoreHorizontal } from 'lucide-react';
import { Avatar } from './avatar';
import { Card } from './card';
import { Button } from './button';
import { Separator } from './separator';

/**
 * ForumPostCard component to display a post in the forum
 */
export function ForumPostCard({ post, onLike, onClickComments }) {
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) {
      const diffHours = Math.floor(diffTime / (1000 * 60 * 60));
      if (diffHours === 0) {
        const diffMinutes = Math.floor(diffTime / (1000 * 60));
        return `${diffMinutes} minute${diffMinutes !== 1 ? 's' : ''} ago`;
      }
      return `${diffHours} hour${diffHours !== 1 ? 's' : ''} ago`;
    } else if (diffDays < 7) {
      return `${diffDays} day${diffDays !== 1 ? 's' : ''} ago`;
    } else {
      return date.toLocaleDateString();
    }
  };

  // Create handlers that account for the nested callback pattern
  const handleLike = (e) => {
    if (post.userLiked) return;
    
    if (onLike) {
      const handler = onLike(post.id);
      if (typeof handler === 'function') {
        handler(e);
      } else {
        // If just a direct callback was passed
        e.stopPropagation();
        onLike(post.id);
      }
    }
  };
  
  const handleClickComments = (e) => {
    if (onClickComments) {
      const handler = onClickComments(post.id);
      if (typeof handler === 'function') {
        handler(e);
      } else {
        // If just a direct callback was passed
        e.stopPropagation();
        onClickComments(post.id);
      }
    }
  };
  
  // Prevent propagation for share and bookmark actions
  const handleAction = (e) => {
    e.stopPropagation();
    // These would be implemented in a real app
  };

  // Get color for category tag
  const getCategoryColor = (category) => {
    switch(category) {
      case 'trending': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300';
      case 'hot': return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300';
      case 'match': return 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300';
      case 'general': 
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300';
    }
  };

  return (
    <Card className="hover:shadow-md transition-all duration-200 overflow-hidden border border-gray-200 dark:border-gray-800">
      {/* Post header - author info */}
      <div className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Avatar className="h-10 w-10 ring-2 ring-offset-2 ring-gray-100 dark:ring-gray-800">
              <img 
                src={post.author.avatar || 'https://via.placeholder.com/40'} 
                alt={post.author.name}
                className="w-full h-full object-cover"
              />
            </Avatar>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-semibold text-text-adaptive dark:text-white">{post.author.name}</span>
                {post.category && (
                  <span className={`text-xs px-2 py-0.5 rounded-full flex items-center gap-1 ${getCategoryColor(post.category)}`}>
                    <Tag size={10} />
                    {post.category.charAt(0).toUpperCase() + post.category.slice(1)}
                  </span>
                )}
              </div>
              <span className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1">
                <Clock size={10} />
                {formatDate(post.createdAt)}
              </span>
            </div>
          </div>
          
          <Button 
            variant="ghost" 
            size="icon"
            className="rounded-full h-8 w-8"
            onClick={handleAction}
          >
            <MoreHorizontal size={16} />
          </Button>
        </div>
      </div>
      
      {/* Post title */}
      <div className="px-4 pb-3">
        <h3 className="text-xl font-bold text-text-adaptive dark:text-white">{post.title}</h3>
      </div>
      
      {/* Post content */}
      <div className="px-4 pb-4">
        <p className="text-text-adaptive dark:text-gray-300">{post.content}</p>
      </div>
      
      {/* Post stats - likes and comments count */}
      <div className="px-4 py-2 border-t border-b border-gray-100 dark:border-gray-800 flex justify-between text-sm">
        <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
          <span className="flex items-center gap-1">
            <Heart size={14} className={post.userLiked ? 'fill-rose-500 text-rose-500' : ''} />
            <span>{post.likes} likes</span>
          </span>
        </div>
        <div className="text-gray-600 dark:text-gray-400">
          <span>{post.comments} comments</span>
        </div>
      </div>
      
      {/* Post actions - like, comment, share, save */}
      <div className="px-2 py-1 flex justify-between">
        <Button 
          variant="ghost" 
          size="sm"
          className={`flex-1 flex items-center justify-center gap-1 ${
            post.userLiked ? 'text-rose-500 dark:text-rose-500' : 'text-text-adaptive dark:text-gray-300'
          }`}
          onClick={handleLike}
          disabled={post.userLiked}
        >
          <Heart 
            size={18} 
            className={post.userLiked ? 'fill-rose-500' : ''} 
          />
          <span>Like</span>
        </Button>
        
        <Button
          variant="ghost"
          size="sm"
          className="flex-1 flex items-center justify-center gap-1 text-text-adaptive dark:text-gray-300"
          onClick={handleClickComments}
        >
          <MessageCircle size={18} />
          <span>Comment</span>
        </Button>
        
        <Button
          variant="ghost"
          size="sm"
          className="flex-1 flex items-center justify-center gap-1 text-text-adaptive dark:text-gray-300"
          onClick={handleAction}
        >
          <Share2 size={18} />
          <span>Share</span>
        </Button>
        
        <Button
          variant="ghost"
          size="sm"
          className="flex-1 flex items-center justify-center gap-1 text-text-adaptive dark:text-gray-300"
          onClick={handleAction}
        >
          <Bookmark size={18} />
          <span>Save</span>
        </Button>
      </div>
    </Card>
  );
} 