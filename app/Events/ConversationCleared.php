<?php

namespace App\Events;

use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class ConversationCleared implements ShouldBroadcast
{
    use Dispatchable, SerializesModels;

    public $payload;

    /**
     * @param array $payload  Example: ['type' => 'user'|'group', 'id' => <conversation-id>, 'user_ids' => [...]]
     */
    public function __construct(array $payload)
    {
        $this->payload = $payload;
    }

    /**
     * Channels to broadcast on. We'll broadcast to each involved user's private channel.
     *
     * @return array
     */
    public function broadcastOn()
    {
        $channels = [];

        // payload must include user_ids array
        $userIds = $this->payload['user_ids'] ?? [];
        foreach ($userIds as $uid) {
            $channels[] = new PrivateChannel("user.{$uid}");
        }

        return $channels;
    }

    public function broadcastWith()
    {
        return $this->payload;
    }

    public function broadcastAs()
    {
        return 'conversation.cleared';
    }
}
