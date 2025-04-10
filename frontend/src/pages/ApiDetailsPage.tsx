import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import api from '@/api/client';
import { useCart } from '@/context/CartContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';

// Заглушка для данных API - замените на реальный интерфейс по мере разработки
interface ApiDetails {
  id: number;
  name: string;
  type: string;
  protocol: string;
  version: string;
  body?: string;
  documentation?: string;
  integration_guide?: string;
  usage_examples?: string;
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
  plans: Array<{
    id: number;
    unit_of_payment: string;
    price: number;
    money_type: {
      id: number;
      types_of_use: string;
      description: string;
    };
  }>;
}

export default function ApiDetailsPage() {
  const { id } = useParams<{ id: string }>();
  const [apiDetails, setApiDetails] = useState<ApiDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { addToCart } = useCart();
  
  useEffect(() => {
    const fetchApiDetails = async () => {
      try {
        setLoading(true);
        
        // В реальном приложении здесь будет запрос к бэкенду
        // const response = await api.get(`/apis/${id}`);
        // setApiDetails(response.data);
        
        // Заглушка для разработки
        setApiDetails({
          id: Number(id),
          name: 'Пример API',
          type: 'REST',
          protocol: 'HTTPS',
          version: '1.0',
          body: 'Подробное описание API. Здесь будет текст о возможностях и применении данного API.',
          documentation: 'Документация по использованию API: эндпоинты, параметры, примеры ответов.',
          integration_guide: 'Пошаговое руководство по интеграции API в ваше приложение.',
          usage_examples: 'Примеры кода для интеграции на различных языках программирования.',
          creator: {
            id: 1,
            username: 'developer1'
          },
          categories: [
            { id: 1, name: 'Аналитика', slug: 'analytics' },
            { id: 2, name: 'Данные', slug: 'data' }
          ],
          averageRating: 4.5,
          plans: [
            {
              id: 1,
              unit_of_payment: 'месяц',
              price: 1500,
              money_type: {
                id: 1,
                types_of_use: 'Подписка',
                description: 'Ежемесячная оплата'
              }
            },
            {
              id: 2,
              unit_of_payment: 'запрос',
              price: 0.5,
              money_type: {
                id: 2,
                types_of_use: 'Pay-per-use',
                description: 'Оплата за использование'
              }
            }
          ]
        });
        
        setError(null);
      } catch (err) {
        console.error('Error fetching API details:', err);
        setError('Ошибка при загрузке данных об API');
      } finally {
        setLoading(false);
      }
    };
    
    if (id) {
      fetchApiDetails();
    }
  }, [id]);
  
  const handleAddToCart = (planId: number) => {
    if (apiDetails) {
      addToCart(apiDetails.id, planId);
    }
  };
  
  if (loading) {
    return (
      <div className="container mx-auto px-4 py-12 text-center">
        <p>Загрузка...</p>
      </div>
    );
  }
  
  if (error || !apiDetails) {
    return (
      <div className="container mx-auto px-4 py-12 text-center">
        <p className="text-red-500 mb-4">{error || 'API не найден'}</p>
        <Button asChild>
          <Link to="/apis">Вернуться к списку API</Link>
        </Button>
      </div>
    );
  }
  
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <Link to="/apis" className="text-blue-600 hover:underline">
          &larr; Вернуться к списку API
        </Link>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <div className="mb-6">
            <h1 className="text-3xl font-bold mb-2">{apiDetails.name}</h1>
            <div className="flex items-center gap-2 mb-4">
              <Badge>{apiDetails.type}</Badge>
              <Badge variant="outline">{apiDetails.protocol}</Badge>
              <Badge variant="secondary">v{apiDetails.version}</Badge>
              <div className="text-yellow-500 ml-2">
                {'★'.repeat(Math.floor(apiDetails.averageRating))}
                {'☆'.repeat(5 - Math.floor(apiDetails.averageRating))}
                <span className="text-gray-600 ml-1">({apiDetails.averageRating.toFixed(1)})</span>
              </div>
            </div>
            <p className="text-gray-600 mb-4">
              Разработчик: <span className="font-semibold">{apiDetails.creator.username}</span>
            </p>
          </div>
          
          <Tabs defaultValue="description">
            <TabsList className="mb-6">
              <TabsTrigger value="description">Описание</TabsTrigger>
              <TabsTrigger value="documentation">Документация</TabsTrigger>
              <TabsTrigger value="integration">Интеграция</TabsTrigger>
              <TabsTrigger value="examples">Примеры</TabsTrigger>
            </TabsList>
            
            <TabsContent value="description" className="p-4 bg-white rounded-lg shadow-sm">
              <h2 className="text-xl font-semibold mb-4">Описание API</h2>
              <p>{apiDetails.body || 'Описание отсутствует'}</p>
            </TabsContent>
            
            <TabsContent value="documentation" className="p-4 bg-white rounded-lg shadow-sm">
              <h2 className="text-xl font-semibold mb-4">Документация</h2>
              <p>{apiDetails.documentation || 'Документация отсутствует'}</p>
            </TabsContent>
            
            <TabsContent value="integration" className="p-4 bg-white rounded-lg shadow-sm">
              <h2 className="text-xl font-semibold mb-4">Руководство по интеграции</h2>
              <p>{apiDetails.integration_guide || 'Руководство отсутствует'}</p>
            </TabsContent>
            
            <TabsContent value="examples" className="p-4 bg-white rounded-lg shadow-sm">
              <h2 className="text-xl font-semibold mb-4">Примеры использования</h2>
              <p>{apiDetails.usage_examples || 'Примеры отсутствуют'}</p>
            </TabsContent>
          </Tabs>
        </div>
        
        <div className="lg:col-span-1">
          <h2 className="text-xl font-semibold mb-4">Тарифные планы</h2>
          
          <div className="space-y-4">
            {apiDetails.plans.map((plan) => (
              <Card key={plan.id} className="overflow-hidden">
                <div className="bg-blue-50 p-4 border-b">
                  <h3 className="font-semibold text-lg">{plan.money_type.types_of_use}</h3>
                  <p className="text-sm text-gray-600">{plan.money_type.description}</p>
                </div>
                <CardContent className="p-4">
                  <div className="flex justify-between items-center mb-4">
                    <div>
                      <p className="text-sm text-gray-600">Цена:</p>
                      <p className="text-xl font-bold">
                        {plan.price} ₽ / {plan.unit_of_payment}
                      </p>
                    </div>
                  </div>
                  <Button 
                    className="w-full" 
                    onClick={() => handleAddToCart(plan.id)}
                  >
                    Добавить в корзину
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
          
          <div className="mt-6 bg-white p-4 rounded-lg shadow-sm">
            <h3 className="font-semibold mb-2">Категории</h3>
            <div className="flex flex-wrap gap-2">
              {apiDetails.categories.map((category) => (
                <Badge key={category.id} variant="secondary">
                  <Link to={`/apis?category=${category.slug}`}>
                    {category.name}
                  </Link>
                </Badge>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}