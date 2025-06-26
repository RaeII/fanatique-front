import api from '../lib/api';

const getClubPosts = async (clubId) => {
  try {
    const response = await api.get(`/forum/club/${clubId}/posts`);
    return response.data?.content || [];
  } catch (error) {
    console.error('Error getting club posts:', error);
    
    // For development/testing - return mock data
    if (import.meta.env.MODE === 'development') {
      return [
        {
          id: '1',
          title: 'Match Day Experience',
          content: 'What was your experience at the game yesterday? The atmosphere was electric!',
          createdAt: new Date().toISOString(),
          likes: 24,
          comments: 7,
          userLiked: false,
          author: {
            id: 'user1',
            name: 'John Fan',
            avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=John'
          }
        },
        {
          id: '2',
          title: 'Transfer rumors for next season',
          content: 'I heard we might be signing a new striker next transfer window. Anyone else hear anything about this?',
          createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
          likes: 18,
          comments: 12,
          userLiked: true,
          author: {
            id: 'user2',
            name: 'Sarah Supporter',
            avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah'
          }
        },
        {
          id: '3',
          title: 'Best places to eat near the stadium?',
          content: 'I\'m bringing some friends to the game next weekend. Any recommendations for good places to eat before the match?',
          createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
          likes: 32,
          comments: 23,
          userLiked: false,
          author: {
            id: 'user3',
            name: 'Mike Ultras',
            avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Mike'
          }
        }
      ];
    }
    
    throw error;
  }
};

const getPostById = async (postId) => {
  try {
    const response = await api.get(`/forum/post/${postId}`);
    return response.data?.content || null;
  } catch (error) {
    console.error('Error getting post by ID:', error);
    throw error;
  }
};

const createPost = async (postData) => {
  const response = await api.post(`/forum/club/${postData.clubId}/posts`, {
    title: postData.title,
    content: postData.content
  });
  return response.data?.content || null;
};

const likePost = async (postId) => {
  const response = await api.post(`/forum/post/${postId}/like`);
  return response.data?.content || null;
};

const getPostComments = async (postId) => {
  const response = await api.get(`/forum/post/${postId}/comments`);
  return response.data?.content || [];
};

const addComment = async (postId, content) => {
  const response = await api.post(`/forum/post/${postId}/comments`, { content });
  return response.data?.content || null;
};

export default {
  getClubPosts,
  getPostById,
  createPost,
  likePost,
  getPostComments,
  addComment
}; 