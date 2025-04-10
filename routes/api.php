<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\ApiProductController;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\CartController;
use App\Http\Controllers\Api\CategoryController;
use App\Http\Controllers\Api\CheckoutController;
use App\Http\Controllers\Api\MoneyTypeController;
use App\Http\Controllers\Api\ReviewController;
use App\Http\Controllers\Api\SupportController;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
*/

// Публичные маршруты
Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);

// Маршруты для получения каталогов
Route::get('/apis', [ApiProductController::class, 'index']);
Route::get('/apis/featured', [ApiProductController::class, 'featured']);
Route::get('/apis/newest', [ApiProductController::class, 'newest']);
Route::get('/apis/{id}', [ApiProductController::class, 'show']);
Route::get('/apis/{apiId}/reviews', [ReviewController::class, 'getApiReviews']);

// Категории и теги
Route::get('/categories', [CategoryController::class, 'index']);
Route::get('/categories/popular', [CategoryController::class, 'popular']);
Route::get('/categories/{id}', [CategoryController::class, 'show']);
Route::get('/tags', [CategoryController::class, 'getTags']);
Route::get('/tags/popular', [CategoryController::class, 'getPopularTags']);

// Типы API и протоколы для фильтров
Route::get('/api-types', [CategoryController::class, 'getApiTypes']);
Route::get('/api-protocols', [CategoryController::class, 'getApiProtocols']);

// Типы монетизации
Route::get('/money-types', [MoneyTypeController::class, 'index']);
Route::get('/money-types/payment-units', [MoneyTypeController::class, 'getPaymentUnits']);

// Защищенные маршруты
Route::middleware('auth:sanctum')->group(function () {
    // Профиль и аутентификация
    Route::get('/user', [AuthController::class, 'user']);
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::put('/profile', [AuthController::class, 'updateProfile']);
    Route::put('/password', [AuthController::class, 'updatePassword']);
    
    // Корзина
    Route::get('/cart', [CartController::class, 'index']);
    Route::post('/cart', [CartController::class, 'store']);
    Route::put('/cart/{id}', [CartController::class, 'update']);
    Route::delete('/cart/{id}', [CartController::class, 'destroy']);
    Route::delete('/cart', [CartController::class, 'clear']);
    
    // Оформление заказа
    Route::get('/checkout/preview', [CheckoutController::class, 'preview']);
    Route::post('/checkout', [CheckoutController::class, 'checkout']);
    Route::get('/purchases', [CheckoutController::class, 'purchaseHistory']);
    
    // Отзывы
    Route::post('/apis/{apiId}/reviews', [ReviewController::class, 'store']);
    Route::put('/apis/{apiId}/reviews/{reviewId}', [ReviewController::class, 'update']);
    Route::delete('/apis/{apiId}/reviews/{reviewId}', [ReviewController::class, 'destroy']);
    Route::get('/reviews/user', [ReviewController::class, 'getUserReviews']);
    
    // Техническая поддержка
    Route::get('/support/tickets', [SupportController::class, 'getUserTickets']);
    Route::get('/support/tickets/{id}', [SupportController::class, 'show']);
    Route::post('/support/tickets', [SupportController::class, 'store']);
    Route::put('/support/tickets/{id}/status', [SupportController::class, 'updateStatus']);
    Route::post('/support/tickets/{id}/reply', [SupportController::class, 'reply']);
    
    // Маршруты для разработчиков API
    Route::middleware('developer')->group(function () {
        // Управление API
        Route::get('/developer/apis', [ApiProductController::class, 'developerApis']);
        Route::post('/apis', [ApiProductController::class, 'store']);
        Route::put('/apis/{id}', [ApiProductController::class, 'update']);
        Route::delete('/apis/{id}', [ApiProductController::class, 'destroy']);
        Route::get('/apis/{id}/analytics', [ApiProductController::class, 'apiAnalytics']);
        
        // Управление отзывами
        Route::get('/developer/reviews', [ReviewController::class, 'getDeveloperApiReviews']);
        Route::post('/reviews/{reviewId}/respond', [ReviewController::class, 'respondToReview']);
        
        // Техническая поддержка для разработчика
        Route::get('/developer/support/tickets', [SupportController::class, 'getDeveloperTickets']);
        Route::get('/developer/support/stats', [SupportController::class, 'getTicketStats']);
        Route::get('/developer/support/api/{apiId}/tickets', [SupportController::class, 'getApiTickets']);
    });
    
    // Маршруты для администраторов
    Route::middleware('admin')->group(function () {
        // Управление категориями
        Route::post('/categories', [CategoryController::class, 'store']);
        Route::put('/categories/{id}', [CategoryController::class, 'update']);
        Route::delete('/categories/{id}', [CategoryController::class, 'destroy']);
        
        // Управление тегами
        Route::post('/tags', [CategoryController::class, 'storeTag']);
        Route::delete('/tags/{id}', [CategoryController::class, 'destroyTag']);
        
        // Управление типами монетизации
        Route::post('/money-types', [MoneyTypeController::class, 'store']);
        Route::put('/money-types/{id}', [MoneyTypeController::class, 'update']);
        Route::delete('/money-types/{id}', [MoneyTypeController::class, 'destroy']);
    });
});

// Middleware для проверки роли разработчика
Route::middleware('auth:sanctum')->get('/sanctum/csrf-cookie', function (Request $request) {
    return response()->json(['message' => 'CSRF cookie set']);
});