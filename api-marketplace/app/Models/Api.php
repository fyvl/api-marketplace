<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Laravel\Scout\Searchable;

class Api extends Model
{
    use HasFactory, Searchable;

    protected $fillable = [
        'creator_id',
        'name',
        'type',
        'protocol',
        'version',
        'description',
        'documentation',
        'examples',
        'body',
        'logo_path',
        'is_active',
    ];

    protected $casts = [
        'examples' => 'json',
        'is_active' => 'boolean',
    ];

    // Отношения
    public function creator()
    {
        return $this->belongsTo(User::class, 'creator_id');
    }

    public function moneyTypes()
    {
        return $this->hasMany(MoneyTypeForEachApi::class);
    }

    public function documentation()
    {
        return $this->hasOne(ApiDocumentation::class);
    }

    public function ratings()
    {
        return $this->hasMany(ApiRating::class);
    }

    public function accessKeys()
    {
        return $this->hasMany(ApiAccessKey::class);
    }

    // Методы для Scout
    public function toSearchableArray()
    {
        return [
            'id' => $this->id,
            'name' => $this->name,
            'type' => $this->type,
            'protocol' => $this->protocol,
            'description' => $this->description,
            'version' => $this->version,
        ];
    }

    // Дополнительные методы
    public function getAverageRatingAttribute()
    {
        return $this->ratings()->avg('rating') ?: 0;
    }
}
