<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Notifications\Notifiable;

class Sector extends Model
{
    use HasFactory, Notifiable;
    protected $fillable = [
        'sector_name',
        'code',
        'school_id',
    ] ;

    public function specialities(){
        return $this->hasMany(Specialty::class);
    }

    public function school(){
        return $this->belongsTo(School::class);
    }
}
