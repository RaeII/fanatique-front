import { useState } from 'react';
import { Clock, Send, Heart, Reply, MoreHorizontal, Smile } from 'lucide-react';
import { Avatar } from './avatar';
import { Button } from './button';
import { Textarea } from './textarea';
import { Separator } from './separator';

/**
 * CommentList component to display comments on a forum post
 */
export function CommentList({ comments = [], postId, onAddComment }) {
  const [newComment, setNewComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
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
  
  const handleSubmitComment = async () => {
    if (!newComment.trim()) return;
    
    try {
      setIsSubmitting(true);
      await onAddComment(postId, newComment);
      setNewComment('');
    } catch (error) {
      console.error('Error submitting comment:', error);
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const handleLike = (e) => {
    e.preventDefault();
    // Would be implemented in a real app
  };
  
  return (
    <div className="space-y-6">
      {/* Add new comment */}
      <div className="border border-gray-200 dark:border-gray-800 rounded-lg overflow-hidden">
        <div className="flex items-start p-3 gap-3">
          <Avatar className="w-8 h-8 ring-2 ring-offset-1 ring-gray-100 dark:ring-gray-800">
            <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=CurrentUser" alt="You" className="w-full h-full" />
          </Avatar>
          <div className="flex-1">
            <Textarea
              placeholder="Write a comment..."
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              className="min-h-[80px] resize-none border-0 focus:ring-0 px-0 py-0"
            />
          </div>
        </div>
        
        <div className="border-t border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900/30 p-2 flex justify-between items-center">
          <Button 
            variant="ghost" 
            size="icon" 
            className="rounded-full h-8 w-8 text-gray-500 hover:text-primary"
          >
            <Smile size={18} />
          </Button>
          
          <Button 
            className="bg-primary hover:bg-primary/90 text-white rounded-full px-4 py-1 h-8"
            onClick={handleSubmitComment}
            disabled={!newComment.trim() || isSubmitting}
          >
            {isSubmitting ? (
              <span className="flex items-center gap-2">
                <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full"></div>
                <span>Posting...</span>
              </span>
            ) : (
              <span className="flex items-center gap-2">
                <Send size={14} />
                <span>Post</span>
              </span>
            )}
          </Button>
        </div>
      </div>
      
      {comments.length === 0 ? (
        <div className="text-center py-6 border border-gray-200 dark:border-gray-800 rounded-lg">
          <p className="text-gray-500 dark:text-gray-400">Be the first to comment on this post!</p>
        </div>
      ) : (
        <div className="space-y-4">
          {comments.map((comment) => (
            <div key={comment.id} className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800 hover:border-gray-300 dark:hover:border-gray-700 transition-colors">
              <div className="p-3">
                <div className="flex items-start gap-3">
                  <Avatar className="w-8 h-8 ring-2 ring-offset-1 ring-gray-100 dark:ring-gray-800">
                    <img 
                      src={comment.author.avatar || 'https://via.placeholder.com/32'} 
                      alt={comment.author.name} 
                      className="w-full h-full object-cover"
                    />
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <div className="bg-gray-100 dark:bg-gray-800 rounded-xl px-3 py-2">
                      <div className="flex items-center justify-between flex-wrap mb-1">
                        <span className="font-medium">{comment.author.name}</span>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-6 w-6 rounded-full -mr-1"
                        >
                          <MoreHorizontal size={14} />
                        </Button>
                      </div>
                      <p className="text-gray-800 dark:text-gray-200">{comment.content}</p>
                    </div>
                    
                    <div className="flex items-center gap-4 mt-1 ml-1 text-xs text-gray-500 dark:text-gray-400">
                      <button 
                        className="font-medium hover:text-primary transition-colors"
                        onClick={handleLike}
                      >
                        Like
                      </button>
                      <button 
                        className="font-medium hover:text-primary transition-colors"
                        onClick={handleLike}
                      >
                        Reply
                      </button>
                      <span className="flex items-center gap-1">
                        <Clock size={10} />
                        {formatDate(comment.createdAt)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
} 