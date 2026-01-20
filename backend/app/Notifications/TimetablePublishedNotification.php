<?php

namespace App\Notifications;

use App\Notifications\Channels\FcmChannel;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Notification;

class TimetablePublishedNotification extends Notification implements ShouldQueue
{
    use Queueable;

    public function __construct(
        public string $weekStart, // YYYY-MM-DD
        public string $weekEnd,   // YYYY-MM-DD
        public int $yearId
    ) {}

    public function via($notifiable): array
    {
        return ['database', FcmChannel::class];
    }

    public function toDatabase($notifiable): array
    {
        return [
            'type' => 'timetable_published',
            'week_start' => $this->weekStart,
            'week_end' => $this->weekEnd,
            'year_id' => $this->yearId,
        ];
    }

    public function toFcm($notifiable): array
    {
        return [
            'title' => "Emploi du temps publié",
            'body' => "Votre emploi du temps ({$this->weekStart} → {$this->weekEnd}) est disponible.",
            'data' => [
                'type' => 'timetable_published',
                'week_start' => $this->weekStart,
                'week_end' => $this->weekEnd,
                'year_id' => (string) $this->yearId,
            ],
        ];
    }
}
