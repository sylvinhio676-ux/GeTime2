<?php

namespace App\Http\Controllers;

use App\Services\FcmService;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;
use Illuminate\Support\Str;

class NotificationController extends Controller
{
    public function __construct(private FcmService $fcmService)
    {
    }

    public function index(Request $request)
    {
        $user = $request->user();
        $query = $user->notifications()->latest()->whereNull('archived_at');

        if ($request->filled('type')) {
            $query->where('type', $request->query('type'));
        }
        if ($request->filled('entity')) {
            $entity = $request->query('entity');
            $query->where('data->entity', 'like', "%{$entity}%");
        }
        if ($request->filled('from')) {
            $query->whereDate('created_at', '>=', Carbon::parse($request->query('from')));
        }
        if ($request->filled('to')) {
            $query->whereDate('created_at', '<=', Carbon::parse($request->query('to')));
        }

        if ($request->filled('category')) {
            $category = $request->query('category');
            $query->where('data->category', $category);
        }

        return successResponse($query->get());
    }

    public function archived(Request $request)
    {
        $user = $request->user();
        $notifications = $user->notifications()->whereNotNull('archived_at')->latest()->get();
        return successResponse($notifications);
    }

    public function unread(Request $request)
    {
        $user = $request->user();
        return successResponse($user->unreadNotifications()->latest()->get());
    }

    public function markRead(Request $request, string $id)
    {
        $user = $request->user();
        $notification = $user->notifications()->where('id', $id)->first();
        if (!$notification) {
            return notFoundResponse("Notification non trouvée");
        }
        $notification->markAsRead();
        return successResponse($notification, "Notification marquée comme lue");
    }

    public function markAllRead(Request $request)
    {
        $user = $request->user();
        $user->unreadNotifications->markAsRead();
        return successResponse(null, "Toutes les notifications sont lues");
    }

    public function archive(Request $request, string $id)
    {
        $user = $request->user();
        $notification = $user->notifications()->where('id', $id)->first();
        if (!$notification) {
            return notFoundResponse("Notification non trouvée");
        }
        $notification->archived_at = now();
        $notification->save();
        return successResponse($notification, "Notification archivée");
    }

    public function destroy(Request $request, string $id)
    {
        $user = $request->user();
        $notification = $user->notifications()->where('id', $id)->first();
        if (!$notification) {
            return notFoundResponse("Notification non trouvée");
        }
        $notification->delete();
        return successResponse(null, "Notification supprimée");
    }

    public function stats(Request $request)
    {
        $user = $request->user();
        $notifications = $user->notifications()->get();
        $groupByType = $notifications
            ->groupBy(fn($notification) => $notification->data['category'] ?? class_basename($notification->type))
            ->map(fn($items) => $items->count())
            ->toArray();
        $groupByDay = $notifications
            ->groupBy(fn($notification) => $notification->created_at->format('Y-m-d'))
            ->map(fn($items) => $items->count())
            ->toArray();

        return successResponse([
            'total' => $notifications->count(),
            'unread' => $notifications->whereNull('read_at')->count(),
            'archived' => $notifications->whereNotNull('archived_at')->count(),
            'per_type' => $groupByType,
            'per_day' => $groupByDay,
        ]);
    }

    public function templates(Request $request)
    {
        $templates = [
            [
                'id' => 'publication',
                'title' => 'Créneau publié',
                'message' => 'Un nouveau créneau a été publié. Consultez les détails sur votre tableau.',
                'category' => 'programmation',
            ],
            [
                'id' => 'securite',
                'title' => 'Sécurité du compte',
                'message' => 'Votre compte requiert une vérification supplémentaire.',
                'category' => 'sécurité',
            ],
            [
                'id' => 'reminder',
                'title' => 'Rappel de disponibilité',
                'message' => 'N’oubliez pas de mettre à jour vos disponibilités pour la semaine à venir.',
                'category' => 'rappel',
            ]
        ];
        return successResponse($templates);
    }

    public function schedule(Request $request)
    {
        $user = $request->user();
        $data = $request->validate([
            'title' => 'required|string|max:255',
            'message' => 'required|string',
            'scheduled_at' => 'required|date',
            'category' => 'nullable|string',
            'entity' => 'nullable|string',
        ]);

        $notification = $user->notifications()->create([
            'id' => (string) Str::uuid(),
            'type' => \App\Notifications\ProgrammationNotification::class,
            'data' => [
                'title' => $data['title'],
                'message' => $data['message'],
                'category' => $data['category'] ?? 'scheduled',
                'entity' => $data['entity'] ?? null,
                'scheduled_at' => $data['scheduled_at'],
            ],
            'read_at' => null,
        ]);

        return successResponse($notification, "Notification planifiée");
    }

    public function push(Request $request)
    {
        $user = $request->user();
        $data = $request->validate([
            'title' => 'required|string|max:255',
            'message' => 'required|string',
            'tokens' => 'sometimes|array',
            'tokens.*' => 'string',
            'category' => 'nullable|string',
        ]);

        $tokens = $data['tokens'] ?? $user->deviceTokens()->pluck('token')->toArray();
        $this->fcmService->sendToTokens($tokens, $data['title'], $data['message'], [
            'category' => $data['category'] ?? 'general',
        ]);

        return successResponse(['tokens' => $tokens], "Push envoyé");
    }
}
