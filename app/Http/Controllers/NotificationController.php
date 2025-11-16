<?php

namespace App\Http\Controllers;

use Illuminate\Support\Facades\Auth;

class NotificationController extends Controller
{
    /**
     * Mark a single notification as read.
     */
    public function markRead($id)
    {
        $user = Auth::user();

        $notification = $user->unreadNotifications()
            ->where('id', $id)
            ->first();

        if (!$notification) {
            return response()->json(['ok' => false], 404);
        }

        $notification->markAsRead();

        return response()->json(['ok' => true]);
    }

    /**
     * Mark all unread notifications as read.
     */
    public function markAllRead()
    {
        $user = Auth::user();

        $user->unreadNotifications->markAsRead();

        return response()->json(['ok' => true]);
    }
}
