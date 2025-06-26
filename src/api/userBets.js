import api from '../lib/api';

export const userBets = {
  // USER BET METHODS
  async createBet(betData) {
    try {
      const response = await api.post('/user-bet', betData);
      return response.data;
    } catch (error) {
      console.error('Erro ao criar aposta:', error);
      throw error;
    }
  },

  async getBet(betId) {
    try {
      const response = await api.get(`/user-bet/${betId}`);
      return response.data;
    } catch (error) {
      console.error('Erro ao buscar aposta:', error);
      throw error;
    }
  },

  async getMyBets(params = {}) {
    try {
      const queryParams = new URLSearchParams();
      if (params.limit) queryParams.append('limit', params.limit);
      if (params.offset) queryParams.append('offset', params.offset);
      
      const response = await api.get(`/user-bet/my-bets?${queryParams}`);
      return response.data;
    } catch (error) {
      console.error('Erro ao buscar minhas apostas:', error);
      throw error;
    }
  },

  async getMyStats() {
    try {
      const response = await api.get('/user-bet/my-stats');
      return response.data;
    } catch (error) {
      console.error('Erro ao buscar estatísticas:', error);
      throw error;
    }
  },

  async getMatchBets(matchId, limit) {
    try {
      const queryParams = new URLSearchParams();
      if (limit) queryParams.append('limit', limit);
      
      const response = await api.get(`/user-bet/match/${matchId}/bets?${queryParams}`);
      return response.data;
    } catch (error) {
      console.error('Erro ao buscar apostas da partida:', error);
      throw error;
    }
  },

  async updateBet(betId, betData) {
    try {
      const response = await api.put(`/user-bet/${betId}`, betData);
      return response.data;
    } catch (error) {
      console.error('Erro ao atualizar aposta:', error);
      throw error;
    }
  },

  async cancelBet(betId, reason) {
    try {
      const response = await api.post(`/user-bet/${betId}/cancel`, { reason });
      return response.data;
    } catch (error) {
      console.error('Erro ao cancelar aposta:', error);
      throw error;
    }
  },

  async deleteBet(betId) {
    try {
      const response = await api.delete(`/user-bet/${betId}`);
      return response.data;
    } catch (error) {
      console.error('Erro ao deletar aposta:', error);
      throw error;
    }
  },

  async getBetHistory(betId) {
    try {
      const response = await api.get(`/user-bet/${betId}/history`);
      return response.data;
    } catch (error) {
      console.error('Erro ao buscar histórico da aposta:', error);
      throw error;
    }
  }
};

// Export default para facilitar importação
export default userBets; 