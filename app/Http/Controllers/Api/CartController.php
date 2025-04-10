<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Api;
use App\Models\CartItem;
use App\Models\MoneyTypesForEachApi;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Validator;

class CartController extends Controller
{
    /**
     * Получение содержимого корзины
     */
    public function index()
    {
        $items = CartItem::with(['plan.api', 'plan.moneyType'])
            ->where('user_id', Auth::id())
            ->get()
            ->map(function ($item) {
                return [
                    'id' => $item->id,
                    'money_types_for_each_api_id' => $item->money_types_for_each_api_id,
                    'api' => [
                        'id' => $item->plan->api->id,
                        'name' => $item->plan->api->name,
                        'type' => $item->plan->api->type,
                        'version' => $item->plan->api->version,
                    ],
                    'price' => $item->plan->price,
                    'plan' => [
                        'unit_of_payment' => $item->plan->unit_of_payment,
                        'price' => $item->plan->price,
                        'money_type' => [
                            'types_of_use' => $item->plan->moneyType->types_of_use,
                            'description' => $item->plan->moneyType->description,
                        ],
                    ],
                    'quantity' => $item->quantity,
                ];
            });

        // Рассчитываем общую сумму
        $total = $items->sum(function ($item) {
            return $item['price'] * $item['quantity'];
        });

        return response()->json([
            'items' => $items,
            'total' => $total,
        ]);
    }

    /**
     * Добавление API в корзину
     */
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'api_id' => 'required|exists:apis,id',
            'money_types_for_each_api_id' => 'nullable|exists:money_types_for_each_api,id',
            'quantity' => 'nullable|integer|min:1',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $apiId = $request->api_id;
        $planId = $request->money_types_for_each_api_id;
        $quantity = $request->quantity ?? 1;

        // Проверяем, что API существует и активен
        $api = Api::where('id', $apiId)
            ->where('status', 'active')
            ->firstOrFail();

        // Если ID тарифа не указан, выбираем первый доступный
        if (!$planId) {
            $plan = MoneyTypesForEachApi::where('api_id', $apiId)
                ->orderBy('price')
                ->firstOrFail();
            $planId = $plan->id;
        } else {
            // Проверяем, что тариф относится к указанному API
            $plan = MoneyTypesForEachApi::where('id', $planId)
                ->where('api_id', $apiId)
                ->firstOrFail();
        }

        // Проверяем, есть ли уже такой товар в корзине
        $existingItem = CartItem::where('user_id', Auth::id())
            ->where('money_types_for_each_api_id', $planId)
            ->first();

        if ($existingItem) {
            // Если товар уже есть, увеличиваем количество
            $existingItem->quantity += $quantity;
            $existingItem->save();
            $cartItem = $existingItem;
        } else {
            // Иначе создаем новый элемент корзины
            $cartItem = new CartItem();
            $cartItem->user_id = Auth::id();
            $cartItem->money_types_for_each_api_id = $planId;
            $cartItem->quantity = $quantity;
            $cartItem->save();
        }

        // Загружаем данные элемента корзины с отношениями
        $cartItem->load(['plan.api', 'plan.moneyType']);

        return response()->json([
            'message' => 'Item added to cart',
            'item' => [
                'id' => $cartItem->id,
                'money_types_for_each_api_id' => $cartItem->money_types_for_each_api_id,
                'api' => [
                    'id' => $cartItem->plan->api->id,
                    'name' => $cartItem->plan->api->name,
                    'type' => $cartItem->plan->api->type,
                    'version' => $cartItem->plan->api->version,
                ],
                'price' => $cartItem->plan->price,
                'plan' => [
                    'unit_of_payment' => $cartItem->plan->unit_of_payment,
                    'price' => $cartItem->plan->price,
                    'money_type' => [
                        'types_of_use' => $cartItem->plan->moneyType->types_of_use,
                        'description' => $cartItem->plan->moneyType->description,
                    ],
                ],
                'quantity' => $cartItem->quantity,
            ],
        ], 201);
    }

    /**
     * Обновление количества товара в корзине
     */
    public function update(Request $request, $id)
    {
        $validator = Validator::make($request->all(), [
            'quantity' => 'required|integer|min:1',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $cartItem = CartItem::where('id', $id)
            ->where('user_id', Auth::id())
            ->firstOrFail();

        $cartItem->quantity = $request->quantity;
        $cartItem->save();

        return response()->json([
            'message' => 'Cart item updated',
            'item' => $cartItem,
        ]);
    }

    /**
     * Удаление товара из корзины
     */
    public function destroy($id)
    {
        $cartItem = CartItem::where('id', $id)
            ->where('user_id', Auth::id())
            ->firstOrFail();

        $cartItem->delete();

        return response()->json([
            'message' => 'Cart item removed'
        ]);
    }

    /**
     * Очистка корзины
     */
    public function clear()
    {
        CartItem::where('user_id', Auth::id())->delete();

        return response()->json([
            'message' => 'Cart cleared'
        ]);
    }
}