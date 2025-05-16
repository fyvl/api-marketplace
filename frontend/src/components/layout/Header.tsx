import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAuth } from '@/context/AuthContext';
import { useCart } from '@/context/CartContext';
import { ShoppingCart, Search, X } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import logoImage from '@/assets/logo.png';
import api from '@/api/client';

// Определяем тип для результатов поиска API
interface ApiSearchResult {
  id: number;
  name: string;
  type: string;
  version: string;
  averageRating?: number;
  lowestPrice?: number;
}

export default function Header() {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<ApiSearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);
  const { user, logout } = useAuth();
  const { items } = useCart();
  const navigate = useNavigate();

  const cartItemsCount = items.length;

  // Обработчик клика вне компонента поиска для скрытия результатов
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowResults(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Функция для выполнения поиска
  const performSearch = async (query: string) => {
    if (!query.trim()) {
      setSearchResults([]);
      setShowResults(false);
      return;
    }

    try {
      setLoading(true);
      // Выполняем запрос поиска к API
      const response = await api.get(`/apis?search=${encodeURIComponent(query.trim())}`);
      // Ограничиваем результаты до первых 5 для выпадающего списка
      setSearchResults(response.data.data.slice(0, 5));
      setShowResults(true);
    } catch (error) {
      console.error('Error searching APIs:', error);
      setSearchResults([]);
    } finally {
      setLoading(false);
    }
  };

  // Используем debounce для предотвращения слишком частых запросов при вводе
  useEffect(() => {
    const debounceTimeout = setTimeout(() => {
      if (searchQuery) {
        performSearch(searchQuery);
      }
    }, 300);

    return () => clearTimeout(debounceTimeout);
  }, [searchQuery]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (searchQuery.trim()) {
      // Перенаправляем на страницу поиска при отправке формы
      navigate(`/apis?search=${encodeURIComponent(searchQuery.trim())}`);
      setShowResults(false);
    }
  };

  const handleApiClick = (apiId: number) => {
    navigate(`/apis/${apiId}`);
    setShowResults(false);
    setSearchQuery('');
  };

  const clearSearch = () => {
    setSearchQuery('');
    setSearchResults([]);
    setShowResults(false);
  };

  // Рендерим звездочки для рейтинга
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

  return (
    <header className="border-b">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        {/* Logo */}
        <Link to="/" className="hover:opacity-80 transition-opacity">
          <img 
            src={logoImage} 
            alt="HivePoint" 
            className="h-14 w-auto"
          />
        </Link>

        {/* Search Bar */}
        <div className="flex-1 max-w-xl mx-10 relative" ref={searchRef}>
          <form onSubmit={handleSearch}>
            <div className="relative">
              <Input
                type="search"
                placeholder="Поиск API продуктов..."
                className="w-full pr-20"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={() => {
                  if (searchResults.length > 0) {
                    setShowResults(true);
                  }
                }}
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={clearSearch}
                  className="absolute right-10 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
              <Button 
                type="submit" 
                variant="ghost" 
                className="absolute right-0 top-0 h-full cursor-pointer"
                disabled={!searchQuery.trim()}
              >
                <Search className="h-5 w-5" />
              </Button>
            </div>
          </form>

          {/* Выпадающий список с результатами поиска */}
          {showResults && (
            <div className="absolute mt-1 w-full bg-white rounded-md border shadow-lg z-50">
              {loading ? (
                <div className="p-4 text-center text-gray-500">Загрузка...</div>
              ) : searchResults.length > 0 ? (
                <div>
                  <div className="p-2">
                    {searchResults.map((api) => (
                      <div 
                        key={api.id}
                        className="p-2 hover:bg-gray-100 rounded-md cursor-pointer"
                        onClick={() => handleApiClick(api.id)}
                      >
                        <div className="flex justify-between items-start">
                          <div>
                            <div className="font-medium">{api.name}</div>
                            <div className="text-sm text-gray-500">{api.type} • v{api.version}</div>
                            {renderRating(api.averageRating!)}
                          </div>
                          {api.lowestPrice !== undefined && (
                            <div className="text-right text-sm">
                              <div className="text-gray-500">От</div>
                              <div className="font-semibold">{api.lowestPrice} ₽</div>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                  <div 
                    className="p-2 border-t text-center text-blue-600 hover:bg-gray-50 cursor-pointer"
                    onClick={() => {
                      navigate(`/apis?search=${encodeURIComponent(searchQuery.trim())}`);
                      setShowResults(false);
                    }}
                  >
                    Показать все результаты
                  </div>
                </div>
              ) : searchQuery.trim() ? (
                <div className="p-4 text-center text-gray-500">
                  Ничего не найдено
                </div>
              ) : null}
            </div>
          )}
        </div>

        {/* Navigation */}
        <nav className="flex items-center gap-4">
          <Link to="/apis">
            <Button variant="ghost" className="cursor-pointer">Каталог API</Button>
          </Link>
          
          {/* Shopping Cart Icon with Count */}
          <Link to="/cart" className="relative">
            <Button variant="ghost" className="relative cursor-pointer">
              <ShoppingCart className="h-5 w-5" />
              {cartItemsCount > 0 && (
                <Badge 
                  className="absolute -top-2 -right-2 bg-blue-500 text-white h-5 w-5 flex items-center justify-center p-0 rounded-full text-xs"
                >
                  {cartItemsCount}
                </Badge>
              )}
            </Button>
          </Link>
          
          {user ? (
            <div className="flex items-center gap-2">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="flex items-center gap-2 cursor-pointer">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={`https://ui-avatars.com/api/?name=${user.username}`} />
                      <AvatarFallback>{user.username.substring(0, 2).toUpperCase()}</AvatarFallback>
                    </Avatar>
                    <span className="hidden md:inline">{user.username}</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem asChild>
                    <Link to="/profile" className="w-full">Мой профиль</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link to="/dashboard" className="w-full">Личный кабинет</Link>
                  </DropdownMenuItem>
                  {user.role === 'developer' && (
                    <DropdownMenuItem asChild>
                      <Link to="/developer/apis" className="w-full">Мои API</Link>
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuItem asChild>
                    <Link to="/purchases" className="w-full">Мои покупки</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link to="/cart" className="w-full">Корзина</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={logout}>
                    Выйти
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu> 
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link to="/login">
                <Button variant="outline" className='cursor-pointer'>Вход</Button>
              </Link>
              <Link to="/register">
                <Button className='cursor-pointer'>Регистрация</Button>
              </Link>
            </div>
          )}
        </nav>
      </div>
    </header>
  );
}