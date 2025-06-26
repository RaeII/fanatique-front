import api from "../lib/api";

const getUserProfile = async () => {
  const response = await api.get(`/user`);
  return response.data.content;
};

const updateUserProfile = async (userData) => {
  const response = await api.put(`/user`, userData);
  return response.data.content;
};

export default {
  getUserProfile,
  updateUserProfile
}; 