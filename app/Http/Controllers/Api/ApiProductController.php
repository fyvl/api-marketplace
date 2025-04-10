<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Api;
use App\Models\ApiCategory;
use App\Models\ApiTag;
use App\Models\MoneyTypesForEachApi;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Str;

class ApiProductController extends Controller
{
    /**
     * Получение списка всех API-продуктов с фильтрацией
     */
    public function index(Request $request)
    {
        $query = Api::with(['creator', 'categories', 'tags', 'moneyTypes.moneyType']);

        // Поиск по имени или описанию
        if ($request->has('search')) {
            $search = $request->search;
            $query->where(function($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('body', 'like', "%{$search}%");
            });
        }

        // Фильтр по категориям
        if ($request->has('categories')) {
            $categories = $request->categories;
            if (is_array($categories)) {
                $query->whereHas('categories', function($q) use ($categories) {
                    $q->whereIn('api_categories.slug', $categories);
                });
            }
        }

        // Фильтр по типу API
        if ($request->has('type')) {
            $query->where('type', $request->type);
        }

        // Фильтр по протоколу
        if ($request->has('protocol')) {
            $query->where('protocol', $request->protocol);
        }

        // Фильтр по цене
        if ($request->has('price_min') && $request->has('price_max')) {
            $min = $request->price_min;
            $max = $request->price_max;
            $query->whereHas('moneyTypes', function($q) use ($min, $max) {
                $q->whereBetween('price', [$min, $max]);
            });
        }

        // Фильтр по минимальному рейтингу
        if ($request->has('min_rating')) {
            $minRating = $request->min_rating;
            $query->whereHas('reviews', function($q) use ($minRating) {
                $q->select('api_id')
                  ->groupBy('api_id')
                  ->havingRaw('AVG(rating) >= ?', [$minRating]);
            });
        }

        // Сортировка
        $sortField = $request->input('sort_by', 'created_at');
        $sortOrder = $request->input('sort_order', 'desc');
        
        $allowedSortFields = ['name', 'created_at', 'type', 'protocol', 'version'];
        
        if (in_array($sortField, $allowedSortFields)) {
            $query->orderBy($sortField, $sortOrder);
        }

        // Пагинация
        $perPage = $request->input('per_page', 15);
        $apis = $query->paginate($perPage);

        // Трансформация данных для фронтенда
        $apis->getCollection()->transform(function ($api) {
            // Добавляем среднюю оценку
            $api->averageRating = $api->reviews()->avg('rating') ?? 0;
            
            // Добавляем минимальную цену
            $lowestPrice = $api->moneyTypes()->min('price');
            if ($lowestPrice) {
                $api->lowestPrice = $lowestPrice;
            }
            
            return $api;
        });

        return response()->json($apis);
    }

    /**
     * Получение рекомендуемых API
     */
    public function featured()
    {
        $featuredApis = Api::with(['creator', 'categories', 'moneyTypes.moneyType'])
            ->where('status', 'active')
            ->withCount('sales')
            ->orderBy('sales_count', 'desc')
            ->take(6)
            ->get();

        $featuredApis->transform(function ($api) {
            $api->averageRating = $api->reviews()->avg('rating') ?? 0;
            $lowestPrice = $api->moneyTypes()->min('price');
            if ($lowestPrice) {
                $api->lowestPrice = $lowestPrice;
            }
            return $api;
        });

        return response()->json($featuredApis);
    }

    /**
     * Получение новых API
     */
    public function newest()
    {
        $newestApis = Api::with(['creator', 'categories', 'moneyTypes.moneyType'])
            ->where('status', 'active')
            ->orderBy('created_at', 'desc')
            ->take(6)
            ->get();

        $newestApis->transform(function ($api) {
            $api->averageRating = $api->reviews()->avg('rating') ?? 0;
            $lowestPrice = $api->moneyTypes()->min('price');
            if ($lowestPrice) {
                $api->lowestPrice = $lowestPrice;
            }
            return $api;
        });

        return response()->json($newestApis);
    }

    /**
     * Сохранение нового API
     */
    public function store(Request $request)
    {
        // Проверяем, что пользователь - разработчик
        if (Auth::user()->role !== 'developer') {
            return response()->json(['message' => 'Forbidden. Only developers can create APIs'], 403);
        }

        // Валидация входных данных
        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:255',
            'type' => 'required|string|max:50',
            'protocol' => 'required|string|max:50',
            'version' => 'required|string|max:20',
            'body' => 'nullable|string',
            'documentation' => 'nullable|string',
            'integration_guide' => 'nullable|string',
            'usage_examples' => 'nullable|string',
            'categories' => 'nullable|array',
            'categories.*' => 'exists:api_categories,id',
            'status' => 'nullable|in:draft,active',
            'endpoint_url' => 'nullable|url',
            'authentication_method' => 'nullable|string|max:50',
            'service_level' => 'nullable|string|max:50',
            'monetization_models' => 'required|array|min:1',
            'monetization_models.*.money_type_id' => 'required|exists:money_types,id',
            'monetization_models.*.unit_of_payment' => 'required|string|max:50',
            'monetization_models.*.price' => 'required|numeric|min:0',
            'monetization_models.*.body' => 'nullable|string',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        // Создаем новый API
        $api = new Api();
        $api->creator_id = Auth::id();
        $api->name = $request->name;
        $api->type = $request->type;
        $api->protocol = $request->protocol;
        $api->version = $request->version;
        $api->body = $request->body;
        $api->documentation = $request->documentation;
        $api->integration_guide = $request->integration_guide;
        $api->usage_examples = $request->usage_examples;
        $api->status = $request->status ?? 'draft';
        $api->endpoint_url = $request->endpoint_url;
        $api->authentication_method = $request->authentication_method;
        $api->service_level = $request->service_level;
        $api->save();

        // Прикрепляем категории
        if ($request->has('categories')) {
            $api->categories()->attach($request->categories);
        }

        // Сохраняем модели монетизации
        foreach ($request->monetization_models as $model) {
            $moneyType = new MoneyTypesForEachApi();
            $moneyType->api_id = $api->id;
            $moneyType->money_type_id = $model['money_type_id'];
            $moneyType->unit_of_payment = $model['unit_of_payment'];
            $moneyType->price = $model['price'];
            $moneyType->body = $model['body'] ?? null;
            $moneyType->save();
        }

        // Загружаем API с отношениями
        $api->load(['creator', 'categories', 'moneyTypes.moneyType']);

        return response()->json($api, 201);
    }

    /**
     * Получение информации о конкретном API
     */
    public function show($id)
    {
        $api = Api::with([
            'creator', 
            'categories', 
            'tags',
            'moneyTypes.moneyType',
            'reviews' => function($query) {
                $query->with('user')->orderBy('created_at', 'desc');
            }
        ])->findOrFail($id);

        // Добавляем среднюю оценку
        $api->averageRating = $api->reviews()->avg('rating') ?? 0;

        return response()->json($api);
    }

    /**
     * Обновление API
     */
    public function update(Request $request, $id)
    {
        $api = Api::findOrFail($id);

        // Проверка прав на редактирование
        if (Auth::id() !== $api->creator_id && Auth::user()->role !== 'admin') {
            return response()->json(['message' => 'Forbidden'], 403);
        }

        // Валидация входных данных
        $validator = Validator::make($request->all(), [
            'name' => 'string|max:255',
            'type' => 'string|max:50',
            'protocol' => 'string|max:50',
            'version' => 'string|max:20',
            'body' => 'nullable|string',
            'documentation' => 'nullable|string',
            'integration_guide' => 'nullable|string',
            'usage_examples' => 'nullable|string',
            'status' => 'nullable|in:draft,active,disabled',
            'categories' => 'nullable|array',
            'categories.*' => 'exists:api_categories,id',
            'endpoint_url' => 'nullable|url',
            'authentication_method' => 'nullable|string|max:50',
            'service_level' => 'nullable|string|max:50',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        // Обновляем данные API
        $api->fill($request->only([
            'name', 'type', 'protocol', 'version', 'body', 
            'documentation', 'integration_guide', 'usage_examples', 
            'status', 'endpoint_url', 'authentication_method', 'service_level'
        ]));
        $api->save();

        // Обновляем категории если они переданы
        if ($request->has('categories')) {
            $api->categories()->sync($request->categories);
        }

        // Обновляем модели монетизации если они переданы
        if ($request->has('monetization_models')) {
            // Валидация моделей монетизации
            $validator = Validator::make($request->all(), [
                'monetization_models' => 'array',
                'monetization_models.*.id' => 'nullable|exists:money_types_for_each_api,id',
                'monetization_models.*.money_type_id' => 'required|exists:money_types,id',
                'monetization_models.*.unit_of_payment' => 'required|string|max:50',
                'monetization_models.*.price' => 'required|numeric|min:0',
                'monetization_models.*.body' => 'nullable|string',
            ]);

            if ($validator->fails()) {
                return response()->json(['errors' => $validator->errors()], 422);
            }

            // Сначала собираем ID существующих моделей для обновления
            $existingModelIds = [];
            foreach ($request->monetization_models as $model) {
                if (isset($model['id'])) {
                    $existingModelIds[] = $model['id'];
                    
                    // Обновляем существующую модель
                    $moneyType = MoneyTypesForEachApi::findOrFail($model['id']);
                    $moneyType->money_type_id = $model['money_type_id'];
                    $moneyType->unit_of_payment = $model['unit_of_payment'];
                    $moneyType->price = $model['price'];
                    $moneyType->body = $model['body'] ?? null;
                    $moneyType->save();
                } else {
                    // Создаем новую модель
                    $moneyType = new MoneyTypesForEachApi();
                    $moneyType->api_id = $api->id;
                    $moneyType->money_type_id = $model['money_type_id'];
                    $moneyType->unit_of_payment = $model['unit_of_payment'];
                    $moneyType->price = $model['price'];
                    $moneyType->body = $model['body'] ?? null;
                    $moneyType->save();
                    
                    $existingModelIds[] = $moneyType->id;
                }
            }

            // Удаляем модели, которых нет в запросе
            $api->moneyTypes()->whereNotIn('id', $existingModelIds)->delete();
        }

        // Загружаем обновленный API с отношениями
        $api->load(['creator', 'categories', 'moneyTypes.moneyType']);

        return response()->json($api);
    }

    /**
     * Удаление API
     */
    public function destroy($id)
    {
        $api = Api::findOrFail($id);

        // Проверка прав на удаление
        if (Auth::id() !== $api->creator_id && Auth::user()->role !== 'admin') {
            return response()->json(['message' => 'Forbidden'], 403);
        }

        // Проверяем, нет ли активных продаж этого API
        $hasActiveSales = $api->sales()->where('status', 'active')->exists();
        if ($hasActiveSales) {
            return response()->json([
                'message' => 'Cannot delete API with active sales. Disable it instead.'
            ], 400);
        }

        // Удаляем связанные данные
        $api->moneyTypes()->delete();
        $api->categories()->detach();
        $api->tags()->detach();
        
        // Удаляем API
        $api->delete();

        return response()->json(['message' => 'API deleted successfully']);
    }

    /**
     * Получение API разработчика
     */
    public function developerApis(Request $request)
    {
        // Получаем все API текущего разработчика
        $query = Api::with(['categories', 'moneyTypes.moneyType'])
            ->where('creator_id', Auth::id());

        // Фильтр по статусу
        if ($request->has('status') && $request->status !== 'all') {
            $query->where('status', $request->status);
        }

        // Поиск
        if ($request->has('search')) {
            $search = $request->search;
            $query->where(function($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('version', 'like', "%{$search}%");
            });
        }

        // Сортировка
        $sortField = $request->input('sort_by', 'created_at');
        $sortOrder = $request->input('sort_order', 'desc');
        
        $allowedSortFields = ['name', 'created_at', 'status', 'type'];
        
        if (in_array($sortField, $allowedSortFields)) {
            $query->orderBy($sortField, $sortOrder);
        }

        // Пагинация
        $perPage = $request->input('per_page', 15);
        $apis = $query->paginate($perPage);

        // Дополнительная информация для каждого API
        $apis->getCollection()->transform(function ($api) {
            // Количество клиентов (уникальных покупателей)
            $api->customers = $api->sales()->distinct('customer_id')->count('customer_id');
            
            // Общий доход
            $api->revenue = $api->sales()->sum('total_price');
            
            return $api;
        });

        return response()->json($apis);
    }

    /**
     * Получение аналитики по API
     */
    public function apiAnalytics($id)
    {
        $api = Api::findOrFail($id);

        // Проверка прав на просмотр аналитики
        if (Auth::id() !== $api->creator_id && Auth::user()->role !== 'admin') {
            return response()->json(['message' => 'Forbidden'], 403);
        }

        // Общая статистика
        $totalSales = $api->sales()->count();
        $totalRevenue = $api->sales()->sum('total_price');
        $uniqueCustomers = $api->sales()->distinct('customer_id')->count('customer_id');
        $averageRating = $api->reviews()->avg('rating') ?? 0;
        
        // Статистика по периодам (последние 6 месяцев)
        $monthlyStats = [];
        for ($i = 0; $i < 6; $i++) {
            $date = now()->subMonths($i);
            $month = $date->format('Y-m');
            
            $monthlySales = $api->sales()
                ->whereYear('created_at', $date->year)
                ->whereMonth('created_at', $date->month)
                ->count();
                
            $monthlyRevenue = $api->sales()
                ->whereYear('created_at', $date->year)
                ->whereMonth('created_at', $date->month)
                ->sum('total_price');
                
            $monthlyStats[] = [
                'month' => $month,
                'sales' => $monthlySales,
                'revenue' => $monthlyRevenue,
            ];
        }
        
        // Статистика по тарифам
        $planStats = $api->moneyTypes()
            ->withCount('salesReceipts')
            ->with('moneyType')
            ->get()
            ->map(function ($plan) {
                return [
                    'id' => $plan->id,
                    'type' => $plan->moneyType->types_of_use,
                    'unit' => $plan->unit_of_payment,
                    'price' => $plan->price,
                    'sales' => $plan->sales_receipts_count,
                    'revenue' => $plan->salesReceipts()->sum('total_price'),
                ];
            });
            
        return response()->json([
            'api_id' => $api->id,
            'api_name' => $api->name,
            'statistics' => [
                'total_sales' => $totalSales,
                'total_revenue' => $totalRevenue,
                'unique_customers' => $uniqueCustomers,
                'average_rating' => $averageRating,
            ],
            'monthly_stats' => $monthlyStats,
            'plan_stats' => $planStats,
        ]);
    }
}