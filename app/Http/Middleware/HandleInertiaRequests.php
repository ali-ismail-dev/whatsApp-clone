<?php

namespace App\Http\Middleware;

use App\Http\Resources\UserResource;
use Inertia\Middleware;
use App\Models\Conversation;
use App\Models\Contact;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage;

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
            // Use the notifications() relation (query builder) so we can limit
            $raw = $request->user()
                ->notifications()
                ->whereNull('read_at')
                ->latest('created_at')
                ->take(20)
                ->get();

            $notifications = $raw->map(function ($n) {
                return [
                    'id' => $n->id,
                    // store a short type (class basename) but keep original data
                    'type' => is_string($n->type) ? class_basename($n->type) : $n->type,
                    'data' => $n->data,
                    'created_at' => $n->created_at ? $n->created_at->toDateTimeString() : null,
                ];
            })->values()->all();
        }

        // Build contacts prop for non-admin users (accepted only)
        $contactsMapped = null;
        if (Auth::check() && $request->user()) {
            $user = $request->user();

            if (!$user->is_admin) {
                // fetch accepted contacts where the current user is either requester or requested
                $contacts = Contact::with(['requester', 'requested'])
                    ->where(function ($q) use ($user) {
                        $q->where('requester_id', $user->id)
                          ->orWhere('requested_id', $user->id);
                    })
                    ->where(function ($q) {
                        // accepted if status = 'accepted' OR accepted_at not null
                        $q->where('status', 'accepted')
                          ->orWhereNotNull('accepted_at');
                    })
                    ->orderByDesc('created_at')
                    ->get();

                $contactsMapped = $contacts->map(function ($c) use ($user) {
                    // determine the "other" user for this contact record
                    $other = $c->requester_id === $user->id ? $c->requested : $c->requester;

                    // safe fallback if relations not loaded for some reason
                    if (!$other) {
                        return null;
                    }

                    return [
                        // id of the other user (this becomes the conversation id for user-to-user)
                        'id' => $other->id,
                        // name to show in sidebar (contact local name if provided, otherwise the user's name)
                        'name' => $c->name ?? $other->name,
                        'added_by_me' => $c->requester_id === $user->id,
                        'contact_record_id' => $c->id,
                        // include a nested minimal user object (fields your frontend expects)
                        'user' => [
                            'id' => $other->id,
                            'name' => $other->name,
                            'email' => $other->email,
                            'avatar' => $other->avatar ?? null,
                            'avatar_url' => $other->avatar ? Storage::url($other->avatar) : null,
                            'is_admin' => (bool) ($other->is_admin ?? false),
                            'blocked_at' => $other->blocked_at ? (method_exists($other->blocked_at, 'toDateTimeString') ? $other->blocked_at->toDateTimeString() : $other->blocked_at) : null,
                            'created_at' => $other->created_at ? $other->created_at->toDateTimeString() : null,
                            'updated_at' => $other->updated_at ? $other->updated_at->toDateTimeString() : null,
                        ],
                        // keep contact metadata
                        'status' => $c->status,
                        'accepted_at' => $c->accepted_at ? $c->accepted_at->toDateTimeString() : null,
                        'created_at' => $c->created_at ? $c->created_at->toDateTimeString() : null,
                    ];
                })->filter()->values()->all();
            }
        }

        return [
            ...parent::share($request),
            'auth' => [
                'user' => Auth::id() ? new UserResource($request->user()) : null,
            ],
            // keep old conversations prop (admins still get the same sidebar experience)
            'conversations' => Auth::id() ? Conversation::getConversationsForSidebar($request->user()) : [],
            // provide contacts prop only for non-admin users (admins will get null)
            'contacts' => $contactsMapped,
            'notifications' => $notifications,
        ];
    }
}
