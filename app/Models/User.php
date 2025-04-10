<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

class User extends Authenticatable
{
    use HasApiTokens, HasFactory, Notifiable;

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'username',
        'email',
        'password',
        'role',
        'first_name',
        'last_name',
        'patronymic',
        'age',
        'birth_date',
        'phone',
    ];

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var array<int, string>
     */
    protected $hidden = [
        'password',
        'remember_token',
    ];

    /**
     * The attributes that should be cast.
     *
     * @var array<string, string>
     */
    protected $casts = [
        'email_verified_at' => 'datetime',
        'password' => 'hashed',
        'birth_date' => 'date',
    ];

    /**
     * Get the APIs created by this user.
     */
    public function createdApis()
    {
        return $this->hasMany(Api::class, 'creator_id');
    }

    /**
     * Get the purchased APIs.
     */
    public function purchasedApis()
    {
        return $this->hasMany(SalesReceipt::class, 'customer_id');
    }

    /**
     * Get the sold APIs.
     */
    public function soldApis()
    {
        return $this->hasMany(SalesReceipt::class, 'seller_id');
    }

    /**
     * Get the logs related to this user.
     */
    public function logs()
    {
        return $this->hasMany(Log::class);
    }

    /**
     * Get the reviews written by this user.
     */
    public function reviews()
    {
        return $this->hasMany(ApiReview::class);
    }

    /**
     * Get the support tickets created by this user.
     */
    public function supportTickets()
    {
        return $this->hasMany(SupportTicket::class);
    }

    /**
     * Get the support ticket replies by this user.
     */
    public function supportReplies()
    {
        return $this->hasMany(SupportTicketReply::class);
    }

    /**
     * Get the cart items for this user.
     */
    public function cartItems()
    {
        return $this->hasMany(CartItem::class);
    }

    /**
     * Check if user is a developer.
     */
    public function isDeveloper()
    {
        return $this->role === 'developer';
    }

    /**
     * Check if user is a customer.
     */
    public function isCustomer()
    {
        return $this->role === 'customer';
    }

    /**
     * Check if user is an admin.
     */
    public function isAdmin()
    {
        return $this->role === 'admin';
    }
}