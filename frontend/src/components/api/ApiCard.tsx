import { Link } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

// Тип для API продукта
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

interface ApiCardProps {
  api: ApiProduct;
  onAddToCart?: (apiId: number) => void;
}

export function ApiCard({ api, onAddToCart }: ApiCardProps) {
  // Функция для отображения рейтинга в виде звездочек
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const renderRating = (rating: any) => {
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

  // Обрезаем описание если оно слишком длинное
  const description = api.body 
    ? api.body.length > 100 
      ? `${api.body.substring(0, 100)}...` 
      : api.body
    : 'Описание отсутствует';

  return (
    <Card className="w-full h-full flex flex-col">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="text-xl hover:text-blue-600">
              <Link to={`/apis/${api.id}`}>{api.name}</Link>
            </CardTitle>
            <CardDescription className="mt-1">
              Версия: {api.version}
            </CardDescription>
          </div>
          <Badge variant="outline">{api.type}</Badge>
        </div>
      </CardHeader>
      
      <CardContent className="flex-grow">
        <p className="text-sm text-gray-600 mb-4">{description}</p>
        
        <div className="flex flex-wrap gap-1 mb-4">
          <Badge variant="secondary">{api.protocol}</Badge>
          {api.categories.map(category => (
            <Badge key={category.id} variant="secondary">
              {category.name}
            </Badge>
          ))}
        </div>
        
        <div className="flex items-center justify-between mt-auto">
          <div>
            {renderRating(api.averageRating)}
          </div>
          {api.lowestPrice !== undefined && (
            <div className="text-right">
              <p className="text-sm text-gray-600">От</p>
              <p className="font-semibold">{api.lowestPrice} ₽</p>
            </div>
          )}
        </div>
      </CardContent>
      
      <CardFooter className="pt-0 gap-2">
        <Button variant="outline" asChild className="flex-1">
          <Link to={`/apis/${api.id}`}>Подробнее</Link>
        </Button>
        {onAddToCart && (
          <Button 
            className="flex-1" 
            onClick={() => onAddToCart(api.id)}
          >
            В корзину
          </Button>
        )}
      </CardFooter>
    </Card>
  );
}