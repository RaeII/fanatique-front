import api from '../lib/api';

/**
 * Busca todas as transações do usuário
 * @returns {Promise<Array>} - Lista de transações do usuário
 */
export const getUserTransactions = async () => {
  try {
    const response = await api.get('/transaction/user/all');
    return response.data.content;
  } catch (error) {
    console.error('Erro ao buscar transações do usuário:', error);
    throw error;
  }
};

export default {
  getUserTransactions,
}; 