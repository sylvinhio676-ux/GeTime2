<?php

namespace App\Events;

use App\Models\Programmation;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class ConflictDetected
{
    use Dispatchable, SerializesModels;

    public function __construct(
        public Programmation $programmation,
        public string $reason
    ) {}
}
