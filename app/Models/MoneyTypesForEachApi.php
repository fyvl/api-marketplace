<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class MoneyTypesForEachApi extends Model
{
    use HasFactory;

    /**
     * The table associated with the model.
     *
     * @var string
     */
    protected $table = 'money_types_for_each_api';

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'api_id',
        'money_type_id',
        'unit_of_payment',
        'price',
        'body',
    ];

    /**
     * Get the API to which this plan belongs.
     */
    public function api()
    {
        return $this->belongsTo(Api::class);
    }

    /**
     * Get the money type of this plan.
     */
    public function moneyType()
    {
        return $this->belongsTo(MoneyType::class, 'money_type_id');
    }

    /**
     * Get the sales receipts for this plan.
     */
    public function salesReceipts()
    {
        return $this->hasMany(SalesReceipt::class, 'money_types_for_each_api_id');
    }

    /**
     * Get the cart items for this plan.
     */
    public function cartItems()
    {
        return $this->hasMany(CartItem::class, 'money_types_for_each_api_id');
    }
}