<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Notifications\Notifiable;

class Teacher extends Model
{
    use HasFactory, Notifiable;
    protected $fillable = [
        'registration_number',
        'user_id',
    ];

    // public static function booted(){
    //     static::creating(function($teacher){
    //         $teacher->registration_number = $teacher->RegistrationNumber();
    //     });
    // }

    public static function RegistrationNumber(){
        do{
            $year = date('Y');
            $last = self::where('registration_number','like',"T{$year}%")
                        ->orderBy('id','desc')
                        ->first();
            $number = $last ? ((int) substr($last->registration_number, -4) + 1) : 1;
            $registration_number = "T{$year}" . str_pad($number, 4, '0', STR_PAD_LEFT);
        }while(self::where('registration_number',$registration_number)->exists());
        return $registration_number;
    }

    public function user(){
        return $this->belongsTo(User::class);
    }

    public function subjects(){
        return $this->hasMany(Subject::class);
    }
}
