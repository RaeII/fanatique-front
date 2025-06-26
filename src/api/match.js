import api from "../lib/api";

// Mock data for developmen

const getMatchesByClub = async (clubId) => {
  const response = await api.get(`/match/club/${clubId}`);
  return response.data.content;
};

const getMatchesByStadium = async (stadiumId) => {
  const response = await api.get(`/match/stadium/${stadiumId}`);
  return response.data.content;
};

const getMatchById = async (id) => {
  const response = await api.get(`/match/${id}`);
  return response.data.content;
};

const getMatches = async () => {
  const response = await api.get(`/match`);
  return response.data.content;
};


export default {
  getMatchesByClub,
  getMatchesByStadium,
  getMatchById,
  getMatches
};


