<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\CartItem;
use App\Models\Log;
use App\Models\SalesReceipt;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Validator;

class CheckoutController extends Controller
{
    /**
     * Получение предварительной информации о заказе
     */
    public function preview()
    {
        $cartItems = CartItem::with(['plan.api', 'plan.moneyType'])
            ->where('user_id', Auth::id())
            ->get();

        if ($cartItems->isEmpty()) {
            return response()->json([
                'message' => 'Cart is empty'
            ], 400);
        }

        $items = $cartItems->map(function ($item) {
            // Определение периода действия для подписок
            $periodBegin = null;
            $periodEnd = null;
            
            if ($item->plan->moneyType->types_of_use === 'subscription') {
                $periodBegin = now();
                if ($item->plan->unit_of_payment === 'month') {
                    $periodEnd = now()->addMonth();
                } elseif ($item->plan->unit_of_payment === 'year') {
                    $periodEnd = now()->addYear();
                }
            }

            return [
                'id' => $item->id,
                'money_types_for_each_api_id' => $item->money_types_for_each_api_id,
                'api' => [
                    'id' => $item->plan->api->id,
                    'name' => $item->plan->api->name,
                    'creator_id' => $item->plan->api->creator_id,
                ],
                'price' => $item->plan->price,
                'quantity' => $item->quantity,
                'plan' => [
                    'unit_of_payment' => $item->plan->unit_of_payment,
                    'money_type' => [
                        'types_of_use' => $item->plan->moneyType->types_of_use,
                        'description' => $item->plan->moneyType->description,
                    ],
                ],
                'total_price' => $item->plan->price * $item->quantity,
                'period_begin' => $periodBegin ? $periodBegin->toDateString() : null,
                'period_end' => $periodEnd ? $periodEnd->toDateString() : null,
                'count_of_request' => $item->plan->moneyType->types_of_use === 'pay-per-use' ? $item->quantity : null,
            ];
        });

        $total = $items->sum('total_price');

        // Проверяем доступность API и тарифов
        $unavailableItems = $items->filter(function ($item) {
            $api = \App\Models\Api::find($item['api']['id']);
            return !$api || $api->status !== 'active';
        });

        if ($unavailableItems->isNotEmpty()) {
            return response()->json([
                'message' => 'Some items in your cart are no longer available',
                'unavailable_items' => $unavailableItems
            ], 400);
        }

        return response()->json([
            'items' => $items,
            'total' => $total,
        ]);
    }

    /**
     * Создание заказа
     */
    public function checkout(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'payment_method' => 'required|string|in:card,paypal,bank_transfer',
            'payment_details' => 'required|array',
            'payment_details.card_number' => 'required_if:payment_method,card|string',
            'payment_details.card_holder' => 'required_if:payment_method,card|string',
            'payment_details.expiry_date' => 'required_if:payment_method,card|string',
            'payment_details.cvv' => 'required_if:payment_method,card|string',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        // Получаем содержимое корзины
        $cartItems = CartItem::with(['plan.api', 'plan.moneyType'])
            ->where('user_id', Auth::id())
            ->get();

        if ($cartItems->isEmpty()) {
            return response()->json([
                'message' => 'Cart is empty'
            ], 400);
        }

        // Начинаем транзакцию
        DB::beginTransaction();

        try {
            $salesReceipts = [];

            foreach ($cartItems as $item) {
                // Проверяем, что API активен
                $api = $item->plan->api;
                if ($api->status !== 'active') {
                    throw new \Exception("API {$api->name} is no longer available");
                }

                // Определение периода действия для подписок
                $periodBegin = null;
                $periodEnd = null;
                $countOfRequest = null;
                
                if ($item->plan->moneyType->types_of_use === 'subscription') {
                    $periodBegin = now();
                    if ($item->plan->unit_of_payment === 'month') {
                        $periodEnd = now()->addMonth();
                    } elseif ($item->plan->unit_of_payment === 'year') {
                        $periodEnd = now()->addYear();
                    } else {
                        // Для других единиц измерения
                        $periodEnd = now()->addMonth();
                    }
                } elseif ($item->plan->moneyType->types_of_use === 'pay-per-use') {
                    $countOfRequest = $item->quantity;
                }

                // Рассчитываем итоговую цену
                $totalPrice = $item->plan->price * $item->quantity;

                // Создаем чек продажи
                $salesReceipt = new SalesReceipt();
                $salesReceipt->seller_id = $api->creator_id;
                $salesReceipt->customer_id = Auth::id();
                $salesReceipt->money_types_for_each_api_id = $item->money_types_for_each_api_id;
                $salesReceipt->period_begin = $periodBegin;
                $salesReceipt->period_end = $periodEnd;
                $salesReceipt->count_of_request = $countOfRequest;
                $salesReceipt->total_price = $totalPrice;
                $salesReceipt->status = 'active';
                $salesReceipt->payment_method = $request->payment_method;
                $salesReceipt->body = "Purchased via checkout";
                $salesReceipt->save();

                // Создаем запись в логе
                $log = new Log();
                $log->type = 'purchase';
                $log->user_id = Auth::id();
                $log->sales_id = $salesReceipt->id;
                $log->activation_event = true;
                $log->save();

                $salesReceipts[] = $salesReceipt;
            }

            // Очищаем корзину
            CartItem::where('user_id', Auth::id())->delete();

            // Коммитим транзакцию
            DB::commit();

            return response()->json([
                'message' => 'Order completed successfully',
                'order_id' => md5(implode(',', array_column($salesReceipts, 'id'))),
                'sales_receipts' => $salesReceipts
            ]);
        } catch (\Exception $e) {
            // Откатываем транзакцию в случае ошибки
            DB::rollBack();

            return response()->json([
                'message' => 'Failed to process the order',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Получение истории покупок пользователя
     */
    public function purchaseHistory(Request $request)
    {
        $query = SalesReceipt::with(['plan.api', 'plan.moneyType'])
            ->where('customer_id', Auth::id())
            ->orderBy('created_at', 'desc');

        // Фильтр по статусу
        if ($request->has('status') && $request->status !== 'all') {
            $query->where('status', $request->status);
        }

        // Фильтр по API
        if ($request->has('api_id')) {
            $query->whereHas('plan.api', function($q) use ($request) {
                $q->where('id', $request->api_id);
            });
        }

        // Фильтр по дате
        if ($request->has('date_from')) {
            $query->where('created_at', '>=', Carbon::parse($request->date_from));
        }

        if ($request->has('date_to')) {
            $query->where('created_at', '<=', Carbon::parse($request->date_to));
        }

        // Пагинация
        $perPage = $request->input('per_page', 15);
        $purchases = $query->paginate($perPage);

        // Трансформируем данные
        $purchases->getCollection()->transform(function ($purchase) {
            // Проверяем активность подписки
            $isActive = true;
            
            if ($purchase->period_end && Carbon::parse($purchase->period_end)->isPast()) {
                $isActive = false;
            }
            
            if ($purchase->count_of_request !== null) {
                $usedRequests = $purchase->logs()->sum('count_of_current_request') ?? 0;
                if ($usedRequests >= $purchase->count_of_request) {
                    $isActive = false;
                }
            }
            
            // Обновляем статус если изменился
            if ($purchase->status === 'active' && !$isActive) {
                $purchase->status = 'expired';
                $purchase->save();
            }
            
            return $purchase;
        });

        return response()->json($purchases);
    }
}