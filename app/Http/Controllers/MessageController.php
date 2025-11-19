<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Models\Group;
use App\Models\Message;
use App\Models\Contact; // <-- NEW: Import Contact model
use Illuminate\Support\Str;
use Illuminate\Support\Facades\Log;
use App\Models\Conversation;
use Illuminate\Http\Request;
use App\Events\SocketMessage;
use App\Models\MessageAttachment;
use Illuminate\Support\Facades\Auth;
use App\Http\Resources\MessageResource;
use Illuminate\Support\Facades\Storage;
use App\Http\Requests\StoreMessageRequest;


class MessageController extends Controller
{
    public function byUser(User $user)
    {
        if (!Auth::check()) {
            return redirect()->route('login');
        }

        $currentUser = Auth::user(); // Use a clear variable for the authenticated user

        \Log::info('Fetching messages for conversation between users:', [
            'auth_id' => $currentUser->id,
            'user_id' => $user->id
        ]);

        // 1. --- LOGIC TO FETCH CUSTOM CONTACT NAME ---
        // Find the accepted contact record between the current user and the target user
        $contactRecord = Contact::where(function ($query) use ($currentUser, $user) {
            $query->where('requester_id', $currentUser->id)
                  ->where('requested_id', $user->id);
        })->orWhere(function ($query) use ($currentUser, $user) {
            $query->where('requester_id', $user->id)
                  ->where('requested_id', $currentUser->id);
        })
        ->where('status', 'accepted')
        ->first();

        // Create the base conversation array (which is the target user's data)
        $selectedConversation = $user->toConversationArray();

        // 2. Attach the custom name if a contact record exists
        if ($contactRecord) {
            if ($contactRecord->requester_id === $currentUser->id) {
                // Current user is the requester, use their set name
                $selectedConversation['contact_name'] = $contactRecord->requester_name;
            } else {
                // Current user is the requested party, use their set name
                $selectedConversation['contact_name'] = $contactRecord->requested_name;
            }

            // Set the primary 'name' property to the custom name for display in the sidebar/list.
            // This is crucial to maintain consistency across the app on refresh.
            if (!empty($selectedConversation['contact_name'])) {
                 $selectedConversation['name'] = $selectedConversation['contact_name'];
            }
        }
        // --- END LOGIC ---

        // Original message fetching query
        $query = Message::with(['sender', 'receiver', 'attachments'])
            ->where(function($q) use ($user) {
                $q->where('sender_id', Auth::id())
                  ->where('receiver_id', $user->id);
            })->orWhere(function($q) use ($user) {
                $q->where('sender_id', $user->id)
                  ->where('receiver_id', Auth::id());
            });
            
        Log::info('SQL Query: ' . $query->toSql());
        Log::info('SQL Bindings: ', $query->getBindings());
        
        $messages = $query->latest()->paginate(10);
            
        \Log::info('Messages query result:', [
            'count' => $messages->count(),
            'total' => $messages->total()
        ]);

        return inertia('Home', [
            // Use the enriched array, which now includes the contact_name for persistence
            'selectedConversation' => $selectedConversation, 
            'messages' => MessageResource::collection($messages)
        ]);
    }

    public function byGroup(Group $group)
    {
        if (!Auth::check()) {
            return redirect()->route('login');
        }

        $messages = Message::with(['sender', 'attachments'])
            ->where('group_id', $group->id)
            ->latest()
            ->paginate(10);

        return inertia('Home', [
            'selectedConversation' => $group->toConversationArray(Auth::user()),
            'messages' => MessageResource::collection($messages)
        ]);
    }

    public function loadOlder(Message $message)
    {
        if ($message->group_id) {
            $message = Message::where('created_at', '<', $message->created_at)
                ->where('group_id', $message->group_id)
                ->latest()
                ->paginate(10);
        } else {
            $message = Message::where('created_at', '<', $message->created_at)
                ->where(function($q) use ($message) {
                    $q->where(function($query) use ($message) {
                        $query->where('sender_id', $message->sender_id)
                              ->where('receiver_id', $message->receiver_id);
                    })->orWhere(function($query) use ($message) {
                        $query->where('sender_id', $message->receiver_id)
                              ->where('receiver_id', $message->sender_id);
                    });
                })
                ->latest()
                ->paginate(10);
        }

        return MessageResource::collection($message);
    }

    public function store(StoreMessageRequest $request)
    {
        $data = $request->validated();
        $data['sender_id'] = Auth::id();
        $receiver = $data['receiver_id'] ?? null;
        $group = $data['group_id'] ?? null;
        $files = $data['attachments'] ?? null;

        $message = Message::create($data);

        $attachments = [];
        if ($files) {
            foreach ($files as $file) {
                $directory = 'attachments/'. Str::random(32);
                Storage::makeDirectory($directory);
                $model = [
                    'message_id' => $message->id,
                    'name' => $file->getClientOriginalName(),
                    'path' => $file->store($directory, 'public'),
                    'mime' => $file->getClientMimeType(),
                    'size' => $file->getSize(),
                ];
                $attachment = MessageAttachment::create($model);
                $attachments[] = $attachment;
            }
            $message->attachments = $attachments;
        }

        if ($receiver) {
            Conversation::updateConversationWithMessage($receiver, Auth::id(), $message);
        }

        if ($group) {
            Group::updateGroupWithMessage($group, $message);
        }
        
        SocketMessage::dispatch($message);
        return new MessageResource($message);
    }

    public function destroy(Message $message)
    {
        if ($message->sender_id !== Auth::id()) {
            return response()->json([
                'message' => 'You cannot delete this message',
            ], 403);
        }

        $group = null;
        $conversation = null;

        if ($message->group_id) {
            $group = Group::where('last_message_id', $message->id)->first(); 
        } else {
            $conversation = Conversation::where('last_message_id', $message->id)->first();
        }

        $message->delete();

        $lastMessage = null;
        if ($group) {
            $group = Group::find($group->id);
            $lastMessage = $group->lastmessage;
        } else if ($conversation) {
            $conversation = Conversation::find($conversation->id);
            $lastMessage = $conversation->lastmessage;
        }
        return response()->json([
            'message' => $lastMessage ? new MessageResource($lastMessage) : null,
        ]);
    }
}