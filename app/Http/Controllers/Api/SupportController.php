<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Api;
use App\Models\SalesReceipt;
use App\Models\SupportTicket;
use App\Models\SupportTicketReply;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Validator;

class SupportController extends Controller
{
    /**
     * Получение тикетов пользователя
     */
    public function getUserTickets(Request $request)
    {
        $query = SupportTicket::with(['api', 'replies'])
            ->where('user_id', Auth::id())
            ->orderBy('updated_at', 'desc');

        // Фильтр по статусу
        if ($request->has('status') && $request->status !== 'all') {
            $query->where('status', $request->status);
        }

        // Фильтр по API
        if ($request->has('api_id')) {
            $query->where('api_id', $request->api_id);
        }

        // Пагинация
        $perPage = $request->input('per_page', 15);
        $tickets = $query->paginate($perPage);

        return response()->json($tickets);
    }

    /**
     * Получение тикетов для разработчика API
     */
    public function getDeveloperTickets(Request $request)
    {
        $query = SupportTicket::with(['api', 'user', 'replies'])
            ->whereHas('api', function($q) {
                $q->where('creator_id', Auth::id());
            })
            ->orderBy('updated_at', 'desc');

        // Фильтр по статусу
        if ($request->has('status') && $request->status !== 'all') {
            $query->where('status', $request->status);
        }

        // Фильтр по API
        if ($request->has('api_id')) {
            $query->where('api_id', $request->api_id);
        }

        // Пагинация
        $perPage = $request->input('per_page', 15);
        $tickets = $query->paginate($perPage);

        return response()->json($tickets);
    }

    /**
     * Получение конкретного тикета
     */
    public function show($id)
    {
        $ticket = SupportTicket::with(['api', 'user', 'replies.user'])
            ->findOrFail($id);

        // Проверка прав доступа
        $isCustomer = $ticket->user_id === Auth::id();
        $isDeveloper = $ticket->api->creator_id === Auth::id();
        $isAdmin = Auth::user()->role === 'admin';

        if (!$isCustomer && !$isDeveloper && !$isAdmin) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        return response()->json($ticket);
    }

    /**
     * Создание нового тикета
     */
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'api_id' => 'required|exists:apis,id',
            'subject' => 'required|string|max:255',
            'message' => 'required|string',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        // Проверяем, что пользователь купил этот API
        $hasPurchased = SalesReceipt::whereHas('plan', function($query) use ($request) {
                $query->where('api_id', $request->api_id);
            })
            ->where('customer_id', Auth::id())
            ->exists();
            
        if (!$hasPurchased) {
            return response()->json([
                'message' => 'You can only create support tickets for APIs that you have purchased'
            ], 403);
        }

        // Создаем тикет
        $ticket = new SupportTicket();
        $ticket->user_id = Auth::id();
        $ticket->api_id = $request->api_id;
        $ticket->subject = $request->subject;
        $ticket->message = $request->message;
        $ticket->status = 'open';
        $ticket->save();

        // Загружаем связи
        $ticket->load(['api', 'user']);

        return response()->json($ticket, 201);
    }

    /**
     * Обновление статуса тикета
     */
    public function updateStatus(Request $request, $id)
    {
        $validator = Validator::make($request->all(), [
            'status' => 'required|in:open,in_progress,resolved,closed',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $ticket = SupportTicket::with('api')->findOrFail($id);

        // Проверка прав доступа
        $isCustomer = $ticket->user_id === Auth::id();
        $isDeveloper = $ticket->api->creator_id === Auth::id();
        $isAdmin = Auth::user()->role === 'admin';

        // Клиент может только закрыть тикет или открыть его снова
        if ($isCustomer && !in_array($request->status, ['open', 'closed'])) {
            return response()->json(['message' => 'You can only open or close a ticket'], 403);
        }

        // Разработчик или админ может менять любой статус
        if (!$isCustomer && !$isDeveloper && !$isAdmin) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $ticket->status = $request->status;
        $ticket->save();

        return response()->json($ticket);
    }

    /**
     * Добавление ответа на тикет
     */
    public function reply(Request $request, $id)
    {
        $validator = Validator::make($request->all(), [
            'message' => 'required|string',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $ticket = SupportTicket::with('api')->findOrFail($id);

        // Проверка прав доступа
        $isCustomer = $ticket->user_id === Auth::id();
        $isDeveloper = $ticket->api->creator_id === Auth::id();
        $isAdmin = Auth::user()->role === 'admin';

        if (!$isCustomer && !$isDeveloper && !$isAdmin) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        // Нельзя отвечать на закрытый тикет
        if ($ticket->status === 'closed') {
            return response()->json([
                'message' => 'Cannot reply to a closed ticket'
            ], 400);
        }

        // Создаем ответ
        $reply = new SupportTicketReply();
        $reply->ticket_id = $ticket->id;
        $reply->user_id = Auth::id();
        $reply->message = $request->message;
        $reply->save();

        // Обновляем статус тикета, если отвечает разработчик
        if ($isDeveloper && $ticket->status === 'open') {
            $ticket->status = 'in_progress';
            $ticket->save();
        }

        // Загружаем связи
        $reply->load('user');

        return response()->json($reply, 201);
    }

    /**
     * Получение открытых тикетов для конкретного API разработчика
     */
    public function getApiTickets($apiId)
    {
        $api = Api::findOrFail($apiId);

        // Проверяем, что пользователь - разработчик API
        if (Auth::id() !== $api->creator_id && Auth::user()->role !== 'admin') {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $tickets = SupportTicket::with(['user', 'replies'])
            ->where('api_id', $apiId)
            ->whereIn('status', ['open', 'in_progress'])
            ->orderBy('created_at', 'desc')
            ->paginate(15);

        return response()->json($tickets);
    }

    /**
     * Получение статистики по тикетам для разработчика
     */
    public function getTicketStats()
    {
        // Получаем API, созданные пользователем
        $apiIds = Api::where('creator_id', Auth::id())->pluck('id');

        if ($apiIds->isEmpty()) {
            return response()->json([
                'total' => 0,
                'open' => 0,
                'in_progress' => 0,
                'resolved' => 0,
                'closed' => 0,
                'by_api' => [],
            ]);
        }

        // Общая статистика
        $total = SupportTicket::whereIn('api_id', $apiIds)->count();
        $open = SupportTicket::whereIn('api_id', $apiIds)->where('status', 'open')->count();
        $inProgress = SupportTicket::whereIn('api_id', $apiIds)->where('status', 'in_progress')->count();
        $resolved = SupportTicket::whereIn('api_id', $apiIds)->where('status', 'resolved')->count();
        $closed = SupportTicket::whereIn('api_id', $apiIds)->where('status', 'closed')->count();

        // Статистика по каждому API
        $byApi = Api::whereIn('id', $apiIds)
            ->withCount(['supportTickets', 
                'supportTickets as open_tickets_count' => function ($query) {
                    $query->where('status', 'open');
                },
                'supportTickets as in_progress_tickets_count' => function ($query) {
                    $query->where('status', 'in_progress');
                }
            ])
            ->orderBy('support_tickets_count', 'desc')
            ->get()
            ->map(function ($api) {
                return [
                    'id' => $api->id,
                    'name' => $api->name,
                    'total' => $api->support_tickets_count,
                    'open' => $api->open_tickets_count,
                    'in_progress' => $api->in_progress_tickets_count,
                ];
            });

        return response()->json([
            'total' => $total,
            'open' => $open,
            'in_progress' => $inProgress,
            'resolved' => $resolved,
            'closed' => $closed,
            'by_api' => $byApi,
        ]);
    }
}