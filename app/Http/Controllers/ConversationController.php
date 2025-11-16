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

        // --------- Try group first ---------
        $group = Group::find($id);
        if ($group) {
            DB::transaction(function () use ($group) {
                // Nullify group's last_message_id to avoid foreign key constraint
                if (isset($group->last_message_id)) {
                    $group->last_message_id = null;
                    $group->save();
                }

                // Delete all messages & their attachments
                $messages = Message::where('group_id', $group->id)->get();
                foreach ($messages as $msg) {
                    $msg->attachments()->delete(); // delete attachments first
                    $msg->delete();
                }
            });

            // Broadcast event to all group members
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

        // --------- Else treat as user conversation ---------
        $otherId = $id;
        if ($otherId === $user->id) {
            return response()->json([
                'message' => "Can't clear conversation with yourself"
            ], 422);
        }

        DB::transaction(function () use ($user, $otherId) {
            // Find conversation
            $conversation = Conversation::where(function ($q) use ($user, $otherId) {
                $q->where('user_id1', $user->id)->where('user_id2', $otherId);
            })->orWhere(function ($q) use ($user, $otherId) {
                $q->where('user_id1', $otherId)->where('user_id2', $user->id);
            })->first();

            // Nullify last_message_id before deleting messages
            if ($conversation) {
                $conversation->last_message_id = null;
                $conversation->save();
            }

            // Delete all messages and attachments between the two users
            $messages = Message::where(function ($q) use ($user, $otherId) {
                $q->where('sender_id', $user->id)->where('receiver_id', $otherId);
            })->orWhere(function ($q) use ($user, $otherId) {
                $q->where('sender_id', $otherId)->where('receiver_id', $user->id);
            })->get();

            foreach ($messages as $msg) {
                $msg->attachments()->delete(); // delete attachments first
                $msg->delete();
            }
        });

        // Broadcast to both users
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
