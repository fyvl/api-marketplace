<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Api;
use App\Models\ApiReview;
use App\Models\SalesReceipt;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Validator;

class ReviewController extends Controller
{
    /**
     * Получение отзывов на конкретный API
     */
    public function getApiReviews($apiId)
    {
        $api = Api::findOrFail($apiId);
        
        $reviews = ApiReview::with('user')
            ->where('api_id', $apiId)
            ->orderBy('created_at', 'desc')
            ->paginate(10);
            
        return response()->json($reviews);
    }

    /**
     * Добавление нового отзыва
     */
    public function store(Request $request, $apiId)
    {
        $validator = Validator::make($request->all(), [
            'rating' => 'required|integer|min:1|max:5',
            'comment' => 'nullable|string|max:1000',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        // Проверяем, что пользователь купил этот API
        $hasPurchased = SalesReceipt::whereHas('plan', function($query) use ($apiId) {
                $query->where('api_id', $apiId);
            })
            ->where('customer_id', Auth::id())
            ->exists();
            
        if (!$hasPurchased) {
            return response()->json([
                'message' => 'You can only review APIs that you have purchased'
            ], 403);
        }

        // Проверяем, не оставлял ли пользователь уже отзыв
        $existingReview = ApiReview::where('api_id', $apiId)
            ->where('user_id', Auth::id())
            ->first();
            
        if ($existingReview) {
            return response()->json([
                'message' => 'You have already reviewed this API',
                'review' => $existingReview
            ], 400);
        }

        // Создаем отзыв
        $review = new ApiReview();
        $review->api_id = $apiId;
        $review->user_id = Auth::id();
        $review->rating = $request->rating;
        $review->comment = $request->comment;
        $review->save();

        // Загружаем пользователя для ответа
        $review->load('user');

        return response()->json($review, 201);
    }

    /**
     * Обновление отзыва
     */
    public function update(Request $request, $apiId, $reviewId)
    {
        $validator = Validator::make($request->all(), [
            'rating' => 'integer|min:1|max:5',
            'comment' => 'nullable|string|max:1000',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        // Проверяем, что отзыв существует и принадлежит пользователю
        $review = ApiReview::where('id', $reviewId)
            ->where('api_id', $apiId)
            ->where('user_id', Auth::id())
            ->firstOrFail();

        // Обновляем данные
        if ($request->has('rating')) {
            $review->rating = $request->rating;
        }
        
        if ($request->has('comment')) {
            $review->comment = $request->comment;
        }

        $review->save();

        // Загружаем пользователя для ответа
        $review->load('user');

        return response()->json($review);
    }

    /**
     * Удаление отзыва
     */
    public function destroy($apiId, $reviewId)
    {
        // Проверяем, что отзыв существует и принадлежит пользователю
        $review = ApiReview::where('id', $reviewId)
            ->where('api_id', $apiId)
            ->where('user_id', Auth::id())
            ->firstOrFail();

        $review->delete();

        return response()->json(['message' => 'Review deleted']);
    }

    /**
     * Получение своих отзывов
     */
    public function getUserReviews()
    {
        $reviews = ApiReview::with('api')
            ->where('user_id', Auth::id())
            ->orderBy('created_at', 'desc')
            ->paginate(10);
            
        return response()->json($reviews);
    }

    /**
     * Получение отзывов на API пользователя (для разработчиков)
     */
    public function getDeveloperApiReviews()
    {
        $reviews = ApiReview::with(['api', 'user'])
            ->whereHas('api', function($query) {
                $query->where('creator_id', Auth::id());
            })
            ->orderBy('created_at', 'desc')
            ->paginate(15);
            
        return response()->json($reviews);
    }

    /**
     * Ответ разработчика на отзыв
     */
    public function respondToReview(Request $request, $reviewId)
    {
        $validator = Validator::make($request->all(), [
            'response' => 'required|string|max:1000',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        // Проверяем, что отзыв существует
        $review = ApiReview::with('api')->findOrFail($reviewId);

        // Проверяем, что пользователь - разработчик этого API
        if (Auth::id() !== $review->api->creator_id) {
            return response()->json([
                'message' => 'You can only respond to reviews of your own APIs'
            ], 403);
        }

        // Обновляем ответ
        $review->developer_response = $request->response;
        $review->developer_response_at = now();
        $review->save();

        // Загружаем связи для ответа
        $review->load(['api', 'user']);

        return response()->json($review);
    }
}