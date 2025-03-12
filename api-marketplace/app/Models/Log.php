<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Log extends Model
{
    use HasFactory;

    protected $fillable = [
        'type',
        'user_id',
        'sales_id',
        'activation_event',
        'count_of_current_request',
        'metadata',
    ];

    protected $casts = [
        'activation_event' => 'boolean',
        'metadata' => 'json',
    ];

    // Отношения
    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function salesReceipt()
    {
        return $this->belongsTo(SalesReceipt::class, 'sales_id');
    }
}
