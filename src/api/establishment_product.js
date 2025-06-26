import api from "../lib/api";

const getProductById = async (id) => {
  const response = await api.get(`/product/${id}`);
  return response.data.content;
};

const getProductsByEstablishment = async (establishmentId) => {
  const response = await api.get(`/product/establishment/${establishmentId}`);
  return response.data.content;
};

export default {
  getProductById,
  getProductsByEstablishment
};

