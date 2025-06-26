import api from '../lib/api';

const getClubs = async () => {
  const response = await api.get('/club');
  return response.data?.content || [];
};

const getClubById = async (id) => {
  const response = await api.get(`/club/${id}`);
  return response.data?.content || null;
};

const getUserClubStats = async (id) => {
//   const response = await api.get(`/club/${id}/user-stats`);
//   return response.data?.content || null;
    return null;
};

const getClubEvents = async (id) => {
//   const response = await api.get(`/club/${id}/events`);
//   return response.data?.content || null;
    return null;
};

export default {
    getClubs,
    getClubById,
    getUserClubStats,
    getClubEvents
};