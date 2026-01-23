<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Location extends Model
{
    use HasFactory;

    protected $fillable = [
        'city',
        'region',
        'country',
        'address',
        'latitude',
        'longitude',
        'validated',
    ];

    public function campuses()
    {
        return $this->hasMany(Campus::class);
    }
}
