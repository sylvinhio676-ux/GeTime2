<?php

namespace App\Models;

use App\Enum\JourEnum;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Notifications\Notifiable;

class Programmation extends Model
{

    use HasFactory, Notifiable;
    protected $fillable = [
        'day',
        'hour_star',
        'hour_end',
        'subject_id',
        'programmer_id',
        'year_id',
    ];

    protected $casts = [
        'day' => JourEnum::class
    ];

    // public function generateDaysOptions(){
    //     return JourEnum::from($this->day);
    // }

    // public function setJourEnumAttribute(string $value){
    //     $this->attributes['day'] = $value;
    // }

    public function subject(){
        return $this->belongsTo(Subject::class);
    }

    public function rooms(){
        return $this->hasMany(Room::class);
    }

    public function year(){
        return $this->belongsTo(Year::class);
    }

    public function programer(){
        return $this->belongsTo(Programmer::class);
    }

    public function specialities(){
        return $this->belongsToMany(Specialty::class, 'spcialty_programmation', 'programmation_id', 'specialty_id');
    }
}
