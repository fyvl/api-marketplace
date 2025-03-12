<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class SalesReceipt extends Model
{
    use HasFactory;

    protected $fillable = [
        'seller_id',
        'customer_id',
        'money_types_for_each_api_id',
        'period_begin',
        'period_end',
        'count_of_request',
        'total_price',
        'payment_id',
        'status',
        'body',
    ];

    protected $casts = [
        'period_begin' => 'datetime',
        'period_end' => 'datetime',
        'total_price' => 'decimal:2',
    ];

    // Отношения
    public function seller()
    {
        return $this->belongsTo(User::class, 'seller_id');
    }

    public function customer()
    {
        return $this->belongsTo(User::class, 'customer_id');
    }

    public function apiPricing()
    {
        return $this->belongsTo(MoneyTypeForEachApi::class, 'money_types_for_each_api_id');
    }

    public function logs()
    {
        return $this->hasMany(Log::class, 'sales_id');
    }

    // Методы
    public function isActive()
    {
        if (!$this->period_end) {
            return true; // Для неограниченных подписок
        }
        
        return now()->lt($this->period_end);
    }
}

