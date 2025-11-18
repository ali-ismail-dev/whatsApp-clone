<?php

namespace App\Http\Controllers;

use App\Events\ConversationCleared;
use App\Models\Conversation;
use App\Models\Group;
use App\Models\Message;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;

class ConversationController extends Controller
{
    /**
     * Clear all messages for a conversation (user-user or group).
     */
    public function clear($id, Request $request)
{
    $user = Auth::user();
    $id = (int) $id;
    
    // Get type from request body
    $type = $request->input('type', 'user'); // default to 'user' if not provided

    // --------- Handle based on type ---------
    if ($type === 'group') {
        $group = Group::findOrFail($id);
        
        DB::transaction(function () use ($group) {
            $group->last_message_id = null;
            $group->save();

            $messages = Message::where('group_id', $group->id)->get();
            \Log::info("📝 Found {$messages->count()} messages to delete for group {$group->id}");
            
            Message::withoutEvents(function () use ($messages) {
                foreach ($messages as $msg) {
                    $msg->attachments()->delete();
                    $msg->delete();
                }
            });
            
            $remaining = Message::where('group_id', $group->id)->count();
            \Log::info("📝 After deletion: {$remaining} messages remaining");
        });

        $userIds = $group->users()->pluck('users.id')->toArray();
        if (!in_array($user->id, $userIds)) {
            $userIds[] = $user->id;
        }

        ConversationCleared::dispatch([
            'type' => 'group',
            'id' => $group->id,
            'user_ids' => $userIds,
            'message' => 'Group conversation cleared',
        ]);

        return response()->json([
            'message' => 'Group messages cleared',
            'group_id' => $group->id
        ]);
    }

    // --------- User conversation ---------
    $otherId = $id;
    if ($otherId === $user->id) {
        return response()->json([
            'message' => "Can't clear conversation with yourself"
        ], 422);
    }

    DB::transaction(function () use ($user, $otherId) {
        $conversation = Conversation::where(function ($q) use ($user, $otherId) {
            $q->where('user_id1', $user->id)->where('user_id2', $otherId);
        })->orWhere(function ($q) use ($user, $otherId) {
            $q->where('user_id1', $otherId)->where('user_id2', $user->id);
        })->first();

        if ($conversation) {
            $conversation->last_message_id = null;
            $conversation->save();
        }

        $messages = Message::where(function ($q) use ($user, $otherId) {
            $q->where('sender_id', $user->id)->where('receiver_id', $otherId);
        })->orWhere(function ($q) use ($user, $otherId) {
            $q->where('sender_id', $otherId)->where('receiver_id', $user->id);
        })->get();

        \Log::info("📝 Found {$messages->count()} messages to delete between users {$user->id} and {$otherId}");
        
        Message::withoutEvents(function () use ($messages) {
            foreach ($messages as $msg) {
                $msg->attachments()->delete();
                $msg->delete();
            }
        });

        $remaining = Message::where(function ($q) use ($user, $otherId) {
            $q->where('sender_id', $user->id)->where('receiver_id', $otherId);
        })->orWhere(function ($q) use ($user, $otherId) {
            $q->where('sender_id', $otherId)->where('receiver_id', $user->id);
        })->count();
        
        \Log::info("📝 After deletion: {$remaining} messages remaining");
    });

    ConversationCleared::dispatch([
        'type' => 'user',
        'id' => $otherId,
        'user_ids' => [$user->id, $otherId],
        'message' => 'Conversation cleared',
    ]);

    return response()->json([
        'message' => 'Conversation cleared',
        'other_user_id' => $otherId
    ]);
}
}
