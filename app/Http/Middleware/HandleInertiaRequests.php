<?php

namespace App\Http\Middleware;

use App\Http\Resources\UserResource;
use Inertia\Middleware;
use App\Models\Conversation;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class HandleInertiaRequests extends Middleware
{
    /**
     * The root template that is loaded on the first page visit.
     *
     * @var string
     */
    protected $rootView = 'app';

    /**
     * Determine the current asset version.
     */
    public function version(Request $request): ?string
    {
        return parent::version($request);
    }

    /**
     * Define the props that are shared by default.
     *
     * @return array<string, mixed>
     */
    public function share(Request $request): array
    {
        // Prepare notifications safely: query unread notifications (where read_at is null)
        $notifications = [];
        if (Auth::check() && $request->user()) {
            // Use the notifications() relation (query builder) so we can paginate / limit
            $raw = $request->user()
                ->notifications()
                ->whereNull('read_at')
                ->latest('created_at')
                ->take(20)
                ->get();

            $notifications = $raw->map(function ($n) {
                return [
                    'id' => $n->id,
                    // store a short type (class basename) but keep original type in data if needed
                    'type' => is_string($n->type) ? class_basename($n->type) : $n->type,
                    'data' => $n->data,
                    'created_at' => $n->created_at ? $n->created_at->toDateTimeString() : null,
                ];
            })->values()->all();
        }

        return [
            ...parent::share($request),
            'auth' => [
                'user' => Auth::id() ? new UserResource($request->user()) : null,
            ],
            'conversations' => Auth::id() ? Conversation::getConversationsForSidebar($request->user()) : [],
            'notifications' => $notifications,
        ];
    }
}
