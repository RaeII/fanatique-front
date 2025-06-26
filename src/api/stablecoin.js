import api from '../lib/api';

/**
 * Busca as stablecoins disponíveis
 * @returns {Promise<Array>} - Lista de stablecoins disponíveis
 */
export const getStablecoins = async () => {
  try {
    const response = await api.get('/stablecoin');
    return response.data.content || [];
  } catch (error) {
    console.error('Erro ao buscar stablecoins:', error);
    throw error;
  }
};

/**
 * Paga um pedido com stablecoin
 * @param {Object} paymentData - Dados do pagamento
 * @returns {Promise<Object>} - Resposta da API
 */
export const payWithStablecoin = async (paymentData) => {
  try {
    const response = await api.post('/stablecoin/payment', paymentData);
    return response.data;
  } catch (error) {
    console.error('Erro ao processar pagamento com stablecoin:', error);
    throw error;
  }
};

export default {
  getStablecoins,
  payWithStablecoin
}; 