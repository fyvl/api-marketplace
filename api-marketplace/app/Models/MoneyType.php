<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class MoneyType extends Model
{
    use HasFactory;

    protected $fillable = [
        'types_of_use',
        'description',
    ];

    // Отношения
    public function apiPricings()
    {
        return $this->hasMany(MoneyTypeForEachApi::class, 'money_type_id');
    }
}
