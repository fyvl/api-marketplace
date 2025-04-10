import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '@/api/client';
import { useCart } from '@/context/CartContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';

// Интерфейс для данных API
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
  money_types?: Array<{
    id: number;
    unit_of_payment: string;
    price: number;
    body?: string;
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
        
        // Реальный запрос к API
        const response = await api.get(`/apis/${id}`);
        setApiDetails(response.data);
        
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

  const renderRating = (rating: number) => {
    const stars = [];
    // Преобразуем rating в число, если оно еще не число
    const numericRating = typeof rating === 'number' ? rating : parseFloat(rating) || 0;
    
    const fullStars = Math.floor(numericRating);
    const hasHalfStar = numericRating % 1 >= 0.5;
    
    for (let i = 0; i < fullStars; i++) {
      stars.push(<span key={`star-${i}`}>★</span>);
    }
    
    if (hasHalfStar) {
      stars.push(<span key="half-star">☆</span>);
    }
    
    const emptyStars = 5 - stars.length;
    for (let i = 0; i < emptyStars; i++) {
      stars.push(<span key={`empty-${i}`}>☆</span>);
    }
    
    return (
      <div className="flex text-yellow-500">
        {stars}
        <span className="ml-1 text-gray-600">({numericRating.toFixed(1)})</span>
      </div>
    );
  };

  const plans = apiDetails.money_types || [];
  
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
                {renderRating(apiDetails.averageRating!)}
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
              <div className="prose max-w-none">
                {apiDetails.documentation ? (
                  <div dangerouslySetInnerHTML={{ __html: marked(apiDetails.documentation) }} />
                ) : (
                  <p>Документация отсутствует</p>
                )}
              </div>
            </TabsContent>
            
            <TabsContent value="integration" className="p-4 bg-white rounded-lg shadow-sm">
              <h2 className="text-xl font-semibold mb-4">Руководство по интеграции</h2>
              <div className="prose max-w-none">
                {apiDetails.integration_guide ? (
                  <div dangerouslySetInnerHTML={{ __html: marked(apiDetails.integration_guide) }} />
                ) : (
                  <p>Руководство отсутствует</p>
                )}
              </div>
            </TabsContent>
            
            <TabsContent value="examples" className="p-4 bg-white rounded-lg shadow-sm">
              <h2 className="text-xl font-semibold mb-4">Примеры использования</h2>
              <div className="prose max-w-none">
                {apiDetails.usage_examples ? (
                  <div dangerouslySetInnerHTML={{ __html: marked(apiDetails.usage_examples) }} />
                ) : (
                  <p>Примеры отсутствуют</p>
                )}
              </div>
            </TabsContent>
          </Tabs>
        </div>
        
        <div className="lg:col-span-1">
          <h2 className="text-xl font-semibold mb-4">Тарифные планы</h2>
          
          {plans.length > 0 ? (
            <div className="space-y-4">
              {plans.map((plan) => (
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
                    {plan.body && (
                      <p className="text-sm text-gray-600 mb-4">{plan.body}</p>
                    )}
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
          ) : (
            <Card className="p-4 text-center text-gray-500">
              <p>Информация о тарифах отсутствует</p>
            </Card>
          )}
          
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

// Для отображения markdown в HTML
function marked(markdown: string): string {
  // Простая реализация конвертации markdown в HTML
  // В реальном приложении лучше использовать библиотеку вроде marked.js
  return markdown
    .replace(/\n/g, '<br>')
    .replace(/#{3} (.*?)\n/g, '<h3>$1</h3>')
    .replace(/#{2} (.*?)\n/g, '<h2>$1</h2>')
    .replace(/#{1} (.*?)\n/g, '<h1>$1</h1>')
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.*?)\*/g, '<em>$1</em>')
    .replace(/```(.*?)```/gs, '<pre><code>$1</code></pre>')
    .replace(/`(.*?)`/g, '<code>$1</code>');
}