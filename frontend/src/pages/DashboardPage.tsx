import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

// Заглушка для данных покупок
interface Purchase {
  id: number;
  api_name: string;
  api_id: number;
  plan_type: string;
  purchase_date: string;
  expiry_date?: string;
  status: 'active' | 'expired' | 'canceled';
  price: number;
}

// Заглушка для данных API разработчика
interface DeveloperApi {
  id: number;
  name: string;
  version: string;
  status: 'active' | 'draft' | 'disabled';
  customers: number;
  revenue: number;
  last_updated: string;
}

export default function DashboardPage() {
  const { user } = useAuth();
  const [purchases, setPurchases] = useState<Purchase[]>([]);
  const [developerApis, setDeveloperApis] = useState<DeveloperApi[]>([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    const fetchDashboardData = async () => {
      setLoading(true);
      
      // Имитация получения данных с сервера
      setTimeout(() => {
        // Покупки для покупателей
        setPurchases([
          {
            id: 1,
            api_name: 'Аналитика данных API',
            api_id: 101,
            plan_type: 'Подписка (месяц)',
            purchase_date: '2023-10-15',
            expiry_date: '2023-11-15',
            status: 'active',
            price: 1500
          },
          {
            id: 2,
            api_name: 'Геолокация API',
            api_id: 102,
            plan_type: 'Pay-per-use',
            purchase_date: '2023-09-20',
            status: 'active',
            price: 0.5
          },
          {
            id: 3,
            api_name: 'Конвертация валют API',
            api_id: 103,
            plan_type: 'Подписка (год)',
            purchase_date: '2023-05-10',
            expiry_date: '2024-05-10',
            status: 'active',
            price: 12000
          }
        ]);
        
        // API для разработчиков
        setDeveloperApis([
          {
            id: 201,
            name: 'Обработка текста API',
            version: '1.2',
            status: 'active',
            customers: 45,
            revenue: 67500,
            last_updated: '2023-10-01'
          },
          {
            id: 202,
            name: 'Генерация изображений API',
            version: '2.0',
            status: 'active',
            customers: 78,
            revenue: 156000,
            last_updated: '2023-09-15'
          },
          {
            id: 203,
            name: 'Синтез речи API',
            version: '1.0',
            status: 'draft',
            customers: 0,
            revenue: 0,
            last_updated: '2023-10-10'
          }
        ]);
        
        setLoading(false);
      }, 1000);
    };
    
    fetchDashboardData();
  }, []);
  
  if (!user) {
    return (
      <div className="container mx-auto px-4 py-12 text-center">
        <h1 className="text-3xl font-bold mb-4">Доступ запрещен</h1>
        <p className="mb-6">Для доступа к личному кабинету необходимо авторизоваться</p>
        <Button asChild>
          <Link to="/login">Войти</Link>
        </Button>
      </div>
    );
  }
  
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-2">Личный кабинет</h1>
      <p className="text-gray-600 mb-8">Добро пожаловать, {user.username}!</p>
      
      <Tabs defaultValue={user.role === 'developer' ? 'developer' : 'customer'}>
        <TabsList className="mb-8">
          <TabsTrigger value="customer">Покупатель</TabsTrigger>
          {user.role === 'developer' && (
            <TabsTrigger value="developer">Разработчик</TabsTrigger>
          )}
          <TabsTrigger value="profile">Профиль</TabsTrigger>
        </TabsList>
        
        {/* Вкладка покупателя */}
        <TabsContent value="customer">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <Card>
              <CardHeader>
                <CardTitle>Активные API</CardTitle>
                <CardDescription>API доступные для использования</CardDescription>
              </CardHeader>
              <CardContent className="text-3xl font-bold">
                {purchases.filter(p => p.status === 'active').length}
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Последняя покупка</CardTitle>
                <CardDescription>Дата последней покупки</CardDescription>
              </CardHeader>
              <CardContent className="text-3xl font-bold">
                {purchases.length > 0 
                  ? new Date(purchases[0].purchase_date).toLocaleDateString() 
                  : '-'}
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Общая сумма</CardTitle>
                <CardDescription>Потрачено на покупку API</CardDescription>
              </CardHeader>
              <CardContent className="text-3xl font-bold">
                {purchases.reduce((sum, p) => sum + p.price, 0)} ₽
              </CardContent>
            </Card>
          </div>
          
          <div className="mb-6 flex justify-between items-center">
            <h2 className="text-2xl font-bold">Мои покупки</h2>
            <Button asChild>
              <Link to="/apis">Найти новые API</Link>
            </Button>
          </div>
          
          {loading ? (
            <div className="text-center py-12">
              <p>Загрузка...</p>
            </div>
          ) : purchases.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-lg shadow">
              <p className="mb-4">У вас пока нет покупок</p>
              <Button asChild>
                <Link to="/apis">Перейти в каталог API</Link>
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {purchases.map((purchase) => (
                <Card key={purchase.id}>
                  <div className="flex flex-col md:flex-row md:items-center p-6">
                    <div className="flex-grow mb-4 md:mb-0">
                      <h3 className="text-lg font-semibold">
                        <Link 
                          to={`/apis/${purchase.api_id}`}
                          className="hover:text-blue-600"
                        >
                          {purchase.api_name}
                        </Link>
                      </h3>
                      <p className="text-gray-600">{purchase.plan_type}</p>
                      <div className="flex items-center gap-6 mt-2">
                        <div>
                          <p className="text-sm text-gray-500">Дата покупки</p>
                          <p>{new Date(purchase.purchase_date).toLocaleDateString()}</p>
                        </div>
                        {purchase.expiry_date && (
                          <div>
                            <p className="text-sm text-gray-500">Действует до</p>
                            <p>{new Date(purchase.expiry_date).toLocaleDateString()}</p>
                          </div>
                        )}
                        <div>
                          <p className="text-sm text-gray-500">Статус</p>
                          <span 
                            className={`inline-block px-2 py-1 rounded text-xs font-medium ${
                              purchase.status === 'active' 
                                ? 'bg-green-100 text-green-800' 
                                : purchase.status === 'expired'
                                ? 'bg-red-100 text-red-800'
                                : 'bg-gray-100 text-gray-800'
                            }`}
                          >
                            {purchase.status === 'active' 
                              ? 'Активен' 
                              : purchase.status === 'expired' 
                              ? 'Истек' 
                              : 'Отменен'}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Button asChild variant="outline">
                        <Link to={`/apis/${purchase.api_id}`}>
                          Подробнее
                        </Link>
                      </Button>
                      <Button asChild>
                        <Link to={`/support/create?api=${purchase.api_id}`}>
                          Поддержка
                        </Link>
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
        
        {/* Вкладка разработчика */}
        <TabsContent value="developer">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <Card>
              <CardHeader>
                <CardTitle>Мои API</CardTitle>
                <CardDescription>Общее количество API</CardDescription>
              </CardHeader>
              <CardContent className="text-3xl font-bold">
                {developerApis.length}
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Клиенты</CardTitle>
                <CardDescription>Активные пользователи</CardDescription>
              </CardHeader>
              <CardContent className="text-3xl font-bold">
                {developerApis.reduce((sum, api) => sum + api.customers, 0)}
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Доход</CardTitle>
                <CardDescription>Общий доход от API</CardDescription>
              </CardHeader>
              <CardContent className="text-3xl font-bold">
                {developerApis.reduce((sum, api) => sum + api.revenue, 0)} ₽
              </CardContent>
            </Card>
          </div>
          
          <div className="mb-6 flex justify-between items-center">
            <h2 className="text-2xl font-bold">Мои API</h2>
            <Button asChild>
              <Link to="/developer/create-api">Добавить новый API</Link>
            </Button>
          </div>
          
          {loading ? (
            <div className="text-center py-12">
              <p>Загрузка...</p>
            </div>
          ) : developerApis.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-lg shadow">
              <p className="mb-4">У вас пока нет созданных API</p>
              <Button asChild>
                <Link to="/developer/create-api">Создать API</Link>
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {developerApis.map((api) => (
                <Card key={api.id}>
                  <div className="flex flex-col md:flex-row md:items-center p-6">
                    <div className="flex-grow mb-4 md:mb-0">
                      <h3 className="text-lg font-semibold">
                        <Link 
                          to={`/developer/apis/${api.id}`}
                          className="hover:text-blue-600"
                        >
                          {api.name} (v{api.version})
                        </Link>
                      </h3>
                      <div className="flex items-center gap-6 mt-2">
                        <div>
                          <p className="text-sm text-gray-500">Статус</p>
                          <span 
                            className={`inline-block px-2 py-1 rounded text-xs font-medium ${
                              api.status === 'active' 
                                ? 'bg-green-100 text-green-800' 
                                : api.status === 'draft'
                                ? 'bg-yellow-100 text-yellow-800'
                                : 'bg-red-100 text-red-800'
                            }`}
                          >
                            {api.status === 'active' 
                              ? 'Активен' 
                              : api.status === 'draft' 
                              ? 'Черновик' 
                              : 'Отключен'}
                          </span>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">Клиенты</p>
                          <p>{api.customers}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">Доход</p>
                          <p>{api.revenue} ₽</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">Обновлено</p>
                          <p>{new Date(api.last_updated).toLocaleDateString()}</p>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Button asChild variant="outline">
                        <Link to={`/developer/apis/${api.id}`}>
                          Управление
                        </Link>
                      </Button>
                      <Button asChild>
                        <Link to={`/developer/apis/${api.id}/analytics`}>
                          Аналитика
                        </Link>
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
        
        {/* Вкладка профиля */}
        <TabsContent value="profile">
          <Card>
            <CardHeader>
              <CardTitle>Мой профиль</CardTitle>
              <CardDescription>Управление личными данными</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                    <p className="font-medium">{user.first_name || '-'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Фамилия</p>
                    <p className="font-medium">{user.last_name || '-'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Роль</p>
                    <p className="font-medium capitalize">{user.role}</p>
                  </div>
                </div>
                
                <div className="flex space-x-4">
                  <Button asChild variant="outline">
                    <Link to="/profile/edit">
                      Редактировать профиль
                    </Link>
                  </Button>
                  <Button asChild variant="outline">
                    <Link to="/profile/password">
                      Сменить пароль
                    </Link>
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <div className="mt-8 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Мои платежные методы</CardTitle>
                <CardDescription>Управление способами оплаты</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center">
                      <div className="w-10 h-6 bg-blue-100 rounded mr-4 flex items-center justify-center text-blue-800 font-bold">
                        V
                      </div>
                      <div>
                        <p className="font-medium">Visa ****6789</p>
                        <p className="text-sm text-gray-500">Истекает: 05/2027</p>
                      </div>
                    </div>
                    <div>
                      <p className="text-sm bg-green-100 text-green-800 px-2 py-1 rounded">
                        Основная
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center">
                      <div className="w-10 h-6 bg-red-100 rounded mr-4 flex items-center justify-center text-red-800 font-bold">
                        M
                      </div>
                      <div>
                        <p className="font-medium">MasterCard ****4321</p>
                        <p className="text-sm text-gray-500">Истекает: 12/2025</p>
                      </div>
                    </div>
                    <div>
                      <Button variant="ghost" size="sm">Сделать основной</Button>
                    </div>
                  </div>
                  
                  <div className="pt-4">
                    <Button variant="outline">
                      Добавить платежный метод
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Безопасность</CardTitle>
                <CardDescription>Настройки безопасности вашего аккаунта</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Двухфакторная аутентификация</p>
                      <p className="text-sm text-gray-500">
                        Добавьте дополнительный уровень защиты к вашему аккаунту
                      </p>
                    </div>
                    <Button variant="outline">Настроить</Button>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Активные сессии</p>
                      <p className="text-sm text-gray-500">
                        Управление активными сеансами на устройствах
                      </p>
                    </div>
                    <Button variant="outline">Просмотреть</Button>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">API ключи</p>
                      <p className="text-sm text-gray-500">
                        Управление ключами для доступа к API
                      </p>
                    </div>
                    <Button variant="outline">Управление</Button>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card className="border-red-200">
              <CardHeader>
                <CardTitle className="text-red-600">Опасная зона</CardTitle>
                <CardDescription>
                  Действия, которые нельзя отменить
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Удалить аккаунт</p>
                      <p className="text-sm text-gray-500">
                        Удаление аккаунта необратимо и приведет к потере всех данных
                      </p>
                    </div>
                    <Button variant="destructive">Удалить аккаунт</Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}