<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class SubjectQuota extends Model
{
    protected $fillable = [
        'subject_id',
        'teacher_id',
        'total_quota',
        'used_quota',
        'remaining_quota',
    ];

    protected $casts = [
        'total_quota' => 'decimal:2',
        'used_quota' => 'decimal:2',
        'remaining_quota' => 'decimal:2',
    ];

    public function subject()
    {
        return $this->belongsTo(Subject::class);
    }

    public function teacher()
    {
        return $this->belongsTo(Teacher::class);
    }
}
