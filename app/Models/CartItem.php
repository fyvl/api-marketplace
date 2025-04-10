<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class CartItem extends Model
{
    use HasFactory;

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'user_id',
        'money_types_for_each_api_id',
        'quantity',
    ];

    /**
     * Get the user to whom this cart item belongs.
     */
    public function user()
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Get the plan that is in the cart.
     */
    public function plan()
    {
        return $this->belongsTo(MoneyTypesForEachApi::class, 'money_types_for_each_api_id');
    }
}