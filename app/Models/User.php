<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Illuminate\Support\Facades\Storage;
use Carbon\Carbon;

class User extends Authenticatable
{
    use HasFactory, Notifiable;

    protected $fillable = [
        'name',
        'avatar',
        'email',
        'email_verified_at',
        'password',
        'is_admin',
        'blocked_at',
    ];

    protected $hidden = [
        'password',
        'remember_token',
    ];

    // <-- correct casts property so Eloquent returns date fields as Carbon instances
    protected $casts = [
        'email_verified_at' => 'datetime',
        'password' => 'hashed',
        'blocked_at' => 'datetime',
    ];

    public function groups()
    {
        return $this->belongsToMany(Group::class, 'group_users');
    }

    public function sentMessages()
    {
        return $this->hasMany(Message::class, 'sender_id');
    }

    public function receivedMessages()
    {
        return $this->hasMany(Message::class, 'receiver_id');
    }

    public function messages()
    {
        return $this->sentMessages()->orWhere('receiver_id', $this->id);
    }

    public static function getUsersExceptUser(User $exceptUser)
{
    $isAdmin = $exceptUser->is_admin;

    // For admins: show all users
    if ($isAdmin) {
        $query = User::select([
            'users.*', 
            'messages.message as last_message', 
            'messages.created_at as last_message_date', 
            'users.blocked_at as blocked_at'
        ])
            ->where('users.id', '!=', $exceptUser->id)
            ->leftJoin('conversations', function($join) use ($exceptUser) {
                $join->on(function($subJoin) use ($exceptUser) {
                    $subJoin->on('conversations.user_id1', '=', 'users.id')
                            ->where('conversations.user_id2', '=', $exceptUser->id);
                })->orOn(function($subJoin) use ($exceptUser) {
                    $subJoin->on('conversations.user_id2', '=', 'users.id')
                            ->where('conversations.user_id1', '=', $exceptUser->id);
                });
            })
            ->leftJoin('messages', 'messages.id', '=', 'conversations.last_message_id')
            ->orderByDesc('messages.created_at')
            ->orderBy('users.name');

        return $query->get();
    }

    // For non-admins: show only accepted contacts with custom names
  $query = User::select([
    'users.*', 
    'messages.message as last_message', 
    'messages.created_at as last_message_date', 
    'users.blocked_at as blocked_at',
    'contacts.id as contact_record_id',  // ← ADD THIS
    // Select the appropriate custom name based on current user's role in the contact
    \DB::raw("CASE 
        WHEN contacts.requester_id = {$exceptUser->id} THEN contacts.requester_name
        WHEN contacts.requested_id = {$exceptUser->id} THEN contacts.requested_name
        ELSE NULL 
    END as custom_contact_name")
])
        ->where('users.id', '!=', $exceptUser->id)
        ->join('contacts', function($join) use ($exceptUser) {
            $join->on(function($subJoin) use ($exceptUser) {
                $subJoin->on('contacts.requested_id', '=', 'users.id')
                        ->where('contacts.requester_id', '=', $exceptUser->id);
            })->orOn(function($subJoin) use ($exceptUser) {
                $subJoin->on('contacts.requester_id', '=', 'users.id')
                        ->where('contacts.requested_id', '=', $exceptUser->id);
            });
        })
        ->where(function($q) {
            $q->where('contacts.status', 'accepted')
              ->orWhereNotNull('contacts.accepted_at');
        })
        ->leftJoin('conversations', function($join) use ($exceptUser) {
            $join->on(function($subJoin) use ($exceptUser) {
                $subJoin->on('conversations.user_id1', '=', 'users.id')
                        ->where('conversations.user_id2', '=', $exceptUser->id);
            })->orOn(function($subJoin) use ($exceptUser) {
                $subJoin->on('conversations.user_id2', '=', 'users.id')
                        ->where('conversations.user_id1', '=', $exceptUser->id);
            });
        })
        ->leftJoin('messages', 'messages.id', '=', 'conversations.last_message_id')
        ->orderByDesc('messages.created_at')
        ->orderBy('users.name');

    return $query->get();
}

    public function toConversationArray()
    {
        $lastMessageContent = $this->last_message ?? null;
        $rawLastMessageDate = $this->last_message_date ?? null;

        $lastMessageObject = null;
        $lastMessageIso = null;

        if ($rawLastMessageDate) {
            try {
                // If it's already a Carbon instance
                if ($rawLastMessageDate instanceof Carbon) {
                    $dt = $rawLastMessageDate;
                } else {
                    $str = (string) $rawLastMessageDate;

                    // If the string looks like an ISO timestamp with timezone info, parse it directly
                    if (strpos($str, 'T') !== false || strpos($str, '+') !== false || strpos($str, 'Z') !== false) {
                        $dt = Carbon::parse($str); // will respect offset if present
                    } else {
                        // Otherwise it's likely "Y-m-d H:i:s" from DB -> treat as UTC explicitly
                        $dt = Carbon::createFromFormat('Y-m-d H:i:s', $str, 'UTC');
                    }
                }

                // Convert to application timezone for display (so it contains offset)
                $appTz = config('app.timezone') ?? date_default_timezone_get();
                $dt = $dt->setTimezone($appTz);

                // Use ISO-8601 string (includes timezone offset). Frontend JS will parse this correctly.
                $lastMessageIso = $dt->toIso8601String();

            } catch (\Exception $e) {
                // fallback: keep original string
                $lastMessageIso = (string) $rawLastMessageDate;
            }
        }

        if ($lastMessageContent && $lastMessageIso) {
            $lastMessageObject = [
                'message' => $lastMessageContent,
                'created_at' => $lastMessageIso,
            ];
        }

        return [
            'is_user' => true,
            'id' => $this->id,
            'contact_record_id' => $this->contact_record_id ?? null,  // ← ADD THIS

            'name' => $this->custom_contact_name ?? $this->name,
            'is_group' => false,
            'is_admin' => (bool) $this->is_admin,
            'avatar_url' => $this->avatar ? Storage::url($this->avatar) : null,

            'updated_at' => $this->updated_at,
            'created_at' => $this->created_at,

            'blocked_at' => $this->blocked_at ? ($this->blocked_at instanceof Carbon ? $this->blocked_at->toDateTimeString() : (string) $this->blocked_at) : null,

            'last_message' => $lastMessageObject,
            'last_message_date' => $lastMessageIso,
            'last_message_time' => $lastMessageIso,
        ];
    }
}
