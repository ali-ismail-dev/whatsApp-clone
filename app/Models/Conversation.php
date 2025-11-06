<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use App\Models\User;

class Conversation extends Model
{
    use \Illuminate\Database\Eloquent\Factories\HasFactory;

    protected $fillable = [
        'user_id1',
        'user_id2',
        'last_message_id'
    ];

    public function lastmessage()
    {
        return $this->belongsTo(Message::class, 'last_message_id');
    }

    public function user1()
    {
        return $this->belongsTo(User::class, 'user_id1');
    }
    public function user2()
    {
        return $this->belongsTo(User::class, 'user_id2');
    }

  public static function getConversationsForSidebar(User $exceptUser)
{
    $userConversations = User::getUsersExceptUser($exceptUser)->map(function (User $user) {
        return $user->toConversationArray();
    });

    $groupConversations = Group::getGroupsForUser($exceptUser)->map(function (Group $group) use ($exceptUser) {
        return $group->toConversationArray($exceptUser);
    });

    // Combine the collections
    $allConversations = $userConversations->concat($groupConversations);

    // --- FIX: Use a custom callback for safe sorting ---
    return $allConversations->sort(function ($a, $b) {
        // Safely retrieve the timestamp, defaulting to 0 if the property is missing or null
        $timeA = data_get($a, 'last_message.created_at', 0);
        $timeB = data_get($b, 'last_message.created_at', 0);

        // Convert timestamps to comparable format (or simply rely on string comparison if they are ISO strings)
        $timestampA = $timeA ? strtotime($timeA) : 0;
        $timestampB = $timeB ? strtotime($timeB) : 0;
        
        // Sort descending (b then a)
        return $timestampB <=> $timestampA;
    })->values()->all();
    // ----------------------------------------------------
}

    public static function updateConversationWithMessage($userId1, $userId2, $message)
    {
        $conversation = Conversation::where(function ($query) use ($userId1, $userId2) {
            $query->where('user_id1', $userId1)->where('user_id2', $userId2);
        })->orWhere(function ($query) use ($userId1, $userId2) {
            $query->where('user_id1', $userId2)->where('user_id2', $userId1);
        })->first();

        if (!$conversation) {
            Conversation::create([
                'user_id1' => $userId1,
                'user_id2' => $userId2,
                'last_message_id' => $message->id
            ]);
        } else {
            $conversation->update([
                'last_message_id' => $message->id
            ]);
        }
    }
}
