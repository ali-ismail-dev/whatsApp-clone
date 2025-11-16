<?php

namespace App\Notifications;

use App\Models\User;
use App\Models\Contact;
use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Notification;

class ContactRequested extends Notification
{
    use Queueable;

    public $sender;
    public $contact;

    public function __construct(User $sender, Contact $contact)
    {
        $this->sender = $sender;
        $this->contact = $contact;
    }

    public function via($notifiable)
    {
        return ['database'];
    }

    public function toDatabase($notifiable)
    {
        return [
            'type' => 'ContactRequested',
            'request_id' => $this->contact->id,
            'requester_id' => $this->sender->id,
            'requester_name' => $this->sender->name,
            'requester_email' => $this->sender->email,
            'name_proposed' => $this->contact->name,
        ];
    }
}
