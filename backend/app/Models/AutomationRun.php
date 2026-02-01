<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class AutomationRun extends Model
{
    protected $fillable = [
        'published_count',
        'skipped_count',
        'conflicts_count',
        'quota_alerts_count',
        'skipped_details',
    ];

    protected $casts = [
        'skipped_details' => 'array',
    ];
}
