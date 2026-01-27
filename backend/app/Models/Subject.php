<?php

namespace App\Models;

use App\Enum\TypeSubject;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Notifications\Notifiable;

class Subject extends Model
{
    use HasFactory, Notifiable;
    protected $fillable = [
        'subject_name',
        'hour_by_week',
        'total_hour',
        'type_subject',
        'color',
        'teacher_id',
        'specialty_id',
        'quota_hours',
    ];

    protected $casts = [
        'type_subject' => TypeSubject::class,
    ];

    // public function generateTypeSubjectOptions(){
    //     return TypeSubject::from($this->type_subject);
    // }

    // public function setTypeSubjectAttribute($value){
    //     $this->attributes['type_subject'] = $value->value;
    // }

    public function teacher(){
        return $this->belongsTo(Teacher::class);
    }

    public function disponibilities(){
        return $this->hasMany(Disponibility::class);
    }

    public function programmations(){
        return $this->hasMany(Programmation::class);
    }

    public function specialty(){
        return $this->belongsTo(Specialty::class);
    }

    public function quotas(){
        return $this->hasMany(SubjectQuota::class);
    }
}
