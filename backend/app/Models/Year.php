<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Notifications\Notifiable;

class Year extends Model
{
    use HasFactory, Notifiable;
    protected $fillable = [
        'date_star',
        'date_end',
    ];

    public function programmations(){
        return $this->hasMany(Programmation::class);
    }
}