import { Navigate } from 'react-router-dom';

// Função para verificar autenticação armazenada
const isAuthenticated = () => {
  const token = localStorage.getItem('auth_token');
  const wallet = localStorage.getItem('wallet_address');
  return !!(token && wallet);
};

// Componente para rotas protegidas
export function ProtectedRoute({ children }) {
  if (!isAuthenticated()) {
    return <Navigate to="/" replace />;
  }
  return children;
}

export default ProtectedRoute; 