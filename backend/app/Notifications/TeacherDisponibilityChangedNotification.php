<?php

namespace App\Notifications;

use App\Enum\JourEnum;
use App\Models\Disponibility;
use App\Notifications\Channels\FcmChannel;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Notification;

class TeacherDisponibilityChangedNotification extends Notification implements ShouldQueue
{
    use Queueable;

    public function __construct(
        public Disponibility $disponibility,
        public string $action // created|updated|deleted
    ) {}

    public function via($notifiable): array
    {
        return ['database', FcmChannel::class];
    }

    public function toDatabase($notifiable): array
    {
        $d = $this->disponibility;

        return [
            'type' => 'teacher_disponibility_changed',
            'action' => $this->action,
            'disponibility_id' => $d->id,
            'subject_id' => $d->subject_id,
            'day' => $this->formatDay(),
            'hour_start' => $d->hour_star,
            'hour_end' => $d->hour_end,
        ];
    }

    public function toFcm($notifiable): array
    {
        $d = $this->disponibility;

        $title = "Disponibilité enseignant";
        $body = match ($this->action) {
            'created' => "Nouvelle disponibilité : {$this->formatDay()} {$d->hour_star}-{$d->hour_end}",
            'updated' => "Disponibilité modifiée : {$this->formatDay()} {$d->hour_star}-{$d->hour_end}",
            'deleted' => "Disponibilité supprimée : {$this->formatDay()} {$d->hour_star}-{$d->hour_end}",
            default => "Disponibilité mise à jour",
        };

        return [
            'title' => $title,
            'body' => $body,
            'data' => [
                'type' => 'teacher_disponibility_changed',
                'action' => $this->action,
                'disponibility_id' => $d->id,
                'subject_id' => $d->subject_id,
            ],
        ];
    }

    private function formatDay(): string
    {
        $day = $this->disponibility->day;
        if ($day instanceof JourEnum) {
            return $day->value;
        }
        return (string) ($day ?? '—');
    }
}
