<?php

namespace Database\Seeders;

use App\Models\Api;
use App\Models\ApiCategory;
use App\Models\ApiReview;
use App\Models\ApiTag;
use App\Models\CartItem;
use App\Models\Log;
use App\Models\MoneyType;
use App\Models\MoneyTypesForEachApi;
use App\Models\SalesReceipt;
use App\Models\SupportTicket;
use App\Models\SupportTicketReply;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // Создаем администратора
        $admin = User::create([
            'username' => 'admin',
            'email' => 'admin@example.com',
            'password' => Hash::make('password'),
            'role' => 'admin',
            'first_name' => 'Admin',
            'last_name' => 'User',
        ]);

        // Создаем разработчиков
        $developer1 = User::create([
            'username' => 'developer1',
            'email' => 'developer1@example.com',
            'password' => Hash::make('password'),
            'role' => 'developer',
            'first_name' => 'John',
            'last_name' => 'Developer',
            'phone' => '+7 (999) 123-45-67',
        ]);

        $developer2 = User::create([
            'username' => 'developer2',
            'email' => 'developer2@example.com',
            'password' => Hash::make('password'),
            'role' => 'developer',
            'first_name' => 'Jane',
            'last_name' => 'Developer',
            'phone' => '+7 (999) 456-78-90',
        ]);

        // Создаем покупателей
        $customer1 = User::create([
            'username' => 'customer1',
            'email' => 'customer1@example.com',
            'password' => Hash::make('password'),
            'role' => 'customer',
            'first_name' => 'Alice',
            'last_name' => 'Customer',
            'phone' => '+7 (999) 111-22-33',
        ]);

        $customer2 = User::create([
            'username' => 'customer2',
            'email' => 'customer2@example.com',
            'password' => Hash::make('password'),
            'role' => 'customer',
            'first_name' => 'Bob',
            'last_name' => 'Customer',
            'phone' => '+7 (999) 444-55-66',
        ]);

        $customer3 = User::create([
            'username' => 'customer3',
            'email' => 'customer3@example.com',
            'password' => Hash::make('password'),
            'role' => 'customer',
            'first_name' => 'Charlie',
            'last_name' => 'Brown',
            'phone' => '+7 (999) 777-88-99',
        ]);

        // Создаем категории API
        $categories = [
            ['name' => 'Аналитика', 'slug' => 'analytics', 'description' => 'API для аналитики данных и бизнес-процессов'],
            ['name' => 'Данные', 'slug' => 'data', 'description' => 'API для работы с данными и базами данных'],
            ['name' => 'Финансы', 'slug' => 'finance', 'description' => 'API для финансовых операций и банкинга'],
            ['name' => 'Общение', 'slug' => 'communication', 'description' => 'API для мессенджеров и коммуникаций'],
            ['name' => 'Искусственный интеллект', 'slug' => 'ai', 'description' => 'API для работы с искусственным интеллектом и машинным обучением'],
            ['name' => 'Геолокация', 'slug' => 'geolocation', 'description' => 'API для работы с картами и местоположением'],
            ['name' => 'Медиа', 'slug' => 'media', 'description' => 'API для работы с медиа-контентом (аудио, видео, изображения)'],
            ['name' => 'Платежи', 'slug' => 'payments', 'description' => 'API для обработки платежей и транзакций'],
            ['name' => 'Социальные сети', 'slug' => 'social', 'description' => 'API для интеграции с социальными сетями'],
            ['name' => 'Электронная коммерция', 'slug' => 'ecommerce', 'description' => 'API для электронной коммерции и маркетплейсов'],
            ['name' => 'Погода', 'slug' => 'weather', 'description' => 'API для получения данных о погоде'],
            ['name' => 'Переводы', 'slug' => 'translation', 'description' => 'API для перевода текстов и локализации'],
        ];

        foreach ($categories as $category) {
            ApiCategory::create($category);
        }

        // Создаем теги API
        $tags = [
            ['name' => 'REST', 'slug' => 'rest'],
            ['name' => 'JSON', 'slug' => 'json'],
            ['name' => 'Аналитика', 'slug' => 'analytics'],
            ['name' => 'Данные', 'slug' => 'data'],
            ['name' => 'Финансы', 'slug' => 'finance'],
            ['name' => 'AI', 'slug' => 'ai'],
            ['name' => 'ML', 'slug' => 'ml'],
            ['name' => 'Геолокация', 'slug' => 'geolocation'],
            ['name' => 'Облачный', 'slug' => 'cloud'],
            ['name' => 'Безопасность', 'slug' => 'security'],
            ['name' => 'Высокая производительность', 'slug' => 'high-performance'],
            ['name' => 'Бесплатный план', 'slug' => 'free-tier'],
            ['name' => 'Электронная коммерция', 'slug' => 'ecommerce'],
            ['name' => 'Платежи', 'slug' => 'payments'],
            ['name' => 'Обработка изображений', 'slug' => 'image-processing'],
        ];

        foreach ($tags as $tag) {
            ApiTag::create($tag);
        }

        // Создаем типы монетизации
        $moneyTypes = [
            ['types_of_use' => 'Подписка', 'description' => 'Регулярная оплата за доступ'],
            ['types_of_use' => 'Pay-per-use', 'description' => 'Оплата за каждое использование'],
            ['types_of_use' => 'Разовая покупка', 'description' => 'Единоразовая оплата'],
            ['types_of_use' => 'Freemium', 'description' => 'Базовый функционал бесплатно, расширенный - платно'],
        ];

        foreach ($moneyTypes as $type) {
            MoneyType::create($type);
        }

        // Создаем несколько API
        $apis = [
            [
                'name' => 'Аналитика данных API',
                'type' => 'REST',
                'protocol' => 'HTTPS',
                'version' => '1.0',
                'creator_id' => $developer1->id,
                'body' => 'Мощный API для аналитики данных, обработки и визуализации. Этот API позволяет загружать, анализировать и визуализировать большие объемы данных с использованием современных алгоритмов и методов машинного обучения.',
                'documentation' => '# Документация API аналитики данных

## Основные эндпоинты

### 1. Загрузка данных
`POST /api/v1/data/upload`

### 2. Анализ данных
`POST /api/v1/data/analyze`

### 3. Визуализация
`GET /api/v1/data/visualize`

## Примеры запросов и ответов

### Пример загрузки данных
```json
{
    "data": [
        {"x": 1, "y": 2},
        {"x": 2, "y": 4},
        {"x": 3, "y": 6}
    ],
    "type": "scatter"
}
```

## Ограничения
- Максимальный размер загружаемого файла: 100 МБ
- Максимальное количество точек данных: 100,000',
                'integration_guide' => '# Руководство по интеграции API аналитики данных

## Шаг 1: Получите API-ключ
Зарегистрируйтесь и получите API-ключ в личном кабинете.

## Шаг 2: Установите SDK
```bash
npm install data-analytics-api
# или
pip install data-analytics-api
```

## Шаг 3: Настройте аутентификацию
```javascript
const analytics = require("data-analytics-api");
analytics.configure({ apiKey: "YOUR_API_KEY" });
```

## Шаг 4: Используйте API
```javascript
const data = [...]; // Ваши данные
const result = await analytics.analyze(data);
console.log(result);
```',
                'usage_examples' => '# Примеры использования API аналитики данных

## JavaScript
```javascript
const analytics = require("data-analytics-api");
analytics.configure({ apiKey: "YOUR_API_KEY" });

// Загрузка данных
const data = [
    {x: 1, y: 2},
    {x: 2, y: 4},
    {x: 3, y: 6}
];

// Анализ данных
const result = await analytics.analyze(data);
console.log(result);

// Визуализация
const chart = await analytics.visualize(data, {
    type: "scatter",
    title: "My Chart"
});
```

## Python
```python
import data_analytics_api as analytics

analytics.configure(api_key="YOUR_API_KEY")

# Загрузка данных
data = [
    {"x": 1, "y": 2},
    {"x": 2, "y": 4},
    {"x": 3, "y": 6}
]

# Анализ данных
result = analytics.analyze(data)
print(result)

# Визуализация
chart = analytics.visualize(data, 
    type="scatter",
    title="My Chart"
)
```',
                'status' => 'active',
                'endpoint_url' => 'https://api.example.com/analytics/v1',
                'authentication_method' => 'api_key',
                'service_level' => 'standard',
                'categories' => [1, 2, 5],
                'tags' => [1, 2, 3, 4],
                'money_types' => [
                    [
                        'money_type_id' => 1, // Подписка
                        'unit_of_payment' => 'month',
                        'price' => 1500,
                        'body' => 'Месячная подписка с неограниченным количеством запросов',
                    ],
                    [
                        'money_type_id' => 2, // Pay-per-use
                        'unit_of_payment' => 'request',
                        'price' => 0.5,
                        'body' => 'Оплата за каждый запрос',
                    ],
                    [
                        'money_type_id' => 4, // Freemium
                        'unit_of_payment' => 'month',
                        'price' => 0,
                        'body' => 'Бесплатный тариф с ограничением в 1000 запросов в месяц',
                    ],
                ],
            ],
            [
                'name' => 'Геолокация API',
                'type' => 'REST',
                'protocol' => 'HTTPS',
                'version' => '2.0',
                'creator_id' => $developer1->id,
                'body' => 'API для работы с геолокацией и картами. Определение местоположения, расчет расстояний, построение маршрутов и отображение интерактивных карт.',
                'documentation' => '# Документация API геолокации

## Основные эндпоинты

### 1. Определение местоположения
`GET /api/v2/geo/locate`

### 2. Расчет расстояния
`GET /api/v2/geo/distance`

### 3. Построение маршрута
`GET /api/v2/geo/route`

### 4. Поиск мест
`GET /api/v2/geo/places`

## Примеры запросов и ответов

### Пример определения местоположения
```
GET /api/v2/geo/locate?ip=8.8.8.8
```

Ответ:
```json
{
    "ip": "8.8.8.8",
    "country": "United States",
    "region": "California",
    "city": "Mountain View",
    "lat": 37.4056,
    "lng": -122.0775,
    "timezone": "America/Los_Angeles"
}
```

## Ограничения
- Максимальное количество запросов в день: 10,000
- Максимальное количество точек в маршруте: 100',
                'status' => 'active',
                'endpoint_url' => 'https://api.example.com/geo/v2',
                'authentication_method' => 'api_key',
                'service_level' => 'premium',
                'categories' => [6],
                'tags' => [1, 2, 8],
                'money_types' => [
                    [
                        'money_type_id' => 1, // Подписка
                        'unit_of_payment' => 'month',
                        'price' => 2000,
                        'body' => 'Месячная подписка с ограничением 10000 запросов',
                    ],
                    [
                        'money_type_id' => 2, // Pay-per-use
                        'unit_of_payment' => 'request',
                        'price' => 0.2,
                        'body' => 'Оплата за каждый запрос',
                    ],
                ],
            ],
            [
                'name' => 'Финансовый API',
                'type' => 'REST',
                'protocol' => 'HTTPS',
                'version' => '1.5',
                'creator_id' => $developer2->id,
                'body' => 'API для работы с финансовыми данными и транзакциями. Получение курсов валют, обработка платежей, расчет кредитов и депозитов.',
                'documentation' => '# Документация финансового API

## Основные эндпоинты

### 1. Курсы валют
`GET /api/v1.5/finance/rates`

### 2. Обработка платежей
`POST /api/v1.5/finance/payment`

### 3. Расчет кредита
`GET /api/v1.5/finance/loan/calculate`

### 4. Расчет депозита
`GET /api/v1.5/finance/deposit/calculate`

## Примеры запросов и ответов

### Пример получения курсов валют
```
GET /api/v1.5/finance/rates?base=USD&symbols=EUR,GBP,RUB
```

Ответ:
```json
{
    "base": "USD",
    "date": "2023-10-15",
    "rates": {
        "EUR": 0.92,
        "GBP": 0.82,
        "RUB": 96.5
    }
}
```

## Ограничения
- Максимальное количество запросов в минуту: 100
- Максимальная сумма платежа: 1,000,000',
                'status' => 'active',
                'endpoint_url' => 'https://api.example.com/finance/v1.5',
                'authentication_method' => 'oauth2',
                'service_level' => 'standard',
                'categories' => [3, 8],
                'tags' => [1, 2, 5, 10],
                'money_types' => [
                    [
                        'money_type_id' => 1, // Подписка
                        'unit_of_payment' => 'month',
                        'price' => 5000,
                        'body' => 'Месячная подписка с неограниченным количеством запросов',
                    ],
                    [
                        'money_type_id' => 1, // Подписка
                        'unit_of_payment' => 'year',
                        'price' => 50000,
                        'body' => 'Годовая подписка с неограниченным количеством запросов и скидкой 16%',
                    ],
                ],
            ],
            [
                'name' => 'Распознавание текста API',
                'type' => 'REST',
                'protocol' => 'HTTPS',
                'version' => '3.1',
                'creator_id' => $developer2->id,
                'body' => 'API для распознавания текста на изображениях (OCR). Поддерживает различные языки и форматы изображений.',
                'status' => 'active',
                'endpoint_url' => 'https://api.example.com/ocr/v3.1',
                'authentication_method' => 'api_key',
                'service_level' => 'standard',
                'categories' => [5, 7],
                'tags' => [1, 6, 15],
                'money_types' => [
                    [
                        'money_type_id' => 2, // Pay-per-use
                        'unit_of_payment' => 'request',
                        'price' => 0.1,
                        'body' => 'Оплата за каждое распознанное изображение',
                    ],
                ],
            ],
            [
                'name' => 'Погодный API',
                'type' => 'REST',
                'protocol' => 'HTTPS',
                'version' => '2.0',
                'creator_id' => $developer1->id,
                'body' => 'API для получения данных о текущей погоде и прогнозе на несколько дней вперед.',
                'status' => 'active',
                'endpoint_url' => 'https://api.example.com/weather/v2',
                'authentication_method' => 'api_key',
                'service_level' => 'basic',
                'categories' => [11],
                'tags' => [1, 2, 12],
                'money_types' => [
                    [
                        'money_type_id' => 4, // Freemium
                        'unit_of_payment' => 'month',
                        'price' => 0,
                        'body' => 'Бесплатный тариф с ограничением в 1000 запросов в месяц',
                    ],
                    [
                        'money_type_id' => 1, // Подписка
                        'unit_of_payment' => 'month',
                        'price' => 990,
                        'body' => 'Месячная подписка с 100000 запросов в месяц',
                    ],
                ],
            ],
            [
                'name' => 'Переводчик API',
                'type' => 'REST',
                'protocol' => 'HTTPS',
                'version' => '1.0',
                'creator_id' => $developer2->id,
                'body' => 'API для перевода текстов с одного языка на другой. Поддерживает более 100 языков и диалектов.',
                'status' => 'active',
                'endpoint_url' => 'https://api.example.com/translate/v1',
                'authentication_method' => 'api_key',
                'service_level' => 'standard',
                'categories' => [12],
                'tags' => [1, 2, 6],
                'money_types' => [
                    [
                        'money_type_id' => 2, // Pay-per-use
                        'unit_of_payment' => 'thousand',
                        'price' => 15,
                        'body' => 'Оплата за 1000 символов текста',
                    ],
                ],
            ],
            [
                'name' => 'E-commerce API',
                'type' => 'REST',
                'protocol' => 'HTTPS',
                'version' => '2.0',
                'creator_id' => $developer1->id,
                'body' => 'API для интеграции с различными маркетплейсами и платформами электронной коммерции.',
                'status' => 'draft',
                'endpoint_url' => 'https://api.example.com/ecommerce/v2',
                'authentication_method' => 'oauth2',
                'service_level' => 'premium',
                'categories' => [10, 8],
                'tags' => [1, 2, 13, 14],
                'money_types' => [
                    [
                        'money_type_id' => 1, // Подписка
                        'unit_of_payment' => 'month',
                        'price' => 4990,
                        'body' => 'Месячная подписка с неограниченным количеством запросов',
                    ],
                ],
            ],
        ];

        foreach ($apis as $apiData) {
            $categoryIds = $apiData['categories'] ?? [];
            $tagIds = $apiData['tags'] ?? [];
            $moneyTypesData = $apiData['money_types'] ?? [];

            // Удаляем лишние поля из данных API
            unset($apiData['categories']);
            unset($apiData['tags']);
            unset($apiData['money_types']);

            // Создаем API
            $api = Api::create($apiData);

            // Привязываем категории
            if (!empty($categoryIds)) {
                $api->categories()->attach($categoryIds);
            }

            // Привязываем теги
            if (!empty($tagIds)) {
                $api->tags()->attach($tagIds);
            }

            // Создаем тарифы
            foreach ($moneyTypesData as $moneyTypeData) {
                $moneyTypeData['api_id'] = $api->id;
                MoneyTypesForEachApi::create($moneyTypeData);
            }
        }

        // Создаем покупки
        $purchases = [
            [
                'seller_id' => $developer1->id,
                'customer_id' => $customer1->id,
                'api_id' => 1, // Аналитика данных API
                'money_type_id' => 1, // Подписка
                'total_price' => 1500,
                'created_at' => now()->subDays(30),
                'period_begin' => now()->subDays(30),
                'period_end' => now()->addDays(0), // Заканчивается сегодня
                'status' => 'active',
            ],
            [
                'seller_id' => $developer1->id,
                'customer_id' => $customer1->id,
                'api_id' => 2, // Геолокация API
                'money_type_id' => 1, // Подписка
                'total_price' => 2000,
                'created_at' => now()->subDays(15),
                'period_begin' => now()->subDays(15),
                'period_end' => now()->addDays(15),
                'status' => 'active',
            ],
            [
                'seller_id' => $developer2->id,
                'customer_id' => $customer2->id,
                'api_id' => 3, // Финансовый API
                'money_type_id' => 1, // Подписка
                'total_price' => 5000,
                'created_at' => now()->subDays(10),
                'period_begin' => now()->subDays(10),
                'period_end' => now()->addDays(20),
                'status' => 'active',
            ],
            [
                'seller_id' => $developer2->id,
                'customer_id' => $customer1->id,
                'api_id' => 4, // Распознавание текста API
                'money_type_id' => 2, // Pay-per-use
                'total_price' => 50,
                'created_at' => now()->subDays(5),
                'count_of_request' => 500,
                'status' => 'active',
            ],
            [
                'seller_id' => $developer1->id,
                'customer_id' => $customer3->id,
                'api_id' => 1, // Аналитика данных API
                'money_type_id' => 1, // Подписка
                'total_price' => 1500,
                'created_at' => now()->subDays(45),
                'period_begin' => now()->subDays(45),
                'period_end' => now()->subDays(15),
                'status' => 'expired',
            ],
            [
                'seller_id' => $developer1->id,
                'customer_id' => $customer2->id,
                'api_id' => 5, // Погодный API
                'money_type_id' => 1, // Подписка
                'total_price' => 990,
                'created_at' => now()->subDays(20),
                'period_begin' => now()->subDays(20),
                'period_end' => now()->addDays(10),
                'status' => 'active',
            ],
            [
                'seller_id' => $developer2->id,
                'customer_id' => $customer3->id,
                'api_id' => 6, // Переводчик API
                'money_type_id' => 2, // Pay-per-use
                'total_price' => 75,
                'created_at' => now()->subDays(7),
                'count_of_request' => 5000,
                'status' => 'active',
            ],
        ];

        foreach ($purchases as $purchaseData) {
            $apiId = $purchaseData['api_id'];
            $moneyTypeId = $purchaseData['money_type_id'];
            
            // Находим тариф
            $moneyTypeForApi = MoneyTypesForEachApi::where('api_id', $apiId)
                ->where('money_type_id', $moneyTypeId)
                ->first();
            
            if (!$moneyTypeForApi) {
                continue;
            }
            
            // Удаляем лишние поля из данных покупки
            unset($purchaseData['api_id']);
            unset($purchaseData['money_type_id']);
            
            // Добавляем ID тарифа
            $purchaseData['money_types_for_each_api_id'] = $moneyTypeForApi->id;
            
            // Создаем запись о покупке
            $salesReceipt = SalesReceipt::create($purchaseData);
            
            // Создаем запись в логе
            Log::create([
                'type' => 'purchase',
                'user_id' => $purchaseData['customer_id'],
                'sales_id' => $salesReceipt->id,
                'activation_event' => true,
                'created_at' => $purchaseData['created_at'],
            ]);
        }

        // Создаем отзывы
        $reviews = [
            [
                'api_id' => 1,
                'user_id' => $customer1->id,
                'rating' => 5,
                'comment' => 'Отличный API для аналитики. Очень удобно использовать, хорошая документация и стабильная работа.',
                'created_at' => now()->subDays(25),
                'developer_response' => 'Спасибо за высокую оценку! Мы постоянно работаем над улучшением нашего API.',
                'developer_response_at' => now()->subDays(24),
            ],
            [
                'api_id' => 1,
                'user_id' => $customer3->id,
                'rating' => 4,
                'comment' => 'В целом хороший API, но иногда бывают задержки при обработке больших объемов данных.',
                'created_at' => now()->subDays(40),
            ],
            [
                'api_id' => 2,
                'user_id' => $customer1->id,
                'rating' => 5,
                'comment' => 'Лучший API для геолокации! Очень точные данные и быстрый отклик.',
                'created_at' => now()->subDays(10),
                'developer_response' => 'Благодарим за отзыв! Рады, что вам нравится наш API.',
                'developer_response_at' => now()->subDays(9),
            ],
            [
                'api_id' => 3,
                'user_id' => $customer2->id,
                'rating' => 4,
                'comment' => 'Хороший финансовый API, но хотелось бы больше возможностей для работы с криптовалютами.',
                'created_at' => now()->subDays(8),
                'developer_response' => 'Спасибо за отзыв! Мы уже работаем над добавлением поддержки криптовалют в следующем обновлении.',
                'developer_response_at' => now()->subDays(7),
            ],
            [
                'api_id' => 4,
                'user_id' => $customer1->id,
                'rating' => 3,
                'comment' => 'API работает нормально, но качество распознавания текста на нечетких изображениях оставляет желать лучшего.',
                'created_at' => now()->subDays(3),
            ],
            [
                'api_id' => 5,
                'user_id' => $customer2->id,
                'rating' => 5,
                'comment' => 'Очень точный прогноз погоды, особенно на ближайшие дни. Лучший из тех, что я использовал.',
                'created_at' => now()->subDays(15),
                'developer_response' => 'Большое спасибо за положительный отзыв! Мы стараемся обеспечивать максимальную точность наших прогнозов.',
                'developer_response_at' => now()->subDays(14),
            ],
            [
                'api_id' => 6,
                'user_id' => $customer3->id,
                'rating' => 4,
                'comment' => 'API переводит очень хорошо, особенно для распространенных языков. Для более редких языков качество чуть хуже.',
                'created_at' => now()->subDays(5),
            ],
        ];

        foreach ($reviews as $reviewData) {
            ApiReview::create($reviewData);
        }

        // Создаем тикеты поддержки
        $supportTickets = [
            [
                'user_id' => $customer1->id,
                'api_id' => 1,
                'subject' => 'Проблема с авторизацией',
                'message' => 'Добрый день! Не могу авторизоваться в API с использованием полученного ключа. Получаю ошибку unauthorized. Подскажите, что делать?',
                'status' => 'open',
                'created_at' => now()->subDays(2),
            ],
            [
                'user_id' => $customer2->id,
                'api_id' => 3,
                'subject' => 'Вопрос по интеграции',
                'message' => 'Здравствуйте! Возникла проблема при интеграции с вашим API на PHP. Не могу получить корректный ответ от сервера. Подскажите, есть ли у вас примеры использования SDK на PHP?',
                'status' => 'in_progress',
                'created_at' => now()->subDays(5),
            ],
            [
                'user_id' => $customer3->id,
                'api_id' => 6,
                'subject' => 'Ошибка при переводе',
                'message' => 'При попытке перевести текст с русского на японский получаю ошибку "Unsupported language pair". Но в документации указано, что эта языковая пара поддерживается.',
                'status' => 'resolved',
                'created_at' => now()->subDays(8),
            ],
            [
                'user_id' => $customer1->id,
                'api_id' => 2,
                'subject' => 'Задержка в работе API',
                'message' => 'В последние дни наблюдаю значительную задержку при запросах к API геолокации. Обычно ответ приходит в течение 200-300 мс, а сейчас занимает 1-2 секунды.',
                'status' => 'closed',
                'created_at' => now()->subDays(15),
            ],
        ];

        foreach ($supportTickets as $ticketData) {
            $ticket = SupportTicket::create($ticketData);
            
            // Для тикетов в статусе in_progress, resolved и closed добавляем ответы
            if (in_array($ticket->status, ['in_progress', 'resolved', 'closed'])) {
                $apiCreatorId = Api::find($ticket->api_id)->creator_id;
                
                // Ответ разработчика
                SupportTicketReply::create([
                    'ticket_id' => $ticket->id,
                    'user_id' => $apiCreatorId,
                    'message' => 'Добрый день! Мы получили ваш запрос и работаем над решением проблемы. Пожалуйста, уточните версию PHP, которую вы используете.',
                    'created_at' => Carbon::parse($ticket->created_at)->addHours(3),
                ]);
                
                // Для закрытых и решенных тикетов добавляем дополнительные ответы
                if (in_array($ticket->status, ['resolved', 'closed'])) {
                    // Ответ клиента
                    SupportTicketReply::create([
                        'ticket_id' => $ticket->id,
                        'user_id' => $ticket->user_id,
                        'message' => 'Я использую PHP 8.1. Ошибка возникает при вызове метода /api/v1/finance/rates.',
                        'created_at' => Carbon::parse($ticket->created_at)->addHours(5),
                    ]);
                    
                    // Финальный ответ разработчика
                    SupportTicketReply::create([
                        'ticket_id' => $ticket->id,
                        'user_id' => $apiCreatorId,
                        'message' => 'Мы обнаружили проблему на нашей стороне и исправили ее. Пожалуйста, попробуйте сделать запрос снова. Если проблема сохраняется, обязательно сообщите нам.',
                        'created_at' => Carbon::parse($ticket->created_at)->addHours(8),
                    ]);
                }
            }
        }

        // Создаем корзину для одного из пользователей
        $cartItems = [
            [
                'user_id' => $customer3->id,
                'money_types_for_each_api_id' => MoneyTypesForEachApi::where('api_id', 2)->first()->id,
                'quantity' => 1,
            ],
            [
                'user_id' => $customer3->id,
                'money_types_for_each_api_id' => MoneyTypesForEachApi::where('api_id', 4)->first()->id,
                'quantity' => 1,
            ],
        ];

        foreach ($cartItems as $cartItemData) {
            CartItem::create($cartItemData);
        }

        // Добавляем логи использования API
        for ($i = 0; $i < 100; $i++) {
            $salesReceipt = SalesReceipt::where('status', 'active')
                ->inRandomOrder()
                ->first();
            
            if ($salesReceipt) {
                Log::create([
                    'type' => 'api_usage',
                    'user_id' => $salesReceipt->customer_id,
                    'sales_id' => $salesReceipt->id,
                    'count_of_current_request' => rand(1, 10),
                    'created_at' => Carbon::now()->subMinutes(rand(1, 30 * 24 * 60)), // Случайное время в пределах последних 30 дней
                ]);
            }
        }
    }
}