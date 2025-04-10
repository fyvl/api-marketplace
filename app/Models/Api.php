<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Api extends Model
{
    use HasFactory;

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'creator_id',
        'name',
        'type',
        'protocol',
        'version',
        'body',
        'documentation',
        'integration_guide',
        'usage_examples',
        'status',
        'endpoint_url',
        'authentication_method',
        'service_level',
    ];

    /**
     * Get the creator of this API.
     */
    public function creator()
    {
        return $this->belongsTo(User::class, 'creator_id');
    }

    /**
     * Get the monetization models for this API.
     */
    public function moneyTypes()
    {
        return $this->hasMany(MoneyTypesForEachApi::class);
    }

    /**
     * Get the categories of this API.
     */
    public function categories()
    {
        return $this->belongsToMany(ApiCategory::class, 'api_category', 'api_id', 'api_category_id');
    }

    /**
     * Get the tags of this API.
     */
    public function tags()
    {
        return $this->belongsToMany(ApiTag::class, 'api_tag', 'api_id', 'api_tag_id');
    }

    /**
     * Get the reviews for this API.
     */
    public function reviews()
    {
        return $this->hasMany(ApiReview::class);
    }

    /**
     * Get the sales related to this API.
     */
    public function sales()
    {
        return $this->hasManyThrough(
            SalesReceipt::class,
            MoneyTypesForEachApi::class,
            'api_id',
            'money_types_for_each_api_id'
        );
    }

    /**
     * Get the support tickets for this API.
     */
    public function supportTickets()
    {
        return $this->hasMany(SupportTicket::class);
    }

    /**
     * Calculate the average rating of this API.
     */
    public function averageRating()
    {
        return $this->reviews()->avg('rating') ?? 0;
    }

    /**
     * Get the lowest price of any plan for this API.
     */
    public function lowestPrice()
    {
        return $this->moneyTypes()->min('price') ?? 0;
    }
}