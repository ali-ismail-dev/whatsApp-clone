<?php

namespace App\Events;

use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PresenceChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;
use Laravel\Reverb\Protocols\Pusher\Channels\PrivateChannel;

class ContactNameUpdated implements ShouldBroadcast
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    /**
     * The ID of the user who performed the name update.
     *
     * @var int
     */
    public $userId;

    /**
     * The ID of the user whose contact name was updated.
     * (The "other" user in the conversation).
     *
     * @var int
     */
    public $otherId;

    /**
     * The new display name set by the user.
     *
     * @var string
     */
    public $newName;

    /**
     * Create a new event instance.
     */
    public function __construct(int $userId, int $otherId, string $newName)
    {
        $this->userId = $userId;
        $this->otherId = $otherId;
        $this->newName = $newName;
    }

    /**
     * Get the channels the event should broadcast on.
     * We broadcast on a private channel specific to the user who updated the name
     * so their browser can listen and update the UI.
     *
     * @return array<int, \Illuminate\Broadcasting\Channel>
     */
    public function broadcastOn(): array
    {
        return [
            new PrivateChannel("user.{$this->userId}"),
        ];
    }

    /**
     * The event's broadcast name.
     *
     * @return string
     */
    public function broadcastAs(): string
    {
        return 'contact-name-updated';
    }

    /**
     * Get the data to broadcast.
     *
     * @return array
     */
    public function broadcastWith(): array
    {
        return [
            'other_id' => $this->otherId,
            'new_name' => $this->newName,
        ];
    }
}