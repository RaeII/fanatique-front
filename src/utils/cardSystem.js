import { cardPT, cardEN } from '../../public/pack/card.js';

// Sistema de cartas para novos usuários
class CardSystem {
  constructor() {
    this.CACHE_KEY = 'fanatique_user_cards';
    this.CACHE_EXPIRY = 'fanatique_cards_expiry';
    this.USED_CARDS_KEY = 'fanatique_used_cards'; // Novo cache para cartas usadas
    this.EXPIRY_DAYS = 30; // Cache expira em 30 dias
  }

  // Obter cartas baseado no idioma
  getCards(language = 'en') {
    return language === 'en' ? cardEN : cardPT;
  }

  // Filtrar cartas por raridade
  getCardsByRarity(rarity, language = 'en') {
    const cards = this.getCards(language);
    return cards.filter(card => card.rarity === rarity);
  }

  // Selecionar carta aleatória de uma raridade específica
  getRandomCardByRarity(rarity, language = 'en') {
    const cards = this.getCardsByRarity(rarity, language);
    if (cards.length === 0) return null;
    
    const randomIndex = Math.floor(Math.random() * cards.length);
    return cards[randomIndex];
  }

  // Gerar pack de 3 cartas para novo usuário (1 lendária, 1 rara, 1 comum)
  generateNewUserPack(language = 'en') {
    const pack = [];
    
    // 1 carta lendária aleatória
    const legendary = this.getRandomCardByRarity('lendaria', language);
    if (legendary) pack.push(legendary);
    
    // 1 carta rara aleatória
    const rare = this.getRandomCardByRarity('rara', language);
    if (rare) pack.push(rare);
    
    // 1 carta comum
    const common = this.getRandomCardByRarity('comum', language);
    if (common) pack.push(common);
    
    return pack;
  }

  // Salvar cartas do usuário no cache
  saveUserCards(walletAddress, cards) {
    try {
      const userData = this.getUserCards(walletAddress) || {};
      const timestamp = Date.now();
      
      // Adiciona as novas cartas às existentes
      if (!userData.cards) userData.cards = [];
      userData.cards = [...userData.cards, ...cards];
      userData.lastUpdated = timestamp;
      
      const cacheData = JSON.parse(localStorage.getItem(this.CACHE_KEY) || '{}');
      cacheData[walletAddress] = userData;
      
      localStorage.setItem(this.CACHE_KEY, JSON.stringify(cacheData));
      localStorage.setItem(this.CACHE_EXPIRY, timestamp.toString());
      
      console.log(`Cartas salvas para ${walletAddress}:`, cards);
      return true;
    } catch (error) {
      console.error('Erro ao salvar cartas do usuário:', error);
      return false;
    }
  }

  // Obter cartas do usuário do cache
  getUserCards(walletAddress) {
    try {
      if (!this.isCacheValid()) {
        this.clearCache();
        return null;
      }
      
      const cacheData = JSON.parse(localStorage.getItem(this.CACHE_KEY) || '{}');
      return cacheData[walletAddress] || null;
    } catch (error) {
      console.error('Erro ao obter cartas do usuário:', error);
      return null;
    }
  }

  // Verificar se o cache ainda é válido
  isCacheValid() {
    try {
      const expiry = localStorage.getItem(this.CACHE_EXPIRY);
      if (!expiry) return false;
      
      const expiryTime = parseInt(expiry);
      const now = Date.now();
      const maxAge = this.EXPIRY_DAYS * 24 * 60 * 60 * 1000; // 30 dias em ms
      
      return (now - expiryTime) < maxAge;
    } catch (error) {
      console.error('Erro ao verificar se o cache é válido:', error);
      return false;
    }
  }

  // Limpar cache
  clearCache() {
    try {
      localStorage.removeItem(this.CACHE_KEY);
      localStorage.removeItem(this.CACHE_EXPIRY);
      localStorage.removeItem(this.USED_CARDS_KEY);
    } catch (error) {
      console.error('Erro ao limpar cache:', error);
    }
  }

  // Verificar se usuário já recebeu cartas de boas-vindas
  hasReceivedWelcomeCards(walletAddress) {
    const userData = this.getUserCards(walletAddress);
    return userData && userData.cards && userData.cards.length > 0;
  }

  // Processar novo usuário - gerar e salvar cartas
  processNewUser(walletAddress, language = 'en') {
    try {
      // Verifica se já recebeu cartas
      if (this.hasReceivedWelcomeCards(walletAddress)) {
        console.log(`Usuário ${walletAddress} já recebeu cartas de boas-vindas`);
        return this.getUserCards(walletAddress).cards;
      }

      // Gera pack de cartas para novo usuário
      const newPack = this.generateNewUserPack(language);
      
      if (newPack.length > 0) {
        // Salva as cartas no cache
        this.saveUserCards(walletAddress, newPack);
        console.log(`Pack de boas-vindas gerado para ${walletAddress}:`, newPack);
        return newPack;
      }
      
      return [];
    } catch (error) {
      console.error('Erro ao processar novo usuário:', error);
      return [];
    }
  }

  // NOVA FUNÇÃO: Garante que o usuário sempre tenha cartas
  ensureUserHasCards(walletAddress, language = 'en') {
    try {
      // Verifica se o usuário tem cartas no cache local
      const existingCards = this.getUserCards(walletAddress);
      
      // Se tem cartas no cache, retorna as cartas existentes
      if (existingCards && existingCards.cards && existingCards.cards.length > 0) {
        console.log(`Usuário ${walletAddress} já possui ${existingCards.cards.length} cartas no cache`);
        return {
          cards: existingCards.cards,
          isNewCards: false
        };
      }

      // Se não tem cartas no cache (cache limpo, novo dispositivo, etc), gera novas cartas
      console.log(`Usuário ${walletAddress} sem cartas no cache. Gerando novas cartas...`);
      const newPack = this.generateNewUserPack(language);
      
      if (newPack.length > 0) {
        // Salva as cartas no cache
        this.saveUserCards(walletAddress, newPack);
        console.log(`Novas cartas geradas para ${walletAddress}:`, newPack);
        return {
          cards: newPack,
          isNewCards: true
        };
      }
      
      return {
        cards: [],
        isNewCards: false
      };
    } catch (error) {
      console.error('Erro ao garantir que usuário tenha cartas:', error);
      return {
        cards: [],
        isNewCards: false
      };
    }
  }

  // Obter estatísticas das cartas do usuário
  getUserCardStats(walletAddress) {
    const userData = this.getUserCards(walletAddress);
    if (!userData || !userData.cards) return null;
    
    const stats = {
      total: userData.cards.length,
      comum: 0,
      rara: 0,
      lendaria: 0
    };
    
    userData.cards.forEach(card => {
      if (Object.prototype.hasOwnProperty.call(stats, card.rarity)) {
        stats[card.rarity]++;
      }
    });
    
    return stats;
  }

  // NOVAS FUNCIONALIDADES PARA CARTAS EM APOSTAS

  // Obter cartas disponíveis do usuário (não usadas ainda)
  getAvailableCards(walletAddress) {
    const userData = this.getUserCards(walletAddress);
    if (!userData || !userData.cards) return [];
    
    return userData.cards.filter(card => card !== null);
  }

  // Salvar carta usada em uma aposta
  saveUsedCard(walletAddress, betId, card, betDetails) {
    try {
      const usedCardsData = JSON.parse(localStorage.getItem(this.USED_CARDS_KEY) || '{}');
      const userKey = walletAddress.toLowerCase();
      
      if (!usedCardsData[userKey]) {
        usedCardsData[userKey] = {};
      }
      
      // Se já existe dados para este betId, adicionar carta à lista
      if (usedCardsData[userKey][betId]) {
        if (!usedCardsData[userKey][betId].cards) {
          // Converter formato antigo para novo
          const existingCard = usedCardsData[userKey][betId].card;
          usedCardsData[userKey][betId].cards = existingCard ? [existingCard] : [];
          delete usedCardsData[userKey][betId].card;
        }
        
        // Adicionar nova carta se não existir
        const existingCardIndex = usedCardsData[userKey][betId].cards.findIndex(c => c.id === card.id);
        if (existingCardIndex === -1) {
          usedCardsData[userKey][betId].cards.push(card);
        }
      } else {
        // Criar novo registro
        usedCardsData[userKey][betId] = {
          cards: [card],
          betDetails: betDetails,
          timestamp: Date.now(),
          used: true
        };
      }
      
      localStorage.setItem(this.USED_CARDS_KEY, JSON.stringify(usedCardsData));
      
      console.log(`Carta ${card.name} salva para aposta ${betId} do usuário ${walletAddress}`);
      return true;
    } catch (error) {
      console.error('Erro ao salvar carta usada:', error);
      return false;
    }
  }

  // Obter cartas usadas pelo usuário
  getUsedCards(walletAddress) {
    try {
      const usedCardsData = JSON.parse(localStorage.getItem(this.USED_CARDS_KEY) || '{}');
      const userKey = walletAddress.toLowerCase();
      
      return usedCardsData[userKey] || {};
    } catch (error) {
      console.error('Erro ao obter cartas usadas:', error);
      return {};
    }
  }

  // Verificar se uma carta foi usada em uma aposta específica
  isCardUsedInBet(walletAddress, betId) {
    const usedCards = this.getUsedCards(walletAddress);
    return usedCards[betId] && usedCards[betId].used;
  }

  // Obter carta usada em uma aposta específica
  getCardUsedInBet(walletAddress, betId) {
    const usedCards = this.getUsedCards(walletAddress);
    return usedCards[betId] || null;
  }

  // Gerar ID único para a aposta (baseado nas seleções)
  generateBetId(selectedBets) {
    const betsString = selectedBets
      .map(bet => `${bet.market_id}_${bet.option_id}`)
      .sort()
      .join('|');
    
    return btoa(betsString).replace(/[^a-zA-Z0-9]/g, '').substring(0, 16);
  }

  // Aplicar efeito da carta na aposta
  applyCardEffect(card, betData) {
    if (!card || !betData) return betData;
    
    const modifiedBetData = { ...betData };
    
    switch (card.name) {
      case 'Sem Risco':
        // Se perder a aposta, retorna 100% do valor
        modifiedBetData.insurance = {
          type: 'full_refund',
          description: 'Retorna 100% do valor se perder'
        };
        break;
        
      case 'Última Chance':
        // Pode alterar odds até o segundo tempo
        modifiedBetData.canChangeOdds = true;
        modifiedBetData.changeOddsUntil = 'second_half';
        break;
        
      case 'Reconhecimento Extra': {
        // Multiplica $REP por 1.5x (efeitos cumulativos)
        const currentMultiplier = modifiedBetData.repMultiplier || 1;
        modifiedBetData.repMultiplier = currentMultiplier * 1.5;
        break;
      }
        
      case 'Drible':
        // Preserva odd total se errar apenas 1 palpite em múltipla
        if (modifiedBetData.bet_type === 'multiple') {
          modifiedBetData.allowOneMiss = true;
        }
        break;
        
      case 'Margem de Erro': {
        // Permite errar por 1 unidade em over/under (efeitos cumulativos)
        const currentMargin = modifiedBetData.marginOfError || 0;
        modifiedBetData.marginOfError = currentMargin + 1;
        break;
      }
        
      default:
        break;
    }
    
    return modifiedBetData;
  }

  // Aplicar efeitos de múltiplas cartas
  applyMultipleCardEffects(cards, betData) {
    if (!cards || cards.length === 0 || !betData) return betData;
    
    let modifiedBetData = { ...betData };
    
    // Aplicar efeito de cada carta sequencialmente
    cards.forEach(card => {
      modifiedBetData = this.applyCardEffect(card, modifiedBetData);
    });
    
    return modifiedBetData;
  }

  // Obter cartas usadas em uma aposta específica (para exibir na lista de apostas)
  getCardsUsedInBet(walletAddress, bet) {
    try {
      if (!bet.id) {
        return [];
      }
      
      const usedCards = this.getUsedCards(walletAddress);
      const betCardData = usedCards[bet.id];
      
      if (!betCardData) {
        return [];
      }
      
      // Se há múltiplas cartas salvas (novo formato)
      if (Array.isArray(betCardData.cards)) {
        return betCardData.cards;
      }
      
      // Se há uma carta salva (formato antigo)
      if (betCardData.card) {
        return [betCardData.card];
      }
      
      return [];
    } catch (error) {
      console.error('Erro ao obter cartas da aposta:', error);
      return [];
    }
  }
}

// Instância singleton
const cardSystem = new CardSystem();

export default cardSystem; 