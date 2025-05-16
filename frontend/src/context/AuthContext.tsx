/* eslint-disable react-refresh/only-export-components */
import { createContext, useState, useEffect, ReactNode, useContext } from 'react';
import api from '@/api/client';

// Обновленные типы
interface User {
  id: number;
  username: string;
  email: string;
  role: 'developer' | 'customer' | 'admin';
  first_name?: string;
  last_name?: string;
  phone?: string; // Добавлено поле phone
  patronymic?: string; // Добавлено поле отчество, если понадобится
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<void>;
  register: (userData: RegisterData) => Promise<void>;
  logout: () => void;
  clearError: () => void;
  updateUser: (userData: Partial<User>) => void; // Метод для обновления данных пользователя
}

interface RegisterData {
  username: string;
  email: string;
  password: string;
  password_confirmation: string;
  role: 'developer' | 'customer';
  first_name?: string;
  last_name?: string;
  phone?: string;
}

// Создаем контекст аутентификации
export const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Провайдер контекста
export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Проверка токена при загрузке
  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('token');

      if (token) {
        try {
          const response = await api.get('/user');
          setUser(response.data);
        } catch (err) {
          console.error('Session expired or invalid', err);
          localStorage.removeItem('token');
        }
      }
      
      setLoading(false);
    };

    checkAuth();
  }, []);

  // Функция входа
  const login = async (email: string, password: string) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await api.post('/login', { email, password });
      const { user, token } = response.data;
      
      localStorage.setItem('token', token);
      setUser(user);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      console.error('Login error:', err);
      setError(err.response?.data?.message || 'Ошибка при входе');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Функция регистрации
  const register = async (userData: RegisterData) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await api.post('/register', userData);
      const { user, token } = response.data;
      
      localStorage.setItem('token', token);
      setUser(user);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      console.error('Registration error:', err);
      setError(err.response?.data?.message || 'Ошибка при регистрации');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Функция выхода
  const logout = () => {
    api.post('/logout')
      .then(() => {
        localStorage.removeItem('token');
        setUser(null);
      })
      .catch((err) => {
        console.error('Logout error:', err);
      });
  };

  // Функция обновления данных пользователя
  const updateUser = (userData: Partial<User>) => {
    if (user) {
      setUser({ ...user, ...userData });
    }
  };

  // Очистка ошибок
  const clearError = () => setError(null);

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        error,
        login,
        register,
        logout,
        clearError,
        updateUser
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

// Хук для использования контекста аутентификации
export const useAuth = () => {
  const context = useContext(AuthContext);
  
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  
  return context;
};