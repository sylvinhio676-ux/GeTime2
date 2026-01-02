<?php

namespace App\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;
use App\Enum\RuleEnum;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;
use Spatie\Permission\Traits\HasRoles;

/**
 * App\Models\User
 *
 * @mixin \Eloquent
 * @method mixed getKey()
 * @property static \Illuminate\Database\Eloquent\Factories\Factory|null $factory
 */
class User extends Authenticatable
{
    /** @use HasFactory<\Database\Factories\UserFactory> */
    use HasApiTokens,HasFactory, Notifiable, HasRoles;

    /**
     * Spatie guard for API auth (Sanctum).
     *
     * @var string
     */
    protected $guard_name = 'sanctum';

    /**
     * Minimal static factory property to satisfy static analysis (no runtime change).
     *
     * @var string|null
     */
    protected static $factory;

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'name',
        'email',
        'phone',
        'password',
    ];

    // public function generateRoleUser(){
    //     return RuleEnum::from($this->role);
    // }

    // public function setRoleUserAttribut($value){
    //     $this->attributes['role'] = $value->value;
    // }

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
            'password' => 'hashed',
        ];
    }

    public function teacher(){
        return $this->hasOne(Teacher::class);
    }

    public function programmer(){
        return $this->hasOne(Programmer::class);
    }

    
}
