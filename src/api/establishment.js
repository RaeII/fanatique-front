import api from "../lib/api";

const getEstablishmentById = async (id) => {
  const response = await api.get(`/establishment-stadium/${id}`);
  return response.data.content;
};

const getEstablishmentByStadiumId = async (stadiumId) => {
  const response = await api.get(`/establishment-stadium/stadium/${stadiumId}`);
  return response.data.content;
};

const getEstablishments = async () => {
  const response = await api.get(`/establishment-stadium`);
  return response.data.content;
};

export default {
  getEstablishmentById,
  getEstablishments,
  getEstablishmentByStadiumId
};
