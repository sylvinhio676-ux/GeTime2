<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Notifications\Notifiable;
use Illuminate\Support\Facades\DB;

class Programmer extends Model
{
    use HasFactory, Notifiable;
    protected $fillable = [
        'registration_number',
        'user_id',
        'etablishment_id'
    ];

    // public static function booted()
    // {
    //     static::creating(function($programmer){
    //         $programmer->registration_number = $programmer->RegistrationNumber();
    //     });
    // }

    public static function RegistrationNumber(){
        $year = date('Y');
        
        // Utiliser une transaction avec verrou pour éviter les doublons
        return DB::transaction(function () use ($year) {
            $last = self::where('registration_number','like',"P{$year}%")
                        ->lockForUpdate()
                        ->orderBy('registration_number','desc')
                        ->first();
            $number = $last ? ((int) substr($last->registration_number, -4) + 1) : 1;
            return "P{$year}" . str_pad($number, 4, '0', STR_PAD_LEFT);
        });
    }

    public function user(){
        return $this->belongsTo(User::class);
    }

    public function programmations(){
        return $this->hasMany(Programmation::class);
    }

    public function specialities(){
        return $this->hasMany(Specialty::class);
    }

    public function etablishment(){
        return $this->belongsTo(Etablishment::class);
    }
}