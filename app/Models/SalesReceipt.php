<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Carbon\Carbon;

class SalesReceipt extends Model
{
    use HasFactory;

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'seller_id',
        'customer_id',
        'money_types_for_each_api_id',
        'period_begin',
        'period_end',
        'count_of_request',
        'total_price',
        'status',
        'payment_method',
        'body',
    ];

    /**
     * The attributes that should be cast.
     *
     * @var array<string, string>
     */
    protected $casts = [
        'period_begin' => 'date',
        'period_end' => 'date',
    ];

    /**
     * Get the seller of this purchase.
     */
    public function seller()
    {
        return $this->belongsTo(User::class, 'seller_id');
    }

    /**
     * Get the customer who made this purchase.
     */
    public function customer()
    {
        return $this->belongsTo(User::class, 'customer_id');
    }

    /**
     * Get the plan that was purchased.
     */
    public function plan()
    {
        return $this->belongsTo(MoneyTypesForEachApi::class, 'money_types_for_each_api_id');
    }

    /**
     * Get the logs related to this purchase.
     */
    public function logs()
    {
        return $this->hasMany(Log::class, 'sales_id');
    }

    /**
     * Check if this purchase is active.
     */
    public function isActive()
    {
        $now = Carbon::now();
        
        // If the purchase has a set end date, check if it's still valid
        if ($this->period_end) {
            return $now->between($this->period_begin ?? $this->created_at, $this->period_end);
        }
        
        // If the purchase has a request limit, check if it's not exceeded
        if ($this->count_of_request !== null) {
            $usedRequests = $this->logs()->sum('count_of_current_request') ?? 0;
            return $usedRequests < $this->count_of_request;
        }
        
        // If neither, it's considered active
        return $this->status === 'active';
    }
}