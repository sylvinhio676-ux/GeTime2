<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Notification;
use Illuminate\Notifications\Messages\MailMessage;

class ProgrammationNotification extends Notification
{
    use Queueable;

    private array $payload;

    public function __construct(array $payload)
    {
        $this->payload = $payload;
    }

    public function via($notifiable): array
    {
        $channels = ['database'];
        if (filter_var(env('NOTIFICATIONS_MAIL_ENABLED', false), FILTER_VALIDATE_BOOL)) {
            $channels[] = 'mail';
        }
        return $channels;
    }

    public function toMail($notifiable): MailMessage
    {
        $title = $this->payload['title'] ?? 'Notification GeTime';
        $message = $this->payload['message'] ?? '';
        $actionUrl = $this->payload['action_url'] ?? url('/dashboard');
        $actionLabel = $this->payload['action_label'] ?? 'Ouvrir GeTime';

        return (new MailMessage)
            ->subject($title)
            ->greeting("Bonjour {$notifiable->name},")
            ->line($message)
            ->action($actionLabel, $actionUrl)
            ->line('Merci d’utiliser GeTime.');
    }

    public function toDatabase($notifiable): array
    {
        return $this->payload;
    }
}
