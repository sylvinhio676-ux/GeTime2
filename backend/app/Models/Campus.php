<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Notifications\Notifiable;

class Campus extends Model
{
    use HasFactory,Notifiable;
    protected $fillable = [
        'campus_name',
        'city',
        'address',
        'etablishment_id',
        'latitude',
        'longitude',
        'location_id',
    ];

    public function rooms(){
        return $this->hasMany(Room::class);
    }

    public function etablishment(){
        return $this->belongsTo(Etablishment::class);
    }

    public function location(){
        return $this->belongsTo(Location::class);
    }
}
