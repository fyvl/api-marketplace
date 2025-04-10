<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\MoneyType;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Validator;

class MoneyTypeController extends Controller
{
    /**
     * Получение всех типов монетизации
     */
    public function index()
    {
        $moneyTypes = MoneyType::all();
        return response()->json($moneyTypes);
    }

    /**
     * Получение конкретного типа монетизации
     */
    public function show($id)
    {
        $moneyType = MoneyType::findOrFail($id);
        return response()->json($moneyType);
    }

    /**
     * Создание нового типа монетизации (только для админов)
     */
    public function store(Request $request)
    {
        // Проверка прав доступа
        if (Auth::user()->role !== 'admin') {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $validator = Validator::make($request->all(), [
            'types_of_use' => 'required|string|max:255|unique:money_types',
            'description' => 'nullable|string',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $moneyType = new MoneyType();
        $moneyType->types_of_use = $request->types_of_use;
        $moneyType->description = $request->description;
        $moneyType->save();

        return response()->json($moneyType, 201);
    }

    /**
     * Обновление типа монетизации (только для админов)
     */
    public function update(Request $request, $id)
    {
        // Проверка прав доступа
        if (Auth::user()->role !== 'admin') {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $moneyType = MoneyType::findOrFail($id);

        $validator = Validator::make($request->all(), [
            'types_of_use' => "string|max:255|unique:money_types,types_of_use,{$moneyType->id}",
            'description' => 'nullable|string',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        if ($request->has('types_of_use')) {
            $moneyType->types_of_use = $request->types_of_use;
        }
        
        if ($request->has('description')) {
            $moneyType->description = $request->description;
        }
        
        $moneyType->save();

        return response()->json($moneyType);
    }

    /**
     * Удаление типа монетизации (только для админов)
     */
    public function destroy($id)
    {
        // Проверка прав доступа
        if (Auth::user()->role !== 'admin') {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $moneyType = MoneyType::findOrFail($id);
        
        // Проверяем, используется ли тип в каких-либо API
        $isUsed = $moneyType->apiPlans()->exists();
        
        if ($isUsed) {
            return response()->json([
                'message' => 'Cannot delete a money type that is in use'
            ], 400);
        }
        
        $moneyType->delete();

        return response()->json(['message' => 'Money type deleted']);
    }

    /**
     * Получение доступных единиц оплаты для каждого типа монетизации
     */
    public function getPaymentUnits()
    {
        return response()->json([
            'subscription' => [
                ['value' => 'day', 'label' => 'День'],
                ['value' => 'week', 'label' => 'Неделя'],
                ['value' => 'month', 'label' => 'Месяц'],
                ['value' => 'year', 'label' => 'Год'],
            ],
            'pay-per-use' => [
                ['value' => 'request', 'label' => 'Запрос'],
                ['value' => 'thousand', 'label' => '1000 запросов'],
                ['value' => 'mb', 'label' => 'Мегабайт'],
                ['value' => 'gb', 'label' => 'Гигабайт'],
                ['value' => 'operation', 'label' => 'Операция'],
            ],
            'one-time' => [
                ['value' => 'license', 'label' => 'Лицензия'],
                ['value' => 'installation', 'label' => 'Установка'],
                ['value' => 'deployment', 'label' => 'Развертывание'],
            ],
        ]);
    }
}