<?php

namespace App\Providers;

use Illuminate\Foundation\Support\Providers\EventServiceProvider as ServiceProvider;

use App\Events\DisponibilityCreated;
use App\Events\DisponibilityUpdated;
use App\Events\DisponibilityDeleted;
use App\Events\TimetablePublished;

use App\Listeners\NotifyProgrammerOfDisponibilityChange;
use App\Listeners\NotifyTeachersOfPublishedTimetable;

class EventServiceProvider extends ServiceProvider
{
    protected $listen = [
        DisponibilityCreated::class => [
            NotifyProgrammerOfDisponibilityChange::class,
        ],
        DisponibilityUpdated::class => [
            NotifyProgrammerOfDisponibilityChange::class,
        ],
        DisponibilityDeleted::class => [
            NotifyProgrammerOfDisponibilityChange::class,
        ],
        TimetablePublished::class => [
            NotifyTeachersOfPublishedTimetable::class,
        ],
    ];
}
