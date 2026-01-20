<?php

namespace App\Listeners;

use App\Events\DisponibilityCreated;
use App\Events\DisponibilityUpdated;
use App\Events\DisponibilityDeleted;
use App\Models\Subject;
use App\Models\User;
use App\Notifications\TeacherDisponibilityChangedNotification;

class NotifyProgrammerOfDisponibilityChange
{
    public function handle($event): void
    {
        $d = $event->disponibility;

        // subject -> specialty -> programmer_id
        $subject = Subject::with('specialty.programmer.user')->find($d->subject_id);
        if (!$subject || !$subject->specialty || !$subject->specialty->programmer) {
            return;
        }

        // programmer is a model, we need the programmer's USER to notify (because tokens are on users)
        $programmerUser = $subject->specialty->programmer->user;
        if (!$programmerUser instanceof User) {
            return;
        }

        $action = match (true) {
            $event instanceof DisponibilityCreated => 'created',
            $event instanceof DisponibilityUpdated => 'updated',
            $event instanceof DisponibilityDeleted => 'deleted',
            default => 'updated',
        };

        $programmerUser->notify(new TeacherDisponibilityChangedNotification($d, $action));
    }
}
