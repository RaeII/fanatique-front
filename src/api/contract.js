import api from '../lib/api';
/**
 * Transfere tokens para o usuário
 * @param {Object} data - Dados da transferência
 * @param {number} data.club_id - ID do clube
 * @param {string} data.to - Endereço da carteira do destinatário
 * @param {number} data.amount - Quantidade de tokens a serem transferidos
 * @returns {Promise<Object>} - Resposta da API
 */
export const transferTokens = async (data) => {
  try {
    const response = await api.post('/contract/transfer-tokens', data);
    return response.data;
  } catch (error) {
    console.error('Erro ao transferir tokens:', error);
    throw error;
  }
};

/**
 * Busca os tokens disponíveis na carteira do usuário
 * @param {string} walletAddress - Endereço da carteira do usuário
 * @returns {Promise<Array>} - Lista de tokens com seus respectivos saldos
 */
export const getWalletTokens = async (walletAddress) => {
  try {
    const response = await api.get(`/contract/wallet-tokens/${walletAddress}`);
    return response.data.content;
  } catch (error) {
    console.error('Erro ao buscar tokens da carteira:', error);
    throw error;
  }
};

/**
 * Busca as stablecoins disponíveis na carteira do usuário
 * @param {string} walletAddress - Endereço da carteira do usuário
 * @returns {Promise<Array>} - Lista de stablecoins com seus respectivos saldos
 */
export const getStablecoinBalances = async (walletAddress) => {
  try {
    const response = await api.get(`/contract/stablecoin-balances/${walletAddress}`);
    return response.data.content || [];
  } catch (error) {
    console.error('Erro ao buscar stablecoins da carteira:', error);
    throw error;
  }
};

export const getWalletTokensByClub = async (walletAddress, clubId) => {
  try {
    if (!walletAddress || !clubId) {
      throw new Error('Endereço da carteira e ID do clube são obrigatórios');
    }
    
    const response = await api.get(`/contract/wallet-tokens/${walletAddress}/club/${clubId}`);
    return response.data;
  } catch (error) {
    console.error('Erro ao buscar tokens da carteira:', error);
    throw error;
  }
}

/**
 * Transfere stablecoins para o usuário
 * @param {Object} data - Dados da transferência
 * @param {number} data.stablecoin_id - ID da stablecoin
 * @param {string} data.to - Endereço da carteira do destinatário
 * @param {string} data.amount - Quantidade de tokens a serem transferidos
 * @returns {Promise<Object>} - Resposta da API
 */
export const transferStablecoins = async (data) => {
  try {
    const response = await api.post('/contract/transfer-stablecoins', data);
    return response.data;
  } catch (error) {
    console.error('Erro ao transferir stablecoins:', error);
    throw error;
  }
};

/**
 * Busca o saldo de uma stablecoin específica na carteira do usuário
 * @param {string} walletAddress - Endereço da carteira do usuário
 * @param {number} stablecoinId - ID da stablecoin
 * @returns {Promise<Object>} - Informações da stablecoin e saldo
 */
export const getStablecoinBalance = async (walletAddress, stablecoinId) => {

  try {
    if (!walletAddress || !stablecoinId) {
      throw new Error('Endereço da carteira e ID da stablecoin são obrigatórios');
    }
    
    const response = await api.get(`/contract/stablecoin-balance/${walletAddress}/stablecoin/${stablecoinId}`);
    return response.data.content;
  } catch (error) {
    console.error('Erro ao buscar saldo da stablecoin:', error);
    throw error;
  }
};

export default {
  transferTokens,
  getWalletTokens,
  getWalletTokensByClub,
  getStablecoinBalances,
  getStablecoinBalance,
  transferStablecoins
}; 