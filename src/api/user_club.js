import api from "../lib/api";

const getUserClub = async () => {
  const response = await api.get(`/user-club`);
  return response.data.content;
};

const addClubAssociation = async (clubId, associationType) => {
  //TODO: Remove userId from the request
  const response = await api.post(`/user-club`, { club_type_id: associationType, club_id: clubId });
  return response.data.content;
};

const removeClubAssociation = async (clubId) => {
  const response = await api.delete(`/user-club/${clubId}`);
  return response.data.content;
};

export default {
    getUserClub,
    addClubAssociation,
    removeClubAssociation
};