<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Email;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Mail;

class EmailController extends Controller
{
    /**
     * List emails by folder (inbox/sent).
     */
    public function index(Request $request)
    {
        $folder = $request->query('folder', 'sent');
        $direction = $folder === 'inbox' ? 'inbox' : 'sent';
        $user = $request->user();
        $isAdmin = $user && method_exists($user, 'hasAnyRole')
            ? $user->hasAnyRole(['super_admin', 'admin'])
            : false;

        $emails = Email::query()
            ->when(
                $user,
                function ($query) use ($user, $isAdmin) {
                    if ($isAdmin) {
                        $query->where(function ($inner) use ($user) {
                            $inner->where('user_id', $user->id)
                                  ->orWhereNull('user_id');
                        });
                        return;
                    }

                    $query->where('user_id', $user->id);
                }
            )
            ->where('direction', $direction)
            ->latest()
            ->get();

        return response()->json(['data' => $emails], 200);
    }

    /**
     * Mailtrap webhook (Email Sandbox).
     */
    public function receiveMailtrap(Request $request)
    {
        $expectedToken = env('MAILTRAP_WEBHOOK_TOKEN');
        $incomingToken = $request->header('X-Mailtrap-Token') ?? $request->query('token');
        if ($expectedToken && $incomingToken !== $expectedToken) {
            return response()->json(['error' => 'Unauthorized webhook.'], 401);
        }

        $payload = $request->all();
        $subject = $payload['subject'] ?? ($payload['message']['subject'] ?? 'Sans objet');
        $from = $payload['from'] ?? ($payload['from_email'] ?? ($payload['message']['from_email'] ?? 'inconnu'));
        $to = $payload['to'] ?? ($payload['to_email'] ?? ($payload['message']['to_email'] ?? []));
        $toList = is_array($to) ? $to : [$to];
        $recipientEmails = $this->extractEmails($toList);
        $body = $payload['text'] ?? ($payload['html'] ?? ($payload['message']['text'] ?? ($payload['message']['html'] ?? '')));

        $email = null;
        $users = $recipientEmails ? User::whereIn('email', $recipientEmails)->get() : collect();
        if ($users->isNotEmpty()) {
            foreach ($users as $user) {
                $email = Email::create([
                    'user_id' => $user->id,
                    'direction' => 'inbox',
                    'from_address' => is_string($from) ? $from : json_encode($from),
                    'to_address' => implode(', ', array_filter($toList)),
                    'subject' => $subject,
                    'message' => $body ?: 'Message sans contenu.',
                    'status' => 'received',
                    'meta' => [
                        'unread' => true,
                        'payload' => $payload,
                    ],
                ]);
            }
        } else {
            $email = Email::create([
                'user_id' => null,
                'direction' => 'inbox',
                'from_address' => is_string($from) ? $from : json_encode($from),
                'to_address' => implode(', ', array_filter($toList)),
                'subject' => $subject,
                'message' => $body ?: 'Message sans contenu.',
                'status' => 'received',
                'meta' => [
                    'unread' => true,
                    'payload' => $payload,
                ],
            ]);
        }

        return response()->json(['message' => 'Webhook received.', 'data' => $email], 200);
    }

    /**
     * Send an email (single or multiple recipients).
     */
    public function send(Request $request)
    {
        $request->validate([
            'to' => 'required',
            'subject' => 'required|string|max:255',
            'message' => 'required|string',
        ]);

        try {
            $to = $request->input('to');
            $recipients = is_array($to) ? $to : [$to];
            $recipients = array_filter($recipients);

            foreach ($recipients as $email) {
                if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
                    return response()->json(['error' => 'Invalid recipient email.', 'details' => $email], 422);
                }
            }

            Mail::raw($request->input('message'), function ($message) use ($request, $recipients) {
                $message->to($recipients)
                        ->subject($request->input('subject'));
            });

            $email = Email::create([
                'user_id' => $request->user()?->id,
                'direction' => 'sent',
                'from_address' => config('mail.from.address'),
                'to_address' => implode(', ', $recipients),
                'subject' => $request->input('subject'),
                'message' => $request->input('message'),
                'status' => 'sent',
            ]);

            return response()->json(['message' => 'Email sent successfully.', 'data' => $email], 200);
        } catch (\Exception $e) {
            return response()->json(['error' => 'Failed to send email.', 'details' => $e->getMessage()], 500);
        }
    }

    /**
     * Sync inbox messages from Mailtrap Sandbox API.
     */
    public function syncMailtrap(Request $request)
    {
        $token = env('MAILTRAP_API_TOKEN');
        $inboxId = env('MAILTRAP_INBOX_ID');
        $baseUrl = rtrim(env('MAILTRAP_API_BASE', 'https://mailtrap.io/api'), '/');
        $accountId = env('MAILTRAP_ACCOUNT_ID');

        if (!$token || !$inboxId) {
            return response()->json(['error' => 'Mailtrap API not configured.'], 422);
        }

        $headers = [
            'Api-Token' => $token,
            'Accept' => 'application/json',
        ];

        if ($accountId) {
            $response = Http::withHeaders($headers)
                ->get("{$baseUrl}/accounts/{$accountId}/inboxes/{$inboxId}/messages");
        } else {
            $response = Http::withHeaders($headers)
                ->get("{$baseUrl}/inboxes/{$inboxId}/messages");
        }

        if (!$response->ok()) {
            Log::warning('Mailtrap sync failed.', [
                'status' => $response->status(),
                'body' => $response->body(),
            ]);
            return response()->json([
                'error' => 'Failed to fetch Mailtrap messages.',
                'details' => $response->body(),
            ], 500);
        }

        $created = 0;
        $payload = $response->json();
        $messages = $payload['messages'] ?? $payload['data'] ?? $payload;
        if (!is_array($messages)) {
            return response()->json([
                'error' => 'Invalid Mailtrap response.',
                'details' => $payload,
            ], 500);
        }
        foreach ($messages as $message) {
            $messageId = $message['id'] ?? null;
            $toList = isset($message['to_email']) ? (array) $message['to_email'] : [];
            $recipientEmails = $this->extractEmails($toList);
            $users = $recipientEmails ? User::whereIn('email', $recipientEmails)->get() : collect();

            if ($users->isNotEmpty()) {
                foreach ($users as $user) {
                    if ($messageId && Email::where('meta->message_id', $messageId)->where('user_id', $user->id)->exists()) {
                        continue;
                    }
                    Email::create([
                        'user_id' => $user->id,
                        'direction' => 'inbox',
                        'from_address' => $message['from_email'] ?? 'inconnu',
                        'to_address' => isset($message['to_email']) ? implode(', ', (array) $message['to_email']) : null,
                        'subject' => $message['subject'] ?? 'Sans objet',
                        'message' => $message['text'] ?? ($message['html'] ?? 'Message sans contenu.'),
                        'status' => 'received',
                        'meta' => [
                            'message_id' => $messageId,
                            'unread' => true,
                        ],
                    ]);
                    $created++;
                }
                continue;
            }

            if ($messageId && Email::where('meta->message_id', $messageId)->whereNull('user_id')->exists()) {
                continue;
            }

            Email::create([
                'user_id' => null,
                'direction' => 'inbox',
                'from_address' => $message['from_email'] ?? 'inconnu',
                'to_address' => isset($message['to_email']) ? implode(', ', (array) $message['to_email']) : null,
                'subject' => $message['subject'] ?? 'Sans objet',
                'message' => $message['text'] ?? ($message['html'] ?? 'Message sans contenu.'),
                'status' => 'received',
                'meta' => [
                    'message_id' => $messageId,
                    'unread' => true,
                ],
            ]);
            $created++;
        }

        return response()->json(['message' => 'Mailtrap inbox synced.', 'created' => $created], 200);
    }

    /**
     * Mark inbox email as read.
     */
    public function markRead(Request $request, Email $email)
    {
        $user = $request->user();
        $isAdmin = $user && method_exists($user, 'hasAnyRole')
            ? $user->hasAnyRole(['super_admin', 'admin'])
            : false;

        if (!$user) {
            return response()->json(['error' => 'Unauthenticated.'], 401);
        }

        if ($email->direction !== 'inbox') {
            return response()->json(['error' => 'Only inbox emails can be marked as read.'], 422);
        }

        if ($email->user_id) {
            if (!$isAdmin && $email->user_id !== $user->id) {
                return response()->json(['error' => 'Forbidden.'], 403);
            }
        } elseif (!$isAdmin) {
            return response()->json(['error' => 'Forbidden.'], 403);
        }

        $meta = $email->meta ?? [];
        $meta['unread'] = false;
        $email->meta = $meta;
        $email->status = 'read';
        $email->save();

        return response()->json(['message' => 'Email marked as read.', 'data' => $email], 200);
    }

    private function extractEmails(array $values): array
    {
        $emails = [];
        foreach ($values as $value) {
            if (is_array($value)) {
                $emails = array_merge($emails, $this->extractEmails($value));
                continue;
            }
            if (!is_string($value)) {
                continue;
            }
            $value = trim($value);
            if (filter_var($value, FILTER_VALIDATE_EMAIL)) {
                $emails[] = strtolower($value);
                continue;
            }
            if (preg_match('/<([^>]+)>/', $value, $matches)) {
                $candidate = trim($matches[1]);
                if (filter_var($candidate, FILTER_VALIDATE_EMAIL)) {
                    $emails[] = strtolower($candidate);
                }
            }
        }

        return array_values(array_unique($emails));
    }
}
