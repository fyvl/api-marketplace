<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\ApiCategory;
use App\Models\ApiTag;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Str;

class CategoryController extends Controller
{
    /**
     * Получение всех категорий
     */
    public function index()
    {
        $categories = ApiCategory::withCount('apis')
            ->orderBy('name')
            ->get();

        return response()->json($categories);
    }

    /**
     * Получение популярных категорий
     */
    public function popular()
    {
        $categories = ApiCategory::withCount('apis')
            ->orderBy('apis_count', 'desc')
            ->take(12)
            ->get()
            ->map(function($category) {
                return [
                    'id' => $category->id,
                    'name' => $category->name,
                    'slug' => $category->slug,
                    'count' => $category->apis_count
                ];
            });

        return response()->json($categories);
    }

    /**
     * Получение категории по ID
     */
    public function show($id)
    {
        $category = ApiCategory::withCount('apis')->findOrFail($id);
        
        return response()->json($category);
    }

    /**
     * Создание новой категории (только для админов)
     */
    public function store(Request $request)
    {
        // Проверка прав доступа
        if (auth()->user()->role !== 'admin') {
            return response()->json(['message' => 'Unauthorized'], 403);
        }
        
        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:255|unique:api_categories',
            'description' => 'nullable|string',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $category = new ApiCategory();
        $category->name = $request->name;
        $category->slug = Str::slug($request->name);
        $category->description = $request->description;
        $category->save();

        return response()->json($category, 201);
    }

    /**
     * Обновление категории (только для админов)
     */
    public function update(Request $request, $id)
    {
        // Проверка прав доступа
        if (auth()->user()->role !== 'admin') {
            return response()->json(['message' => 'Unauthorized'], 403);
        }
        
        $category = ApiCategory::findOrFail($id);
        
        $validator = Validator::make($request->all(), [
            'name' => 'string|max:255|unique:api_categories,name,' . $category->id,
            'description' => 'nullable|string',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        if ($request->has('name')) {
            $category->name = $request->name;
            $category->slug = Str::slug($request->name);
        }
        
        if ($request->has('description')) {
            $category->description = $request->description;
        }
        
        $category->save();

        return response()->json($category);
    }

    /**
     * Удаление категории (только для админов)
     */
    public function destroy($id)
    {
        // Проверка прав доступа
        if (auth()->user()->role !== 'admin') {
            return response()->json(['message' => 'Unauthorized'], 403);
        }
        
        $category = ApiCategory::findOrFail($id);
        
        // Отключаем связи перед удалением
        $category->apis()->detach();
        $category->delete();

        return response()->json(['message' => 'Category deleted']);
    }

    /**
     * Получение всех тегов
     */
    public function getTags()
    {
        $tags = ApiTag::withCount('apis')
            ->orderBy('name')
            ->get();

        return response()->json($tags);
    }

    /**
     * Получение популярных тегов
     */
    public function getPopularTags()
    {
        $tags = ApiTag::withCount('apis')
            ->orderBy('apis_count', 'desc')
            ->take(20)
            ->get();

        return response()->json($tags);
    }

    /**
     * Создание нового тега (только для админов)
     */
    public function storeTag(Request $request)
    {
        // Проверка прав доступа
        if (auth()->user()->role !== 'admin') {
            return response()->json(['message' => 'Unauthorized'], 403);
        }
        
        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:255|unique:api_tags',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $tag = new ApiTag();
        $tag->name = $request->name;
        $tag->slug = Str::slug($request->name);
        $tag->save();

        return response()->json($tag, 201);
    }

    /**
     * Удаление тега (только для админов)
     */
    public function destroyTag($id)
    {
        // Проверка прав доступа
        if (auth()->user()->role !== 'admin') {
            return response()->json(['message' => 'Unauthorized'], 403);
        }
        
        $tag = ApiTag::findOrFail($id);
        
        // Отключаем связи перед удалением
        $tag->apis()->detach();
        $tag->delete();

        return response()->json(['message' => 'Tag deleted']);
    }

    /**
     * Получение типов API для фильтрации
     */
    public function getApiTypes()
    {
        $types = DB::table('apis')
            ->select('type')
            ->distinct()
            ->pluck('type')
            ->map(function($type) {
                return [
                    'value' => $type,
                    'label' => $type
                ];
            });

        return response()->json($types);
    }

    /**
     * Получение протоколов API для фильтрации
     */
    public function getApiProtocols()
    {
        $protocols = DB::table('apis')
            ->select('protocol')
            ->distinct()
            ->pluck('protocol')
            ->map(function($protocol) {
                return [
                    'value' => $protocol,
                    'label' => $protocol
                ];
            });

        return response()->json($protocols);
    }
}