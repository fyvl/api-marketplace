<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class MoneyType extends Model
{
    use HasFactory;

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'types_of_use',
        'description',
    ];

    /**
     * Get the API plans using this money type.
     */
    public function apiPlans()
    {
        return $this->hasMany(MoneyTypesForEachApi::class, 'money_type_id');
    }
}