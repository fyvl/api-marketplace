<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Log extends Model
{
    use HasFactory;

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'type',
        'user_id',
        'sales_id',
        'activation_event',
        'count_of_current_request',
    ];

    /**
     * The attributes that should be cast.
     *
     * @var array<string, string>
     */
    protected $casts = [
        'activation_event' => 'boolean',
    ];

    /**
     * Get the user related to this log.
     */
    public function user()
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Get the sale receipt related to this log.
     */
    public function salesReceipt()
    {
        return $this->belongsTo(SalesReceipt::class, 'sales_id');
    }
}