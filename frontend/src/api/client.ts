import axios from 'axios';

const baseURL = 'http://localhost:8000/api'; // Замените на ваш URL, если он отличается

const api = axios.create({
  baseURL,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
});

// Добавляем перехватчик запросов для аутентификации
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Добавляем перехватчик ответов для обработки ошибок
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // Обрабатываем 401 Unauthorized для автоматического выхода
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      // Если нужно, можно тут перенаправить на страницу входа
      // window.location.href = '/login';
    }
    
    return Promise.reject(error);
  }
);

export default api;