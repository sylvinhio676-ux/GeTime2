<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Carbon\Carbon;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

use function Symfony\Component\Clock\now;

class TeacherScheduleReminderNotification extends Notification
{
    use Queueable;

    /**
     * Create a new notification instance.
     */
    public function __construct(public $programmations)
    {
        //
    }

    /**
     * Get the notification's delivery channels.
     *
     * @return array<int, string>
     */
    public function via(object $notifiable): array
    {
        return ['mail', 'database', 'fcm'];
    }

    /**
     * Get the mail representation of the notification.
     */
    public function toMail(object $notifiable): MailMessage
    {
        return (new MailMessage)
            ->line('The introduction to the notification.')
            ->action('Notification Action', url('/'))
            ->line('Thank you for using our application!');
    }

    public function toFcm($notifiable){
        return [
            'title' => 'Rappel de votre planning',
            'body' => $this->programmations->map(fn($prog) => "{$prog->subject->subject_name} ({$prog->hour_star}-{$prog->hour_end})")->join(', '),
            'data' => $this->toArray($notifiable),
        ];
    }

    /**
     * Get the array representation of the notification.
     *
     * @return array<string, mixed>
     */
    public function toArray(object $notifiable): array
    {
        return [
            'type' => 'teacher_schedule_reminder',
            'title' => 'Rappel de votre planning du ' . Carbon::now()->addDay()->locale('fr')->dayName,
            'message' => 'Vous avez ' . $this->programmations->count() . ' seance(s) demain.',
            'slots' => $this->programmations->map(fn($prog) => [
                'subject' => $prog->subject->subject_name,
                'specialty' => $prog->subject->specialty?->specialty_name ?? $prog->subject->specialty?->name,
                'room' => $prog->room?->room_name ?? $prog->room?->code,
                'campus' => $prog->room?->campus?->campus_name,
                'etablisment' => $prog->room?->campus?->etablishment?->etablishment_name,
                'hour_star' => $prog->hour_star,
                'hour_end' => $prog->hour_end,
            ])->toArray(),
        ];
    }
}
