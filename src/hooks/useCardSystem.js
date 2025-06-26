import { useState, useEffect, useCallback } from 'react';
import cardSystem from '../utils/cardSystem';

export const useCardSystem = () => {
  const [showModal, setShowModal] = useState(false);
  const [welcomeCards, setWelcomeCards] = useState([]);

  useEffect(() => {
    // Listener para o evento de cartas de boas-vindas
    const handleShowWelcomeCards = (event) => {
      const { cards } = event.detail;
      if (cards && cards.length > 0) {
        setWelcomeCards(cards);
        setShowModal(true);
      }
    };

    // Adiciona o listener
    window.addEventListener('showWelcomeCards', handleShowWelcomeCards);

    // Cleanup
    return () => {
      window.removeEventListener('showWelcomeCards', handleShowWelcomeCards);
    };
  }, []);

  const closeModal = () => {
    setShowModal(false);
    setWelcomeCards([]);
  };

  // Funções do sistema de cartas com useCallback para evitar recriações
  const getUserCards = useCallback((walletAddress) => {
    return cardSystem.getUserCards(walletAddress);
  }, []);

  const getUserCardStats = useCallback((walletAddress) => {
    return cardSystem.getUserCardStats(walletAddress);
  }, []);

  const hasReceivedWelcomeCards = useCallback((walletAddress) => {
    return cardSystem.hasReceivedWelcomeCards(walletAddress);
  }, []);

  return {
    showModal,
    welcomeCards,
    closeModal,
    getUserCards,
    getUserCardStats,
    hasReceivedWelcomeCards
  };
}; 