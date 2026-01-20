<?php

namespace App\Listeners;

use App\Events\TimetablePublished;
use App\Models\Programmation;
use App\Models\Subject;
use App\Models\User;
use App\Notifications\TimetablePublishedNotification;

class NotifyTeachersOfPublishedTimetable
{
    public function handle(TimetablePublished $event): void
    {
        // 1) séances publiées de la semaine
        $programmations = Programmation::query()
            ->where('year_id', $event->yearId)
            ->where('status', 'published')
            ->whereBetween('day', [$event->weekStart, $event->weekEnd]) // si day est DATE
            ->get(['id', 'subject_id']);

        if ($programmations->isEmpty()) return;

        $subjectIds = $programmations->pluck('subject_id')->unique()->values();

        // 2) subjects -> teacher_id -> teacher.user_id
        $subjects = Subject::with('teacher.user')
            ->whereIn('id', $subjectIds)
            ->get();

        $teacherUsers = $subjects
            ->map(fn($s) => $s->teacher?->user)
            ->filter(fn($u) => $u instanceof User)
            ->unique('id')
            ->values();

        foreach ($teacherUsers as $user) {
            $user->notify(new TimetablePublishedNotification(
                $event->weekStart,
                $event->weekEnd,
                $event->yearId
            ));
        }
    }
}
