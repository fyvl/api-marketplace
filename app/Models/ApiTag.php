<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ApiTag extends Model
{
    use HasFactory;

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'name',
        'slug',
    ];

    /**
     * Get the APIs that belong to this tag.
     */
    public function apis()
    {
        return $this->belongsToMany(Api::class, 'api_tag', 'api_tag_id', 'api_id');
    }
}