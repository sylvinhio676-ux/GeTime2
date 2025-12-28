<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Notifications\Notifiable;

class Etablishment extends Model
{
    use HasFactory,Notifiable;
    protected $fillable = [
        'etablisment_name',
        'description',
        'city',
    ];

    public function programmers(){
        return $this->hasMany(Programmer::class);
    }

    public function campus(){
        return $this->hasMany(Campus::class);
    }
}
