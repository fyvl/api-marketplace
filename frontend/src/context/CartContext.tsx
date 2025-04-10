import { useState, useEffect, createContext, useContext, ReactNode } from 'react';
import api from '@/api/client';
import { useAuth } from './AuthContext';

// Типы
interface CartItem {
  id: number;
  money_types_for_each_api_id: number;
  api: {
    id: number;
    name: string;
    type: string;
    version: string;
  };
  price: number;
  plan: {
    unit_of_payment: string;
    price: number;
    money_type: {
      types_of_use: string;
      description: string;
    };
  };
  quantity: number;
}

interface CartContextType {
  items: CartItem[];
  loading: boolean;
  error: string | null;
  addToCart: (apiId: number, planId?: number) => Promise<void>;
  removeFromCart: (cartItemId: number) => Promise<void>;
  updateQuantity: (cartItemId: number, quantity: number) => Promise<void>;
  clearCart: () => Promise<void>;
  total: number;
}

// Контекст корзины
export const CartContext = createContext<CartContextType | undefined>(undefined);

// Провайдер корзины
export const CartProvider = ({ children }: { children: ReactNode }) => {
  const [items, setItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  // Вычисляем общую сумму корзины
  const total = items.reduce((acc, item) => acc + (item.price * item.quantity), 0);

  // Загрузка корзины при авторизации пользователя
  useEffect(() => {
    if (user) {
      fetchCart();
    } else {
      setItems([]);
    }
  }, [user]);

  // Загрузка содержимого корзины с сервера
  const fetchCart = async () => {
    try {
      setLoading(true);
      const response = await api.get('/cart');
      setItems(response.data.items);
      setError(null);
    } catch (err) {
      console.error('Error fetching cart:', err);
      setError('Не удалось загрузить корзину');
    } finally {
      setLoading(false);
    }
  };

  // Добавление API в корзину
  const addToCart = async (apiId: number, planId?: number) => {
    if (!user) {
      setError('Чтобы добавить товар в корзину, необходимо авторизоваться');
      return;
    }

    try {
      setLoading(true);
      const payload = planId 
        ? { api_id: apiId, money_types_for_each_api_id: planId } 
        : { api_id: apiId };
      
      await api.post('/cart', payload);
      await fetchCart();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      console.error('Error adding to cart:', err);
      setError(err.response?.data?.message || 'Ошибка при добавлении в корзину');
    } finally {
      setLoading(false);
    }
  };

  // Удаление товара из корзины
  const removeFromCart = async (cartItemId: number) => {
    try {
      setLoading(true);
      await api.delete(`/cart/${cartItemId}`);
      setItems(items.filter(item => item.id !== cartItemId));
    } catch (err) {
      console.error('Error removing from cart:', err);
      setError('Ошибка при удалении из корзины');
    } finally {
      setLoading(false);
    }
  };

  // Обновление количества товара
  const updateQuantity = async (cartItemId: number, quantity: number) => {
    try {
      setLoading(true);
      await api.put(`/cart/${cartItemId}`, { quantity });
      setItems(
        items.map(item => 
          item.id === cartItemId ? { ...item, quantity } : item
        )
      );
    } catch (err) {
      console.error('Error updating quantity:', err);
      setError('Ошибка при обновлении количества');
    } finally {
      setLoading(false);
    }
  };

  // Очистка корзины
  const clearCart = async () => {
    try {
      setLoading(true);
      await api.delete('/cart');
      setItems([]);
    } catch (err) {
      console.error('Error clearing cart:', err);
      setError('Ошибка при очистке корзины');
    } finally {
      setLoading(false);
    }
  };

  return (
    <CartContext.Provider
      value={{
        items,
        loading,
        error,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        total
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

// Хук для использования контекста корзины
export const useCart = () => {
  const context = useContext(CartContext);
  
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  
  return context;
};