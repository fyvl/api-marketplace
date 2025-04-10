import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from '@/components/ui/input';

// Заглушка для типа API разработчика
interface DeveloperApi {
  id: number;
  name: string;
  type: string;
  protocol: string;
  version: string;
  status: 'active' | 'draft' | 'disabled';
  customers: number;
  revenue: number;
  created_at: string;
  last_updated: string;
}

export default function DeveloperApisPage() {
  const { user } = useAuth();
  const [apis, setApis] = useState<DeveloperApi[]>([]);
  const [filteredApis, setFilteredApis] = useState<DeveloperApi[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  useEffect(() => {
    const fetchDeveloperApis = async () => {
      setLoading(true);
      
      // Имитация получения данных с сервера
      setTimeout(() => {
        const mockApis: DeveloperApi[] = [
          {
            id: 1,
            name: 'Обработка текста API',
            type: 'REST',
            protocol: 'HTTPS',
            version: '1.2',
            status: 'active',
            customers: 45,
            revenue: 67500,
            created_at: '2023-05-15',
            last_updated: '2023-10-01'
          },
          {
            id: 2,
            name: 'Генерация изображений API',
            type: 'REST',
            protocol: 'HTTPS',
            version: '2.0',
            status: 'active',
            customers: 78,
            revenue: 156000,
            created_at: '2023-03-20',
            last_updated: '2023-09-15'
          },
          {
            id: 3,
            name: 'Синтез речи API',
            type: 'WebSocket',
            protocol: 'WS',
            version: '1.0',
            status: 'draft',
            customers: 0,
            revenue: 0,
            created_at: '2023-10-02',
            last_updated: '2023-10-10'
          },
          {
            id: 4,
            name: 'Распознавание лиц API',
            type: 'REST',
            protocol: 'HTTPS',
            version: '0.5',
            status: 'draft',
            customers: 0,
            revenue: 0,
            created_at: '2023-09-25',
            last_updated: '2023-09-25'
          },
          {
            id: 5,
            name: 'Перевод текста API',
            type: 'REST',
            protocol: 'HTTPS',
            version: '1.1',
            status: 'disabled',
            customers: 12,
            revenue: 15000,
            created_at: '2023-01-10',
            last_updated: '2023-08-05'
          }
        ];
        
        setApis(mockApis);
        setFilteredApis(mockApis);
        setLoading(false);
      }, 1000);
    };
    
    fetchDeveloperApis();
  }, []);
  
  // Применение фильтров при их изменении
  useEffect(() => {
    let result = [...apis];
    
    // Фильтр по статусу
    if (statusFilter !== 'all') {
      result = result.filter(api => api.status === statusFilter);
    }
    
    // Фильтр по поиску
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(api => 
        api.name.toLowerCase().includes(query) || 
        api.version.toLowerCase().includes(query)
      );
    }
    
    setFilteredApis(result);
  }, [statusFilter, searchQuery, apis]);
  
  if (!user) {
    return (
      <div className="container mx-auto px-4 py-12 text-center">
        <h1 className="text-3xl font-bold mb-4">Доступ запрещен</h1>
        <p className="mb-6">Для доступа к этой странице необходимо авторизоваться</p>
        <Button asChild>
          <Link to="/login">Войти</Link>
        </Button>
      </div>
    );
  }
  
  if (user.role !== 'developer') {
    return (
      <div className="container mx-auto px-4 py-12 text-center">
        <h1 className="text-3xl font-bold mb-4">Доступ запрещен</h1>
        <p className="mb-6">Эта страница доступна только для разработчиков API</p>
        <Button asChild>
          <Link to="/dashboard">Перейти в личный кабинет</Link>
        </Button>
      </div>
    );
  }
  
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold mb-2">Мои API</h1>
          <p className="text-gray-600">Управление вашими API продуктами</p>
        </div>
        <div className="mt-4 md:mt-0">
          <Button asChild>
            <Link to="/developer/create-api">
              Добавить новый API
            </Link>
          </Button>
        </div>
      </div>
      
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Статистика</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div>
              <p className="text-sm text-gray-500">Всего API</p>
              <p className="text-3xl font-bold">{apis.length}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Активные</p>
              <p className="text-3xl font-bold">
                {apis.filter(api => api.status === 'active').length}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Клиенты</p>
              <p className="text-3xl font-bold">
                {apis.reduce((sum, api) => sum + api.customers, 0)}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Общий доход</p>
              <p className="text-3xl font-bold">
                {apis.reduce((sum, api) => sum + api.revenue, 0)} ₽
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
      
      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div className="w-full md:w-1/3">
          <Input
            placeholder="Поиск по имени API"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="w-full md:w-1/3">
          <Select
            value={statusFilter}
            onValueChange={setStatusFilter}
          >
            <SelectTrigger>
              <SelectValue placeholder="Фильтр по статусу" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Все статусы</SelectItem>
              <SelectItem value="active">Активные</SelectItem>
              <SelectItem value="draft">Черновики</SelectItem>
              <SelectItem value="disabled">Отключенные</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      
      {loading ? (
        <div className="text-center py-12">
          <p>Загрузка...</p>
        </div>
      ) : filteredApis.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg shadow">
          <p className="mb-4">
            {apis.length === 0 
              ? 'У вас пока нет созданных API' 
              : 'Нет API, соответствующих заданным фильтрам'}
          </p>
          <Button asChild>
            <Link to="/developer/create-api">Создать API</Link>
          </Button>
        </div>
      ) : (
        <div className="overflow-hidden rounded-lg border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Название API</TableHead>
                <TableHead>Версия</TableHead>
                <TableHead>Тип</TableHead>
                <TableHead>Статус</TableHead>
                <TableHead>Клиенты</TableHead>
                <TableHead>Доход</TableHead>
                <TableHead>Обновлено</TableHead>
                <TableHead className="text-right">Действия</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredApis.map((api) => (
                <TableRow key={api.id}>
                  <TableCell className="font-medium">
                    <Link 
                      to={`/developer/apis/${api.id}`}
                      className="hover:text-blue-600"
                    >
                      {api.name}
                    </Link>
                  </TableCell>
                  <TableCell>{api.version}</TableCell>
                  <TableCell>
                    <Badge variant="outline">{api.type}</Badge>
                  </TableCell>
                  <TableCell>
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
                  </TableCell>
                  <TableCell>{api.customers}</TableCell>
                  <TableCell>{api.revenue} ₽</TableCell>
                  <TableCell>{new Date(api.last_updated).toLocaleDateString()}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end space-x-2">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        asChild
                      >
                        <Link to={`/developer/apis/${api.id}`}>
                          Управление
                        </Link>
                      </Button>
                      <Button
                        size="sm"
                        asChild
                      >
                        <Link to={`/developer/apis/${api.id}/analytics`}>
                          Аналитика
                        </Link>
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}