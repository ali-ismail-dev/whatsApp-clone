<?php

namespace App\Notifications;

use App\Models\User;
use App\Models\Contact;
use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Notification;

class ContactRejected extends Notification
{
    use Queueable;

    public $rejector;
    public $contact;

    public function __construct(User $rejector, Contact $contact)
    {
        $this->rejector = $rejector;
        $this->contact = $contact;
    }

    public function via($notifiable)
    {
        return ['database'];
    }

    public function toDatabase($notifiable)
    {
        return [
            'type' => 'ContactRejected',
            'request_id' => $this->contact->id,
            'rejector_id' => $this->rejector->id,
            'rejector_name' => $this->rejector->name,
            'rejector_email' => $this->rejector->email,
        ];
    }
}