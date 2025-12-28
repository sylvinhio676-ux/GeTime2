<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Notifications\Notifiable;

class School extends Model
{
    use HasFactory, Notifiable;
    protected $fillable = [
        'school_name',
        'description',
    ];

    public function sectors(){
        return $this->hasMany(Sector::class);
    }
}
