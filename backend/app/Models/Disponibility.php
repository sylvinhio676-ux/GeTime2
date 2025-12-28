<?php

namespace App\Models;

use App\Enum\JourEnum;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Notifications\Notifiable;

class Disponibility extends Model
{
    use HasFactory,Notifiable;
    protected $fillable = [
        'day',
        'hour_star',
        'hour_end',
        'subject_id'
    ];

    protected $casts =[
        'day' => JourEnum::class
    ];

    // public function generateDaysOptions(){
    //     return JourEnum::from($this->day);
    // }

    // public function setDayAttribute($value){
    //     $this->attributes['day'] = $value->value;
    // }
 
    public function subject(){
        return $this->belongsTo(Subject::class);
    }
}
