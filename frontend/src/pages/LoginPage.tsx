import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import LoginForm from '@/components/auth/LoginForm';
import { useAuth } from '@/context/AuthContext';

export default function LoginPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  
  // Перенаправление, если пользователь уже авторизован
  useEffect(() => {
    if (user) {
      navigate('/dashboard');
    }
  }, [user, navigate]);
  
  return (
    <div className="container mx-auto px-4 py-16 flex justify-center">
      <LoginForm />
    </div>
  );
}