<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use App\Models\User;

class AnalyticsEntry extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'campus_id',
        'campus_name',
        'distance_m',
        'duration_seconds',
        'path',
        'meta',
    ];

    protected $casts = [
        'path' => 'array',
        'meta' => 'array',
        'distance_m' => 'float',
        'duration_seconds' => 'float',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
