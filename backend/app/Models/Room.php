<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Notifications\Notifiable;

class Room extends Model
{
    use HasFactory, Notifiable;
    protected $fillable = [
        'code',
        'capacity',
        'is_available',
        'campus_id',
        'programmation_id'
    ];

    protected $casts = [
        'is_available' => 'boolean',
    ];

    public function programmation(){
        return $this->belongsTo(Programmation::class);
    }

    public function campus(){
        return $this->belongsTo(Campus::class);
    }
}
