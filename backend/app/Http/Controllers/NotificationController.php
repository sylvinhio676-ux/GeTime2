<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;

class NotificationController extends Controller
{
    public function index(Request $request)
    {
        $user = $request->user();
        return successResponse($user->notifications()->latest()->get());
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
}
