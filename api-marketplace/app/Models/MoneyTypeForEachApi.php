<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class MoneyTypeForEachApi extends Model
{
    use HasFactory;

    protected $table = 'money_types_for_each_api';

    protected $fillable = [
        'api_id',
        'money_type_id',
        'unit_of_payment',
        'price',
        'request_limit',
        'body',
        'is_featured',
    ];

    protected $casts = [
        'price' => 'decimal:2',
        'is_featured' => 'boolean',
    ];

    // Отношения
    public function api()
    {
        return $this->belongsTo(Api::class);
    }

    public function moneyType()
    {
        return $this->belongsTo(MoneyType::class, 'money_type_id');
    }

    public function salesReceipts()
    {
        return $this->hasMany(SalesReceipt::class, 'money_types_for_each_api_id');
    }
}
