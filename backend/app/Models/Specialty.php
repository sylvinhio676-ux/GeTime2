<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Notifications\Notifiable;

class Specialty extends Model
{
    use HasFactory, Notifiable;
    protected $fillable = [
        'specialty_name',
        'code',
        'description',
        'number_student',
        'sector_id',
        'programmer_id',
        'level_id',
    ];

    public function subjects(){
        return $this->hasMany(Subject::class);
    }

    public function sector(){
        return $this->belongsTo(Sector::class);
    }

    public function level(){
        return $this->belongsTo(Level::class);
    }

    public function programmer(){
        return $this->belongsTo(Programmer::class);
    }

    public function programmations(){
        return $this->belongsToMany(Programmation::class, 'specialty_programmations', 'specialty_id', 'programmation_id');
    }
}
