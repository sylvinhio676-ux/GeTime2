<?php

namespace App\Services;

use Illuminate\Support\Collection;
use Kreait\Firebase\Contract\Messaging;
use Kreait\Firebase\Messaging\CloudMessage;

class FcmService
{
    public function __construct(private ?Messaging $messaging = null) {}

    /**
     * @param array<int,string> $tokens
     * @param array<string,mixed> $data
     */
    public function sendToTokens(array $tokens, string $title, string $body, array $data = []): void
    {
        if (!(bool) config('services.fcm.enabled')) {
            return;
        }

        $tokens = array_values(array_unique(array_filter($tokens)));
        if (count($tokens) === 0) {
            return;
        }

        // FCM data must be string values
        $data = collect($data)->map(fn($v) => is_scalar($v) ? (string) $v : json_encode($v))->all();

        $message = CloudMessage::new()
            ->withNotification(['title' => $title, 'body' => $body])
            ->withData($data);

        // multicast
        $this->messaging?->sendMulticast($message, $tokens);
    }
}
