<?php

namespace App\Notifications\Channels;

use App\Services\FcmService;
use Illuminate\Notifications\Notification;

class FcmChannel
{
    public function __construct(private FcmService $fcm) {}

    public function send($notifiable, Notification $notification): void
    {
        if (!method_exists($notification, 'toFcm')) {
            return;
        }

        $payload = $notification->toFcm($notifiable);

        $tokens = $notifiable->deviceTokens()->pluck('token')->toArray();

        $this->fcm->sendToTokens(
            $tokens,
            $payload['title'] ?? '',
            $payload['body'] ?? '',
            $payload['data'] ?? []
        );
    }
}
