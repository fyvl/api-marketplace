<?php

namespace App\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;

class User extends Authenticatable
{
    /** @use HasFactory<\Database\Factories\UserFactory> */
    use HasFactory, Notifiable;

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'username',
        'email',
        'password',
        'role',
        'first_name',
        'last_name',
        'patronymic',
        'birth_date',
        'phone',
    ];

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var list<string>
     */
    protected $hidden = [
        'password',
        'remember_token',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'birth_date' => 'date',
        ];
    }

    // Отношения
    public function createdApis()
    {
        return $this->hasMany(Api::class, 'creator_id');
    }

    public function salesAsSeller()
    {
        return $this->hasMany(SalesReceipt::class, 'seller_id');
    }

    public function salesAsCustomer()
    {
        return $this->hasMany(SalesReceipt::class, 'customer_id');
    }

    public function apiAccessKeys()
    {
        return $this->hasMany(ApiAccessKey::class);
    }

    public function logs()
    {
        return $this->hasMany(Log::class);
    }

    public function ratings()
    {
        return $this->hasMany(ApiRating::class);
    }
}
