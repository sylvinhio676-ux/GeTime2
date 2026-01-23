<?php

namespace App\Events;

use App\Models\Disponibility;
use App\Models\Programmation;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class DisponibilityConverted
{
    use Dispatchable, SerializesModels;

    public function __construct(
        public Disponibility $disponibility,
        public Programmation $programmation,
    ) {}
}
