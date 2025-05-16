import { useAuth } from '@/context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { PencilIcon, KeyIcon, UserCircleIcon } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export default function ProfilePage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  
  // Перенаправление на страницу входа, если пользователь не авторизован
  useEffect(() => {
    if (!user) {
      navigate('/login');
    }
  }, [user, navigate]);
  
  if (!user) {
    return null;
  }
  
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold mb-2">Мой профиль</h1>
          <p className="text-gray-600">Управление личными данными и настройками</p>
        </div>
      </div>
      
      <Tabs defaultValue="info">
        <TabsList className="mb-8">
          <TabsTrigger value="info">Личные данные</TabsTrigger>
          <TabsTrigger value="security">Безопасность</TabsTrigger>
        </TabsList>
        
        <TabsContent value="info">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-4 mb-6">
                <UserCircleIcon className="h-16 w-16 text-gray-300" />
                <div>
                  <h2 className="text-2xl font-bold">{user.username}</h2>
                  <p className="text-gray-600">{user.email}</p>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4 mt-8">
                <div>
                  <p className="text-sm text-gray-500">Имя пользователя</p>
                  <p className="font-medium">{user.username}</p>
                </div>
                
                <div>
                  <p className="text-sm text-gray-500">Email</p>
                  <p className="font-medium">{user.email}</p>
                </div>
                
                <div>
                  <p className="text-sm text-gray-500">Имя</p>
                  <p className="font-medium">{user.first_name || '—'}</p>
                </div>
                
                <div>
                  <p className="text-sm text-gray-500">Фамилия</p>
                  <p className="font-medium">{user.last_name || '—'}</p>
                </div>
                
                <div>
                  <p className="text-sm text-gray-500">Роль</p>
                  <p className="font-medium capitalize">
                    {user.role === 'developer' ? 'Developer' : 
                     user.role === 'customer' ? 'Customer' : 
                     user.role === 'admin' ? 'Admin' : user.role}
                  </p>
                </div>
                
                {user.phone && (
                  <div>
                    <p className="text-sm text-gray-500">Телефон</p>
                    <p className="font-medium">{user.phone}</p>
                  </div>
                )}
              </div>
              
              <div className="flex space-x-4 mt-8">
                <Button asChild variant="outline" className="flex items-center gap-2">
                  <Link to="/profile/edit">
                    <PencilIcon className="h-4 w-4" />
                    Редактировать профиль
                  </Link>
                </Button>
                
                <Button asChild variant="outline" className="flex items-center gap-2">
                  <Link to="/profile/password">
                    <KeyIcon className="h-4 w-4" />
                    Сменить пароль
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="security">
          <Card>
            <CardContent className="p-6">
              <div className="mb-6">
                <h2 className="text-2xl font-bold mb-2">Безопасность</h2>
                <p className="text-gray-600">Настройки безопасности аккаунта</p>
              </div>
              
              <div className="space-y-6">
                <div className="flex items-center justify-between py-3 border-b">
                  <div>
                    <p className="font-medium">Двухфакторная аутентификация</p>
                    <p className="text-sm text-gray-500">
                      Добавьте дополнительный уровень защиты к вашему аккаунту
                    </p>
                  </div>
                  <Button variant="outline">Настроить</Button>
                </div>
                
                <div className="flex items-center justify-between py-3 border-b">
                  <div>
                    <p className="font-medium">Активные сессии</p>
                    <p className="text-sm text-gray-500">
                      Управление активными сеансами на устройствах
                    </p>
                  </div>
                  <Button variant="outline">Просмотреть</Button>
                </div>
                
                <div className="flex items-center justify-between py-3">
                  <div>
                    <p className="font-medium">API ключи</p>
                    <p className="text-sm text-gray-500">
                      Управление ключами для доступа к API
                    </p>
                  </div>
                  <Button variant="outline">Управление</Button>
                </div>
                
                <div className="pt-4 mt-4 border-t border-red-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-red-600">Удалить аккаунт</p>
                      <p className="text-sm text-gray-500">
                        Удаление аккаунта необратимо и приведет к потере всех данных
                      </p>
                    </div>
                    <Button variant="destructive">Удалить аккаунт</Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}