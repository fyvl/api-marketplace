import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import api from '@/api/client';
import { ApiCard } from '@/components/api/ApiCard';
import { useCart } from '@/context/CartContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Slider } from '@/components/ui/slider';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

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

interface ApiCategory {
  id: number;
  name: string;
  slug: string;
}

interface ApiType {
  value: string;
  label: string;
}

export default function ApiListPage() {
  const [apis, setApis] = useState<ApiProduct[]>([]);
  const [categories, setCategories] = useState<ApiCategory[]>([]);
  const [types, setTypes] = useState<ApiType[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchParams, setSearchParams] = useSearchParams();
  const { addToCart } = useCart();
  
  // Фильтры
  const [search, setSearch] = useState(searchParams.get('search') || '');
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedType, setSelectedType] = useState<string>('');
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 10000]);
  const [minRating, setMinRating] = useState<number>(0);
  
  // Загрузка API
  useEffect(() => {
    const fetchApis = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Строим параметры запроса из фильтров
        const params = new URLSearchParams();
        if (search) params.append('search', search);
        if (selectedType && selectedType !== 'all') {
          params.append('type', selectedType);
        }
        if (selectedCategories.length) {
          selectedCategories.forEach(cat => params.append('categories[]', cat));
        }
        params.append('price_min', priceRange[0].toString());
        params.append('price_max', priceRange[1].toString());
        params.append('min_rating', minRating.toString());
        
        const response = await api.get(`/apis?${params.toString()}`);
        setApis(response.data.data);
      } catch (err) {
        console.error('Error fetching APIs:', err);
        setError('Ошибка при загрузке данных. Пожалуйста, попробуйте позже.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchApis();
  }, [search, selectedCategories, selectedType, priceRange, minRating]);
  
  // Загрузка категорий и типов для фильтров
  useEffect(() => {
    const fetchFilters = async () => {
      try {
        // Загружаем категории
        const categoriesResponse = await api.get('/categories');
        setCategories(categoriesResponse.data);
        
        // Загружаем типы API
        const typesResponse = await api.get('/api-types');
        setTypes(typesResponse.data);
      } catch (err) {
        console.error('Error fetching filters:', err);
      }
    };
    
    fetchFilters();
  }, []);
  
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Обновляем URL параметры
    const params = new URLSearchParams(searchParams);
    if (search) {
      params.set('search', search);
    } else {
      params.delete('search');
    }
    setSearchParams(params);
  };
  
  const handleCategoryChange = (category: string, checked: boolean) => {
    if (checked) {
      setSelectedCategories([...selectedCategories, category]);
    } else {
      setSelectedCategories(selectedCategories.filter(c => c !== category));
    }
  };
  
  const handleAddToCart = (apiId: number) => {
    addToCart(apiId);
  };
  
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Каталог API</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Фильтры */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <h2 className="text-lg font-semibold mb-4">Фильтры</h2>
            
            {/* Поиск */}
            <form onSubmit={handleSearch} className="mb-6">
              <Label htmlFor="search" className="mb-2 block">Поиск API</Label>
              <div className="flex">
                <Input
                  id="search"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Название или описание"
                  className="rounded-r-none"
                />
                <Button type="submit" className="rounded-l-none">
                  Найти
                </Button>
              </div>
            </form>
            
            {/* Категории */}
            <div className="mb-6">
              <Label className="mb-2 block">Категории</Label>
              <div className="space-y-2">
                {categories.map((category) => (
                  <div key={category.id} className="flex items-center">
                    <Checkbox
                      id={`category-${category.id}`}
                      checked={selectedCategories.includes(category.slug)}
                      onCheckedChange={(checked) => 
                        handleCategoryChange(category.slug, checked as boolean)
                      }
                    />
                    <label
                      htmlFor={`category-${category.id}`}
                      className="ml-2 text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                    >
                      {category.name}
                    </label>
                  </div>
                ))}
              </div>
            </div>
            
            {/* Тип API */}
            <div className="mb-6">
              <Label htmlFor="type" className="mb-2 block">Тип API</Label>
              <Select
                value={selectedType}
                onValueChange={setSelectedType}
              >
                <SelectTrigger id="type">
                  <SelectValue placeholder="Выберите тип" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Все типы</SelectItem>
                  {types.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            {/* Ценовой диапазон */}
            <div className="mb-6">
              <Label className="mb-2 block">Цена (₽)</Label>
              <Slider
                defaultValue={priceRange}
                min={0}
                max={10000}
                step={100}
                onValueChange={(value) => setPriceRange(value as [number, number])}
                className="my-4"
              />
              <div className="flex items-center justify-between">
                <span>{priceRange[0]} ₽</span>
                <span>{priceRange[1]} ₽</span>
              </div>
            </div>
            
            {/* Минимальный рейтинг */}
            <div>
              <Label className="mb-2 block">Минимальный рейтинг</Label>
              <div className="flex items-center">
                <Slider
                  defaultValue={[minRating]}
                  min={0}
                  max={5}
                  step={0.5}
                  onValueChange={(value) => setMinRating(value[0])}
                  className="flex-1 mr-4"
                />
                <span className="text-yellow-500 whitespace-nowrap">
                  {minRating} ★
                </span>
              </div>
            </div>
          </div>
        </div>
        
        {/* Список API */}
        <div className="lg:col-span-3">
          {loading ? (
            <div className="text-center py-12">
              <p>Загрузка...</p>
            </div>
          ) : error ? (
            <div className="text-center py-12 text-red-500">
              <p>{error}</p>
              <Button 
                variant="outline" 
                onClick={() => window.location.reload()}
                className="mt-4"
              >
                Повторить попытку
              </Button>
            </div>
          ) : apis.length === 0 ? (
            <div className="text-center py-12">
              <p>По вашему запросу ничего не найдено.</p>
              <p className="text-gray-500 mt-2">
                Попробуйте изменить параметры поиска или фильтры.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-6">
              {apis.map((api) => (
                <ApiCard 
                  key={api.id} 
                  api={api} 
                  onAddToCart={handleAddToCart}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}