import axios from 'axios';

// Configuração base do axios
const api = axios.create({
  baseURL: import.meta.env.VITE_URL_API,
  timeout: 100000,
  headers: {
    'Content-Type': 'application/json',
  }
});

// Interceptor para adicionar o token de autenticação em cada requisição
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('auth_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor para tratamento de erros
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Tratamento de erros aqui
    if (error?.response?.data?.message) {
      console.error('Erro na requisição:', error.response.data.message);
    } else {
      console.error('Erro na requisição:', error);
    }
    return Promise.reject(error);
  }
);


export default api; 