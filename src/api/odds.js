import api from '../lib/api';

export const odds = {
  // MARKET METHODS
  async createMarket(marketData) {
    try {
      const response = await api.post('/odds/market', marketData);
      return response.data;
    } catch (error) {
      console.error('Erro ao criar mercado:', error);
      throw error;
    }
  },

  async getMarket(marketId) {
    try {
      const response = await api.get(`/odds/market/${marketId}`);
      return response.data;
    } catch (error) {
      console.error('Erro ao buscar mercado:', error);
      throw error;
    }
  },

  async getAllMarkets() {
    try {
      const response = await api.get('/odds/market');
      return response.data;
    } catch (error) {
      console.error('Erro ao buscar mercados:', error);
      throw error;
    }
  },

  async updateMarket(marketId, marketData) {
    try {
      const response = await api.put(`/odds/market/${marketId}`, marketData);
      return response.data;
    } catch (error) {
      console.error('Erro ao atualizar mercado:', error);
      throw error;
    }
  },

  async deleteMarket(marketId) {
    try {
      const response = await api.delete(`/odds/market/${marketId}`);
      return response.data;
    } catch (error) {
      console.error('Erro ao deletar mercado:', error);
      throw error;
    }
  },

  // OPTION METHODS
  async createOption(optionData) {
    try {
      const response = await api.post('/odds/option', optionData);
      return response.data;
    } catch (error) {
      console.error('Erro ao criar opção:', error);
      throw error;
    }
  },

  async getOption(optionId) {
    try {
      const response = await api.get(`/odds/option/${optionId}`);
      return response.data;
    } catch (error) {
      console.error('Erro ao buscar opção:', error);
      throw error;
    }
  },

  async getOptionsByMarket(marketId) {
    try {
      const response = await api.get(`/odds/market/${marketId}/options`);
      return response.data;
    } catch (error) {
      console.error('Erro ao buscar opções do mercado:', error);
      throw error;
    }
  },

  async updateOption(optionId, optionData) {
    try {
      const response = await api.put(`/odds/option/${optionId}`, optionData);
      return response.data;
    } catch (error) {
      console.error('Erro ao atualizar opção:', error);
      throw error;
    }
  },

  async deleteOption(optionId) {
    try {
      const response = await api.delete(`/odds/option/${optionId}`);
      return response.data;
    } catch (error) {
      console.error('Erro ao deletar opção:', error);
      throw error;
    }
  }
};

// Export default para facilitar importação
export default odds; 