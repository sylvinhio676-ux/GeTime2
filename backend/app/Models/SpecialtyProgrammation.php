<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class SpecialtyProgrammation extends Model
{
    /** @use HasFactory<\Database\Factories\SpecialtyProgrammationFactory> */
    use HasFactory;

    protected $fillable = [
        'specialty_id',
        'programmation_id',
    ];
}
