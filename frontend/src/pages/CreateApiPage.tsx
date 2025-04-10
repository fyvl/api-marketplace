import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { 
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger
} from "@/components/ui/tabs";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

// Тип модели монетизации
interface MonetizationModel {
  id: string;
  type: string;
  unit: string;
  price: number;
  description: string;
}

export default function CreateApiPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [loading, setLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState('basic');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Состояние формы
  const [formData, setFormData] = useState({
    name: '',
    type: 'REST',
    protocol: 'HTTPS',
    version: '1.0',
    description: '',
    documentation: '',
    integration_guide: '',
    usage_examples: '',
    categories: [] as string[],
    monetization_models: [] as MonetizationModel[],
    endpoint_url: '',
    authentication_method: 'api_key',
    terms_agreed: false,
    service_level: 'standard',
    publish_immediately: false
  });
  
  // Категории API (заглушка)
  const availableCategories = [
    { id: '1', name: 'Аналитика' },
    { id: '2', name: 'Данные' },
    { id: '3', name: 'Финансы' },
    { id: '4', name: 'Общение' },
    { id: '5', name: 'Искусственный интеллект' },
    { id: '6', name: 'Геолокация' },
    { id: '7', name: 'Медиа' },
    { id: '8', name: 'Платежи' }
  ];
  
  // Доступные типы API
  const apiTypes = ['REST', 'SOAP', 'GraphQL', 'WebSocket', 'gRPC'];
  
  // Доступные протоколы
  const apiProtocols = ['HTTPS', 'HTTP', 'WS', 'WSS', 'XMPP'];

  // Методы аутентификации
  const authMethods = [
    { value: 'api_key', label: 'API ключ' },
    { value: 'oauth2', label: 'OAuth 2.0' },
    { value: 'jwt', label: 'JWT' },
    { value: 'basic', label: 'Basic Auth' },
    { value: 'none', label: 'Без аутентификации' }
  ];

  // Уровни сервиса
  const serviceLevels = [
    { value: 'basic', label: 'Базовый (99.5% доступность)', price: 0 },
    { value: 'standard', label: 'Стандартный (99.9% доступность)', price: 5000 },
    { value: 'premium', label: 'Премиум (99.99% доступность)', price: 15000 }
  ];
  
  // Обработка изменения полей формы
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  // Обработка выбора типа API
  const handleTypeChange = (value: string) => {
    setFormData(prev => ({
      ...prev,
      type: value
    }));
  };
  
  // Обработка выбора протокола
  const handleProtocolChange = (value: string) => {
    setFormData(prev => ({
      ...prev,
      protocol: value
    }));
  };

  // Обработка выбора метода аутентификации
  const handleAuthMethodChange = (value: string) => {
    setFormData(prev => ({
      ...prev,
      authentication_method: value
    }));
  };

  // Обработка выбора уровня сервиса
  const handleServiceLevelChange = (value: string) => {
    setFormData(prev => ({
      ...prev,
      service_level: value
    }));
  };

  // Обработка чекбокса публикации
  const handlePublishChange = (checked: boolean) => {
    setFormData(prev => ({
      ...prev,
      publish_immediately: checked
    }));
  };

  // Обработка чекбокса условий
  const handleTermsChange = (checked: boolean) => {
    setFormData(prev => ({
      ...prev,
      terms_agreed: checked
    }));
  };
  
  // Обработка выбора категорий
  const handleCategoryChange = (categoryId: string) => {
    setFormData(prev => {
      const categories = [...prev.categories];
      const index = categories.indexOf(categoryId);
      
      if (index === -1) {
        categories.push(categoryId);
      } else {
        categories.splice(index, 1);
      }
      
      return {
        ...prev,
        categories
      };
    });
  };
  
  // Добавление модели монетизации
  const addMonetizationModel = () => {
    const newModel: MonetizationModel = {
      id: Date.now().toString(),
      type: 'subscription',
      unit: 'month',
      price: 0,
      description: ''
    };
    
    setFormData(prev => ({
      ...prev,
      monetization_models: [...prev.monetization_models, newModel]
    }));
  };
  
  // Обновление модели монетизации
  const updateMonetizationModel = (id: string, field: string, value: string | number) => {
    setFormData(prev => {
      const models = prev.monetization_models.map(model => {
        if (model.id === id) {
          return {
            ...model,
            [field]: value
          };
        }
        return model;
      });
      
      return {
        ...prev,
        monetization_models: models
      };
    });
  };
  
  // Удаление модели монетизации
  const removeMonetizationModel = (id: string) => {
    setFormData(prev => ({
      ...prev,
      monetization_models: prev.monetization_models.filter(model => model.id !== id)
    }));
  };

  // Переход на следующий шаг
  const handleNextStep = () => {
    if (currentStep === 'basic') {
      setCurrentStep('documentation');
    } else if (currentStep === 'documentation') {
      setCurrentStep('monetization');
    } else if (currentStep === 'monetization') {
      setCurrentStep('settings');
    }
  };

  // Переход на предыдущий шаг
  const handlePrevStep = () => {
    if (currentStep === 'documentation') {
      setCurrentStep('basic');
    } else if (currentStep === 'monetization') {
      setCurrentStep('documentation');
    } else if (currentStep === 'settings') {
      setCurrentStep('monetization');
    }
  };
  
  // Отправка формы
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Валидация
    if (!formData.name || !formData.version) {
      alert('Заполните обязательные поля');
      return;
    }

    if (!formData.terms_agreed) {
      alert('Необходимо принять условия использования');
      return;
    }
    
    setIsSubmitting(true);
    
    // Имитация отправки на сервер
    setTimeout(() => {
      setIsSubmitting(false);
      // Перенаправление на страницу созданного API
      navigate('/developer/apis/1');
    }, 1500);
  };
  
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
      <div className="mb-6">
        <Link to="/developer/apis" className="text-blue-600 hover:underline">
          &larr; Вернуться к списку API
        </Link>
      </div>
      
      <h1 className="text-3xl font-bold mb-2">Создание нового API</h1>
      <p className="text-gray-600 mb-8">Заполните информацию о вашем API продукте</p>
      
      <form onSubmit={handleSubmit}>
        <Tabs defaultValue="basic" value={currentStep} onValueChange={setCurrentStep}>
          <div className="flex justify-between items-center mb-6">
            <TabsList>
              <TabsTrigger value="basic">1. Основная информация</TabsTrigger>
              <TabsTrigger value="documentation">2. Документация</TabsTrigger>
              <TabsTrigger value="monetization">3. Монетизация</TabsTrigger>
              <TabsTrigger value="settings">4. Настройки</TabsTrigger>
            </TabsList>
          </div>
          
          {/* Основная информация */}
          <TabsContent value="basic">
            <Card>
              <CardHeader>
                <CardTitle>Основная информация</CardTitle>
                <CardDescription>
                  Заполните общую информацию об API
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="name" className="text-base">Название API*</Label>
                  <Input
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="Например: Аналитика данных API"
                    required
                  />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="type" className="text-base">Тип API</Label>
                    <Select
                      value={formData.type}
                      onValueChange={handleTypeChange}
                    >
                      <SelectTrigger id="type">
                        <SelectValue placeholder="Выберите тип" />
                      </SelectTrigger>
                      <SelectContent>
                        {apiTypes.map(type => (
                          <SelectItem key={type} value={type}>
                            {type}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="protocol" className="text-base">Протокол</Label>
                    <Select
                      value={formData.protocol}
                      onValueChange={handleProtocolChange}
                    >
                      <SelectTrigger id="protocol">
                        <SelectValue placeholder="Выберите протокол" />
                      </SelectTrigger>
                      <SelectContent>
                        {apiProtocols.map(protocol => (
                          <SelectItem key={protocol} value={protocol}>
                            {protocol}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="version" className="text-base">Версия*</Label>
                    <Input
                      id="version"
                      name="version"
                      value={formData.version}
                      onChange={handleChange}
                      placeholder="Например: 1.0"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="endpoint_url" className="text-base">URL конечной точки API</Label>
                  <Input
                    id="endpoint_url"
                    name="endpoint_url"
                    value={formData.endpoint_url}
                    onChange={handleChange}
                    placeholder="https://api.example.com/v1"
                  />
                  <p className="text-sm text-gray-500">
                    Базовый URL вашего API, который будут использовать клиенты
                  </p>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="description" className="text-base">Описание</Label>
                  <Textarea
                    id="description"
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    placeholder="Подробное описание возможностей и применения API"
                    rows={6}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label className="text-base">Категории</Label>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                    {availableCategories.map(category => (
                      <div key={category.id} className="flex items-center space-x-2">
                        <Checkbox
                          id={`category-${category.id}`}
                          checked={formData.categories.includes(category.id)}
                          onCheckedChange={(checked) => {
                            if (checked !== 'indeterminate') {
                              handleCategoryChange(category.id);
                            }
                          }}
                        />
                        <label 
                          htmlFor={`category-${category.id}`}
                          className="text-sm"
                        >
                          {category.name}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
              <CardFooter className="flex justify-end">
                <Button type="button" onClick={handleNextStep}>
                  Далее
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>
          
          {/* Документация */}
          <TabsContent value="documentation">
            <Card>
              <CardHeader>
                <CardTitle>Документация и инструкции</CardTitle>
                <CardDescription>
                  Добавьте подробную документацию и примеры для вашего API
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="documentation" className="text-base">Документация API</Label>
                  <Textarea
                    id="documentation"
                    name="documentation"
                    value={formData.documentation}
                    onChange={handleChange}
                    placeholder="Подробная документация API: эндпоинты, параметры запросов, структура ответов и т.д."
                    rows={8}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="integration_guide" className="text-base">Руководство по интеграции</Label>
                  <Textarea
                    id="integration_guide"
                    name="integration_guide"
                    value={formData.integration_guide}
                    onChange={handleChange}
                    placeholder="Пошаговое руководство по интеграции API в приложения"
                    rows={6}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="usage_examples" className="text-base">Примеры использования</Label>
                  <Textarea
                    id="usage_examples"
                    name="usage_examples"
                    value={formData.usage_examples}
                    onChange={handleChange}
                    placeholder="Примеры кода на различных языках программирования"
                    rows={6}
                  />
                </div>
              </CardContent>
              <CardFooter className="flex justify-between">
                <Button type="button" variant="outline" onClick={handlePrevStep}>
                  Назад
                </Button>
                <Button type="button" onClick={handleNextStep}>
                  Далее
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>
          
          {/* Монетизация */}
          <TabsContent value="monetization">
            <Card>
              <CardHeader>
                <CardTitle>Модели монетизации</CardTitle>
                <CardDescription>
                  Настройте варианты оплаты для вашего API
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex justify-end">
                  <Button 
                    type="button" 
                    onClick={addMonetizationModel}
                  >
                    Добавить тариф
                  </Button>
                </div>
                
                {formData.monetization_models.length === 0 ? (
                  <div className="text-center py-12 border rounded-lg">
                    <p className="text-gray-500 mb-4">У вас пока нет добавленных тарифов</p>
                    <p className="text-sm text-gray-500">
                      Нажмите "Добавить тариф", чтобы настроить модель монетизации
                    </p>
                  </div>
                ) : (
                  <Accordion type="multiple" className="space-y-4">
                    {formData.monetization_models.map((model) => (
                      <AccordionItem key={model.id} value={model.id} className="border rounded-lg">
                        <AccordionTrigger className="px-4">
                          <div className="flex items-center gap-3">
                            <span className="font-semibold">
                              {model.type === 'subscription' 
                                ? 'Подписка' 
                                : model.type === 'pay-per-use' 
                                ? 'Оплата за использование' 
                                : 'Разовая покупка'}
                            </span>
                            <span className="text-gray-500">
                              {model.price} ₽ / {model.unit}
                            </span>
                          </div>
                        </AccordionTrigger>
                        <AccordionContent className="px-4 pb-4">
                          <div className="space-y-4">
                            <div className="space-y-2">
                              <Label>Тип тарифа</Label>
                              <Select
                                value={model.type}
                                onValueChange={(value) => 
                                  updateMonetizationModel(model.id, 'type', value)
                                }
                              >
                                <SelectTrigger>
                                  <SelectValue placeholder="Выберите тип тарифа" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="subscription">Подписка</SelectItem>
                                  <SelectItem value="pay-per-use">Оплата за использование</SelectItem>
                                  <SelectItem value="one-time">Разовая покупка</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                            
                            <div className="space-y-2">
                              <Label>Единица измерения</Label>
                              <Select
                                value={model.unit}
                                onValueChange={(value) => 
                                  updateMonetizationModel(model.id, 'unit', value)
                                }
                              >
                                <SelectTrigger>
                                  <SelectValue placeholder="Выберите единицу измерения" />
                                </SelectTrigger>
                                <SelectContent>
                                  {model.type === 'subscription' ? (
                                    <>
                                      <SelectItem value="month">Месяц</SelectItem>
                                      <SelectItem value="year">Год</SelectItem>
                                    </>
                                  ) : model.type === 'pay-per-use' ? (
                                    <>
                                      <SelectItem value="request">Запрос</SelectItem>
                                      <SelectItem value="thousand">1000 запросов</SelectItem>
                                      <SelectItem value="mb">Мегабайт</SelectItem>
                                    </>
                                  ) : (
                                    <>
                                      <SelectItem value="license">Лицензия</SelectItem>
                                      <SelectItem value="installation">Установка</SelectItem>
                                    </>
                                  )}
                                </SelectContent>
                              </Select>
                            </div>
                            
                            <div className="space-y-2">
                              <Label>Цена (₽)</Label>
                              <Input
                                type="number"
                                min="0"
                                step="0.01"
                                value={model.price}
                                onChange={(e) => 
                                  updateMonetizationModel(
                                    model.id, 
                                    'price', 
                                    parseFloat(e.target.value) || 0
                                  )
                                }
                              />
                            </div>
                            
                            <div className="space-y-2">
                              <Label>Описание тарифа</Label>
                              <Textarea
                                value={model.description}
                                onChange={(e) => 
                                  updateMonetizationModel(model.id, 'description', e.target.value)
                                }
                                placeholder="Описание тарифа для клиентов"
                                rows={3}
                              />
                            </div>
                            
                            <div className="flex justify-end">
                              <Button
                                variant="destructive"
                                type="button"
                                onClick={() => removeMonetizationModel(model.id)}
                              >
                                Удалить тариф
                              </Button>
                            </div>
                          </div>
                        </AccordionContent>
                      </AccordionItem>
                    ))}
                  </Accordion>
                )}
              </CardContent>
              <CardFooter className="flex justify-between">
                <Button type="button" variant="outline" onClick={handlePrevStep}>
                  Назад
                </Button>
                <Button type="button" onClick={handleNextStep}>
                  Далее
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>

          {/* Настройки */}
          <TabsContent value="settings">
            <Card>
              <CardHeader>
                <CardTitle>Настройки API</CardTitle>
                <CardDescription>
                  Дополнительные настройки и параметры публикации
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="authentication_method" className="text-base">Метод аутентификации</Label>
                  <Select
                    value={formData.authentication_method}
                    onValueChange={handleAuthMethodChange}
                  >
                    <SelectTrigger id="authentication_method">
                      <SelectValue placeholder="Выберите метод аутентификации" />
                    </SelectTrigger>
                    <SelectContent>
                      {authMethods.map(method => (
                        <SelectItem key={method.value} value={method.value}>
                          {method.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <p className="text-sm text-gray-500">
                    Метод аутентификации, который будут использовать клиенты
                  </p>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="service_level" className="text-base">Уровень обслуживания</Label>
                  <Select
                    value={formData.service_level}
                    onValueChange={handleServiceLevelChange}
                  >
                    <SelectTrigger id="service_level">
                      <SelectValue placeholder="Выберите уровень обслуживания" />
                    </SelectTrigger>
                    <SelectContent>
                      {serviceLevels.map(level => (
                        <SelectItem key={level.value} value={level.value}>
                          {level.label} {level.price > 0 ? `(+${level.price} ₽/месяц)` : '(бесплатно)'}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <p className="text-sm text-gray-500">
                    Уровень обслуживания определяет гарантированную доступность API и приоритет поддержки
                  </p>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="publish_immediately"
                      checked={formData.publish_immediately}
                      onCheckedChange={(checked) => {
                        if (checked !== 'indeterminate') {
                          handlePublishChange(checked);
                        }
                      }}
                    />
                    <Label htmlFor="publish_immediately" className="text-base">
                      Опубликовать API сразу после создания
                    </Label>
                  </div>
                  <p className="text-sm text-gray-500 pl-6">
                    Если не отмечено, API будет сохранен как черновик
                  </p>
                </div>

                <Alert className="bg-blue-50 border-blue-200">
                  <AlertTitle>Обзор публикации</AlertTitle>
                  <AlertDescription>
                    <div className="mt-2 space-y-2">
                      <p>Вы создаете API продукт со следующими параметрами:</p>
                      <ul className="list-disc list-inside space-y-1 pl-4">
                        <li>Название: <span className="font-medium">{formData.name || 'Не указано'}</span></li>
                        <li>Тип: <span className="font-medium">{formData.type}</span></li>
                        <li>Версия: <span className="font-medium">{formData.version}</span></li>
                        <li>Тарифов: <span className="font-medium">{formData.monetization_models.length}</span></li>
                        <li>Статус: <span className="font-medium">{formData.publish_immediately ? 'Будет опубликован' : 'Будет сохранен как черновик'}</span></li>
                      </ul>
                    </div>
                  </AlertDescription>
                </Alert>

                <div className="pt-4 border-t">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="terms_agreed"
                      checked={formData.terms_agreed}
                      onCheckedChange={(checked) => {
                        if (checked !== 'indeterminate') {
                          handleTermsChange(checked);
                        }
                      }}
                      required
                    />
                    <Label htmlFor="terms_agreed" className="text-base">
                      Я согласен с <Link to="/terms" className="text-blue-600 hover:underline">условиями использования</Link> и <Link to="/policy" className="text-blue-600 hover:underline">политикой конфиденциальности</Link>
                    </Label>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="flex justify-between">
                <Button type="button" variant="outline" onClick={handlePrevStep}>
                  Назад
                </Button>
                <Button 
                  type="submit" 
                  disabled={isSubmitting || !formData.terms_agreed}
                >
                  {isSubmitting ? 'Создание...' : 'Создать API'}
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>
        </Tabs>
      </form>
    </div>
  );
}