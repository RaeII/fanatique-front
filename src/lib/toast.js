import toast from 'react-hot-toast';

/**
 * Mostra uma mensagem de sucesso usando toasts
 * @param {string} message - Mensagem a ser exibida
 */
export const showSuccess = (message) => {
  toast.success(message);
};

/**
 * Mostra uma mensagem de erro usando toasts
 * @param {string} message - Mensagem a ser exibida
 */
export const showError = (message) => {
  toast.error(message);
};

/**
 * Mostra uma mensagem de informação usando toasts
 * @param {string} message - Mensagem a ser exibida
 */
export const showInfo = (message) => {
  toast(message);
};

/**
 * Mostra uma mensagem de alerta usando toasts
 * @param {string} message - Mensagem a ser exibida
 */
export const showWarning = (message) => {
  toast(message, {
    style: {
      background: '#F59E0B',
      color: '#fff',
      top:"20px"
    },
    icon: '⚠️',
  });
};

export default {
  showSuccess,
  showError,
  showInfo,
  showWarning,
}; 