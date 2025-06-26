import api from '../lib/api';

/**
 * Obtém o saldo atual de $CHIPS do usuário autenticado
 * @returns {Promise<Object>} Objeto contendo o saldo e informações relacionadas
 */
export const getUserBalance = async () => {
  try {
    const response = await api.get('/chips/balance');
    return response.data.content;
  } catch (error) {
    console.error('Erro ao obter saldo de $CHIPS:', error);
    throw error;
  }
};

/**
 * Obtém as transações de $CHIPS do usuário autenticado
 * @param {number} limit - Limite de transações a serem retornadas
 * @param {number} offset - Offset para paginação
 * @returns {Promise<Array>} Lista de transações
 */
export const getUserTransactions = async (limit = 20, offset = 0) => {
  try {
    const response = await api.get(`/chips/transactions?limit=${limit}&offset=${offset}`);
    return response.data.content;
  } catch (error) {
    console.error('Erro ao obter transações de $CHIPS:', error);
    throw error;
  }
};

/**
 * Obtém estatísticas de $CHIPS do usuário autenticado
 * @returns {Promise<Object>} Estatísticas do usuário
 */
export const getUserStats = async () => {
  try {
    const response = await api.get('/chips/stats');
    return response.data.content;
  } catch (error) {
    console.error('Erro ao obter estatísticas de $CHIPS:', error);
    throw error;
  }
};

/**
 * Obtém detalhes de uma transação específica
 * @param {number} transactionId - ID da transação
 * @returns {Promise<Object>} Detalhes da transação
 */
export const getTransactionDetails = async (transactionId) => {
  try {
    const response = await api.get(`/chips/transaction/${transactionId}`);
    return response.data.content;
  } catch (error) {
    console.error('Erro ao obter detalhes da transação:', error);
    throw error;
  }
};

/**
 * Obtém transações de um tipo específico
 * @param {string} type - Tipo da transação (stake_reward, bet_placed, bet_won, etc)
 * @param {number} limit - Limite de transações a serem retornadas
 * @param {number} offset - Offset para paginação
 * @returns {Promise<Array>} Lista de transações do tipo especificado
 */
export const getTransactionsByType = async (type, limit = 20, offset = 0) => {
  try {
    const response = await api.get(`/chips/transactions/type/${type}?limit=${limit}&offset=${offset}`);
    return response.data.content;
  } catch (error) {
    console.error(`Erro ao obter transações do tipo ${type}:`, error);
    throw error;
  }
};

/**
 * Obtém transações relacionadas a uma referência específica
 * @param {string} referenceType - Tipo da referência (bet, quest, etc)
 * @param {number} referenceId - ID da referência
 * @returns {Promise<Array>} Lista de transações relacionadas à referência
 */
export const getTransactionsByReference = async (referenceType, referenceId) => {
  try {
    const response = await api.get(`/chips/transactions/reference/${referenceType}/${referenceId}`);
    return response.data.content;
  } catch (error) {
    console.error(`Erro ao obter transações da referência ${referenceType}/${referenceId}:`, error);
    throw error;
  }
};

// Funções administrativas (requerem permissões adequadas)

/**
 * Adiciona $CHIPS a um usuário
 * @param {Object} data - Dados da transação
 * @param {number} data.user_id - ID do usuário
 * @param {number} data.amount - Quantidade de $CHIPS a adicionar
 * @param {string} data.transaction_type - Tipo da transação
 * @param {number} [data.reference_id] - ID de referência (opcional)
 * @param {string} [data.reference_type] - Tipo de referência (opcional)
 * @param {string} [data.description] - Descrição da transação (opcional)
 * @param {string} [data.transaction_hash] - Hash da transação blockchain (opcional)
 * @returns {Promise<Object>} Resultado da operação com o novo saldo
 */
export const addChips = async (data) => {
  try {
    const response = await api.post('/chips/add', data);
    return response.data.content;
  } catch (error) {
    console.error('Erro ao adicionar $CHIPS:', error);
    throw error;
  }
};

/**
 * Remove $CHIPS de um usuário
 * @param {Object} data - Dados da transação
 * @param {number} data.user_id - ID do usuário
 * @param {number} data.amount - Quantidade de $CHIPS a remover
 * @param {string} data.transaction_type - Tipo da transação
 * @param {number} [data.reference_id] - ID de referência (opcional)
 * @param {string} [data.reference_type] - Tipo de referência (opcional)
 * @param {string} [data.description] - Descrição da transação (opcional)
 * @param {string} [data.transaction_hash] - Hash da transação blockchain (opcional)
 * @returns {Promise<Object>} Resultado da operação com o novo saldo
 */
export const removeChips = async (data) => {
  try {
    const response = await api.post('/chips/remove', data);
    return response.data.content;
  } catch (error) {
    console.error('Erro ao remover $CHIPS:', error);
    throw error;
  }
};

/**
 * Obtém o saldo de $CHIPS de um usuário específico (requer permissão de admin)
 * @param {number} userId - ID do usuário
 * @returns {Promise<Object>} Saldo do usuário
 */
export const getUserBalanceById = async (userId) => {
  try {
    const response = await api.get(`/chips/user/${userId}/balance`);
    return response.data.content;
  } catch (error) {
    console.error(`Erro ao obter saldo do usuário ${userId}:`, error);
    throw error;
  }
};

/**
 * Obtém estatísticas de $CHIPS de todos os usuários (requer permissão de admin)
 * @param {number} limit - Limite de usuários a serem retornados
 * @param {number} offset - Offset para paginação
 * @returns {Promise<Array>} Lista de estatísticas dos usuários
 */
export const getAllUsersStats = async (limit = 20, offset = 0) => {
  try {
    const response = await api.get(`/chips/stats/all?limit=${limit}&offset=${offset}`);
    return response.data.content;
  } catch (error) {
    console.error('Erro ao obter estatísticas de todos os usuários:', error);
    throw error;
  }
}; 