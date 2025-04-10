import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '@/api/client';
import { ApiCard } from '@/components/api/ApiCard';
import { useCart } from '@/context/CartContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

// Типы
interface ApiProduct {
  id: number;
  name: string;
  type: string;
  protocol: string;
  version: string;
  body?: string;
  creator: {
    id: number;
    username: string;
  };
  categories: Array<{
    id: number;
    name: string;
    slug: string;
  }>;
  averageRating: number;
  lowestPrice?: number;
}

interface CategoryWithCount {
  id: number;
  name: string;
  slug: string;
  count: number;
}

export default function HomePage() {
  const [featuredApis, setFeaturedApis] = useState<ApiProduct[]>([]);
  const [newestApis, setNewestApis] = useState<ApiProduct[]>([]);
  const [popularCategories, setPopularCategories] = useState<CategoryWithCount[]>([]);
  const [loading, setLoading] = useState(true);
  const { addToCart } = useCart();
  
  useEffect(() => {
    const fetchHomeData = async () => {
      try {
        setLoading(true);
        
        // Параллельные запросы для лучшей производительности
        const [featuredResponse, newestResponse, categoriesResponse] = await Promise.all([
          api.get('/apis/featured'),
          api.get('/apis/newest'),
          api.get('/categories/popular')
        ]);
        
        setFeaturedApis(featuredResponse.data);
        setNewestApis(newestResponse.data);
        setPopularCategories(categoriesResponse.data);
      } catch (error) {
        console.error('Error fetching home data:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchHomeData();
  }, []);
  
  const handleAddToCart = (apiId: number) => {
    addToCart(apiId);
  };
  
  return (
    <div className="container mx-auto px-4 py-8">
      {/* Hero секция */}
      <section className="py-12 md:py-20 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-xl mb-12">
        <div className="container mx-auto text-center px-4">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6">
            API Marketplace
          </h1>
          <p className="text-xl md:text-2xl mb-8 max-w-2xl mx-auto">
            Найдите и интегрируйте лучшие API для вашего проекта. 
            Или разместите свой API и монетизируйте его.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Button asChild size="lg" variant="default" className="bg-white text-blue-700 hover:bg-gray-100">
              <Link to="/apis">Найти API</Link>
            </Button>
            <Button asChild size="lg" variant="default" className="bg-white text-blue-700 hover:bg-gray-100">
              <Link to="/developer/create-api">Разместить свой API</Link>
            </Button>
          </div>
        </div>
      </section>
      
      {/* Популярные категории */}
      <section className="mb-16">
        <h2 className="text-3xl font-bold mb-6">Популярные категории</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
          {popularCategories.map((category) => (
            <Link
              key={category.id}
              to={`/apis?category=${category.slug}`}
              className="block"
            >
              <Card className="h-full hover:shadow-md transition-shadow">
                <CardContent className="p-6 flex flex-col items-center text-center">
                  <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center mb-3">
                    <span className="text-blue-600 text-xl font-semibold">
                      {category.name.charAt(0)}
                    </span>
                  </div>
                  <h3 className="font-medium mb-1">{category.name}</h3>
                  <p className="text-sm text-gray-500">{category.count} API</p>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </section>
      
      {/* Рекомендуемые API */}
      <section className="mb-16">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-3xl font-bold">Рекомендуемые API</h2>
          <Button asChild variant="outline">
            <Link to="/apis">Смотреть все</Link>
          </Button>
        </div>
        
        {loading ? (
          <div className="text-center py-12">
            <p>Загрузка...</p>
          </div>
        ) : featuredApis.length === 0 ? (
          <div className="text-center py-12">
            <p>Пока нет рекомендуемых API</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {featuredApis.map((api) => (
              <ApiCard 
                key={api.id} 
                api={api} 
                onAddToCart={handleAddToCart}
              />
            ))}
          </div>
        )}
      </section>
      
      {/* Новые API */}
      <section className="mb-16">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-3xl font-bold">Новые API</h2>
          <Button asChild variant="outline">
            <Link to="/apis?sort=newest">Смотреть все</Link>
          </Button>
        </div>
        
        {loading ? (
          <div className="text-center py-12">
            <p>Загрузка...</p>
          </div>
        ) : newestApis.length === 0 ? (
          <div className="text-center py-12">
            <p>Пока нет новых API</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {newestApis.map((api) => (
              <ApiCard 
                key={api.id} 
                api={api} 
                onAddToCart={handleAddToCart}
              />
            ))}
          </div>
        )}
      </section>
      
      {/* Для разработчиков */}
      <section className="py-12 bg-gray-100 rounded-xl mb-16">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-6">Вы разработчик API?</h2>
          <p className="text-xl mb-8 max-w-2xl mx-auto">
            Разместите свой API продукт на нашей платформе и получайте доход от подписок и покупок.
            Пусть ваш API работает на вас!
          </p>
          <Button asChild size="lg">
            <Link to="/developer/create-api">Стать разработчиком</Link>
          </Button>
        </div>
      </section>
      
      {/* Преимущества */}
      <section className="mb-16">
        <h2 className="text-3xl font-bold mb-8 text-center">Преимущества API Marketplace</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <Card className="border-t-4 border-blue-500">
            <CardContent className="p-6">
              <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center mb-4">
                <span className="text-blue-600 text-xl">🔍</span>
              </div>
              <h3 className="text-xl font-semibold mb-2">Найдите нужное API</h3>
              <p>Широкий выбор API продуктов в различных категориях. Удобный поиск и фильтрация.</p>
            </CardContent>
          </Card>
          
          <Card className="border-t-4 border-green-500">
            <CardContent className="p-6">
              <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center mb-4">
                <span className="text-green-600 text-xl">💰</span>
              </div>
              <h3 className="text-xl font-semibold mb-2">Гибкие тарифы</h3>
              <p>Различные модели оплаты: подписки, разовые покупки, оплата по использованию.</p>
            </CardContent>
          </Card>
          
          <Card className="border-t-4 border-purple-500">
            <CardContent className="p-6">
              <div className="w-12 h-12 rounded-full bg-purple-100 flex items-center justify-center mb-4">
                <span className="text-purple-600 text-xl">👨‍💻</span>
              </div>
              <h3 className="text-xl font-semibold mb-2">Для разработчиков</h3>
              <p>Размещайте свои API, управляйте доступом и получайте доход от пользователей.</p>
            </CardContent>
          </Card>
        </div>
      </section>
      
      {/* Отзывы пользователей */}
      <section className="mb-16">
        <h2 className="text-3xl font-bold mb-8 text-center">Что говорят наши пользователи</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="shadow">
            <CardContent className="p-6">
              <div className="flex items-center mb-4">
                <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center mr-4">
                  <span className="font-semibold">АК</span>
                </div>
                <div>
                  <h4 className="font-semibold">Александр К.</h4>
                  <div className="text-yellow-500">★★★★★</div>
                </div>
              </div>
              <p className="text-gray-600">
                "Отличная платформа для разработчиков. Я начал продавать свой API для обработки данных и уже получаю стабильный доход. Очень удобный интерфейс!"
              </p>
            </CardContent>
          </Card>
          
          <Card className="shadow">
            <CardContent className="p-6">
              <div className="flex items-center mb-4">
                <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center mr-4">
                  <span className="font-semibold">ИС</span>
                </div>
                <div>
                  <h4 className="font-semibold">Ирина С.</h4>
                  <div className="text-yellow-500">★★★★☆</div>
                </div>
              </div>
              <p className="text-gray-600">
                "Мы используем несколько API с этой платформы для нашего стартапа. Удобно то, что все доступы и настройки в одном месте. Документация всегда подробная."
              </p>
            </CardContent>
          </Card>
          
          <Card className="shadow">
            <CardContent className="p-6">
              <div className="flex items-center mb-4">
                <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center mr-4">
                  <span className="font-semibold">МВ</span>
                </div>
                <div>
                  <h4 className="font-semibold">Михаил В.</h4>
                  <div className="text-yellow-500">★★★★★</div>
                </div>
              </div>
              <p className="text-gray-600">
                "Как разработчик могу сказать, что здесь действительно удобно размещать свои API. Различные модели монетизации и детальная статистика использования - это именно то, что нужно."
              </p>
            </CardContent>
          </Card>
        </div>
      </section>
      
      {/* FAQ */}
      <section className="mb-16">
        <h2 className="text-3xl font-bold mb-8 text-center">Часто задаваемые вопросы</h2>
        <div className="max-w-3xl mx-auto space-y-4">
          <Card>
            <CardContent className="p-6">
              <h3 className="text-xl font-semibold mb-2">Что такое API Marketplace?</h3>
              <p className="text-gray-600">
                API Marketplace - это платформа, где разработчики могут размещать свои API для продажи, а компании и другие разработчики могут найти и приобрести доступ к нужным им API.
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <h3 className="text-xl font-semibold mb-2">Как стать разработчиком на платформе?</h3>
              <p className="text-gray-600">
                Просто зарегистрируйтесь, выберите роль "Разработчик" и заполните необходимую информацию. После этого вы сможете размещать свои API продукты.
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <h3 className="text-xl font-semibold mb-2">Какие модели монетизации поддерживаются?</h3>
              <p className="text-gray-600">
                Платформа поддерживает различные модели: подписки (ежемесячные, годовые), плата за использование (pay-per-use), единоразовые покупки, и комбинированные модели.
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <h3 className="text-xl font-semibold mb-2">Какую комиссию берет платформа?</h3>
              <p className="text-gray-600">
                Комиссия составляет 10% от суммы продаж. Это включает обслуживание платформы, обработку платежей и техническую поддержку.
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <h3 className="text-xl font-semibold mb-2">Как происходит техническая поддержка?</h3>
              <p className="text-gray-600">
                Разработчики API сами обеспечивают техническую поддержку своих продуктов. Платформа предоставляет удобный интерфейс для коммуникации между разработчиками и пользователями.
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <h3 className="text-xl font-semibold mb-2">Как защищены мои данные?</h3>
              <p className="text-gray-600">
                Мы используем современные методы шифрования и защиты данных. Аутентификация API происходит через безопасные токены. Все платежные данные обрабатываются через защищенные шлюзы.
              </p>
            </CardContent>
          </Card>
        </div>
      </section>
      
      {/* Статистика платформы */}
      <section className="mb-16 py-12 bg-gray-50 rounded-xl">
        <h2 className="text-3xl font-bold mb-8 text-center">API Marketplace в цифрах</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto">
          <div className="text-center">
            <div className="text-4xl font-bold text-blue-600 mb-2">500+</div>
            <p className="text-gray-700">API продуктов</p>
          </div>
          <div className="text-center">
            <div className="text-4xl font-bold text-blue-600 mb-2">2,000+</div>
            <p className="text-gray-700">Активных пользователей</p>
          </div>
          <div className="text-center">
            <div className="text-4xl font-bold text-blue-600 mb-2">50+</div>
            <p className="text-gray-700">Категорий</p>
          </div>
          <div className="text-center">
            <div className="text-4xl font-bold text-blue-600 mb-2">99.9%</div>
            <p className="text-gray-700">Время работы</p>
          </div>
        </div>
      </section>
      
      {/* Партнеры */}
      <section className="mb-16">
        <h2 className="text-3xl font-bold mb-8 text-center">Наши партнеры</h2>
        <div className="flex flex-wrap justify-center items-center gap-10 py-6">
          <div className="grayscale hover:grayscale-0 transition-all opacity-70 hover:opacity-100">
            <div className="h-12 w-32 bg-gray-200 rounded flex items-center justify-center">
              <span className="font-bold text-gray-600">Компания 1</span>
            </div>
          </div>
          <div className="grayscale hover:grayscale-0 transition-all opacity-70 hover:opacity-100">
            <div className="h-12 w-32 bg-gray-200 rounded flex items-center justify-center">
              <span className="font-bold text-gray-600">Компания 2</span>
            </div>
          </div>
          <div className="grayscale hover:grayscale-0 transition-all opacity-70 hover:opacity-100">
            <div className="h-12 w-32 bg-gray-200 rounded flex items-center justify-center">
              <span className="font-bold text-gray-600">Компания 3</span>
            </div>
          </div>
          <div className="grayscale hover:grayscale-0 transition-all opacity-70 hover:opacity-100">
            <div className="h-12 w-32 bg-gray-200 rounded flex items-center justify-center">
              <span className="font-bold text-gray-600">Компания 4</span>
            </div>
          </div>
          <div className="grayscale hover:grayscale-0 transition-all opacity-70 hover:opacity-100">
            <div className="h-12 w-32 bg-gray-200 rounded flex items-center justify-center">
              <span className="font-bold text-gray-600">Компания 5</span>
            </div>
          </div>
        </div>
      </section>
      
      {/* CTA */}
      <section className="py-16 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-xl mb-8">
        <div className="container mx-auto text-center px-4">
          <h2 className="text-3xl font-bold mb-4">Готовы начать?</h2>
          <p className="text-xl mb-8 max-w-2xl mx-auto">
            Присоединяйтесь к тысячам разработчиков и компаний уже использующих нашу платформу.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Button asChild size="lg" variant="default" className="bg-white text-indigo-700 hover:bg-gray-100">
              <Link to="/register">Создать аккаунт</Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-indigo-700">
              <Link to="/apis">Просмотреть API</Link>
            </Button>
          </div>
        </div>
      </section>
      
      {/* Подписка на новости */}
      <section className="mb-16">
        <Card className="border-0 shadow-lg overflow-hidden">
          <div className="flex flex-col md:flex-row">
            <div className="md:w-1/2 p-8 md:p-12 bg-blue-50">
              <h2 className="text-2xl font-bold mb-4">Подпишитесь на новости</h2>
              <p className="text-gray-600 mb-6">
                Получайте уведомления о новых API, обновлениях и специальных предложениях.
              </p>
              <div className="flex gap-2">
                <input 
                  type="email" 
                  placeholder="Ваш email" 
                  className="px-4 py-2 border rounded flex-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <Button>Подписаться</Button>
              </div>
              <p className="text-xs text-gray-500 mt-4">
                Мы не будем отправлять спам. Вы можете отписаться в любой момент.
              </p>
            </div>
            <div className="md:w-1/2 bg-gradient-to-br from-blue-400 to-blue-600 p-8 md:p-12 text-white">
              <h3 className="text-xl font-bold mb-4">Будьте в курсе новостей</h3>
              <ul className="space-y-3">
                <li className="flex items-center gap-2">
                  ✓ Новые API продукты
                </li>
                <li className="flex items-center gap-2">
                  ✓ Технические обновления
                </li>
                <li className="flex items-center gap-2">
                  ✓ Советы по интеграции
                </li>
                <li className="flex items-center gap-2">
                  ✓ Истории успеха
                </li>
              </ul>
            </div>
          </div>
        </Card>
      </section>
    </div>
  );
}