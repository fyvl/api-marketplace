import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from '@/components/ui/sonner';
import { AuthProvider } from '@/context/AuthContext';
import { CartProvider } from '@/context/CartContext';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';

// Pages
import HomePage from '@/pages/HomePage';
import LoginPage from '@/pages/LoginPage';
import RegisterPage from '@/pages/RegisterPage';
import ApiListPage from '@/pages/ApiListPage';
import ApiDetailsPage from '@/pages/ApiDetailsPage';
import CartPage from '@/pages/CartPage';
import CheckoutPage from '@/pages/CheckoutPage';
import DashboardPage from '@/pages/DashboardPage';
import ProfilePage from '@/pages/ProfilePage'; // Используем новую детальную страницу профиля
import ProfileEditPage from '@/pages/ProfileEditPage';
import ChangePasswordPage from '@/pages/ChangePasswordPage';
import DeveloperApisPage from '@/pages/DeveloperApisPage';
import CreateApiPage from '@/pages/CreateApiPage';
import NotFoundPage from '@/pages/NotFoundPage';

// Protected route component
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  // В реальном приложении здесь должна быть проверка авторизации
  const isAuthenticated = localStorage.getItem('token') !== null;
  
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  
  return <>{children}</>;
};

function App() {
  return (
    <Router>
      <AuthProvider>
        <CartProvider>
          <div className="flex flex-col min-h-screen">
            <Header />
            <main className="flex-grow bg-gray-50">
              <Routes>
                <Route path="/" element={<HomePage />} />
                <Route path="/login" element={<LoginPage />} />
                <Route path="/register" element={<RegisterPage />} />
                <Route path="/apis" element={<ApiListPage />} />
                <Route path="/apis/:id" element={<ApiDetailsPage />} />
                
                {/* Защищенные маршруты */}
                <Route path="/cart" element={
                  <ProtectedRoute>
                    <CartPage />
                  </ProtectedRoute>
                } />
                <Route path="/checkout" element={
                  <ProtectedRoute>
                    <CheckoutPage />
                  </ProtectedRoute>
                } />
                <Route path="/dashboard" element={
                  <ProtectedRoute>
                    <DashboardPage />
                  </ProtectedRoute>
                } />
                <Route path="/profile" element={
                  <ProtectedRoute>
                    <ProfilePage />
                  </ProtectedRoute>
                } />
                <Route path="/profile/edit" element={
                  <ProtectedRoute>
                    <ProfileEditPage />
                  </ProtectedRoute>
                } />
                <Route path="/profile/password" element={
                  <ProtectedRoute>
                    <ChangePasswordPage />
                  </ProtectedRoute>
                } />
                
                {/* Маршруты для разработчиков */}
                <Route path="/developer/apis" element={
                  <ProtectedRoute>
                    <DeveloperApisPage />
                  </ProtectedRoute>
                } />
                <Route path="/developer/create-api" element={
                  <ProtectedRoute>
                    <CreateApiPage />
                  </ProtectedRoute>
                } />
                
                {/* Страница 404 */}
                <Route path="*" element={<NotFoundPage />} />
              </Routes>
            </main>
            <Footer />
          </div>
          <Toaster />
        </CartProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;