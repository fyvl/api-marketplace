<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class SupportTicket extends Model
{
    use HasFactory;

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'user_id',
        'api_id',
        'subject',
        'message',
        'status',
    ];

    /**
     * Get the user who created this ticket.
     */
    public function user()
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Get the API this ticket is about.
     */
    public function api()
    {
        return $this->belongsTo(Api::class);
    }

    /**
     * Get the replies to this ticket.
     */
    public function replies()
    {
        return $this->hasMany(SupportTicketReply::class, 'ticket_id');
    }
}