<?php

namespace App\Http\Controllers;

use App\Models\Contact;
use App\Models\User;
use App\Notifications\ContactRequested;
use App\Notifications\ContactAccepted;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Illuminate\Support\Facades\DB;

class ContactController extends Controller
{
    // List accepted contacts for current user
    public function index(Request $request)
    {
        $user = Auth::user();

        // NOTE: The logic for handling duplication is now primarily handled in the 
        // HandleInertiaRequests middleware, but this method is kept functional.
        // We will keep the filtering logic here for completeness, though it's
        // likely unused if the frontend relies on the Inertia shared props.
        $contacts = Contact::where(function ($q) use ($user) {
            $q->where('requester_id', $user->id)
              ->orWhere('requested_id', $user->id);
        })->where('status', 'accepted')->with(['requester', 'requested'])->get();

        // The following duplication logic is generally redundant if the DB is fixed 
        // to only store one record per pair, but is left for robustness.
        $byOther = [];

        foreach ($contacts as $c) {
            if ($c->requester_id === $user->id) {
                $other = $c->requested;
                $otherId = $other->id;
                $displayName = $c->name ?? $other->name;
                $addedByMe = true;
            } else {
                $other = $c->requester;
                $otherId = $other->id;
                $displayName = $c->name ?? $other->name;
                $addedByMe = false;
            }

            // If we already have an entry for this other user, prefer the one where added_by_me === true
            if (isset($byOther[$otherId])) {
                // If the existing entry was not added_by_me but this one is, replace it.
                if ($addedByMe && !$byOther[$otherId]['added_by_me']) {
                    $byOther[$otherId] = [
                        'id' => $otherId,
                        'name' => $displayName,
                        'added_by_me' => $addedByMe,
                        'contact_record_id' => $c->id,
                        'user' => $other,
                    ];
                }
                // Otherwise keep the existing (prefer the first one)
            } else {
                $byOther[$otherId] = [
                    'id' => $otherId,
                    'name' => $displayName,
                    'added_by_me' => $addedByMe,
                    'contact_record_id' => $c->id,
                    'user' => $other,
                ];
            }
        }

        // Convert to zero-indexed array
        $mapped = array_values($byOther);

        return $request->wantsJson()
            ? response()->json(['contacts' => $mapped])
            : back()->with('contacts', $mapped);
    }

    // List incoming pending requests
    public function incomingRequests(Request $request)
    {
        $user = Auth::user();
        $requests = Contact::where('requested_id', $user->id)
            ->where('status', 'pending')
            ->with('requester')
            ->orderByDesc('created_at')
            ->get()
            ->map(fn($c) => [
                'id' => $c->id,
                'requester_id' => $c->requester_id,
                'requester_name' => $c->requester->name,
                'requester_email' => $c->requester->email,
                'name_proposed' => $c->name,
                'status' => $c->status,
                'created_at' => $c->created_at->toDateTimeString(),
            ]);

        return $request->wantsJson()
            ? response()->json(['requests' => $requests])
            : back()->with('requests', $requests);
    }

    // Send a contact request
    public function store(Request $request)
{
    $user = Auth::user();

    $data = $request->validate([
        'email' => ['required','email'],
        'name' => ['nullable','string','max:255'],
    ]);

    if ($data['email'] === $user->email) {
        return $request->wantsJson()
            ? response()->json(['message' => "You can't add yourself."], 422)
            : back()->withErrors(['email' => "You can't add yourself."]);
    }

    $target = User::where('email', $data['email'])->first();
    if (!$target) {
        return $request->wantsJson()
            ? response()->json(['message' => "This user doesn't have an account on our platform."], 404)
            : back()->withErrors(['email' => "This user doesn't have an account on our platform."]);
    }
    
    // Check any existing contact record in either direction
    $existing = Contact::where(function($q) use ($user, $target) {
        $q->where('requester_id', $user->id)->where('requested_id', $target->id);
    })->orWhere(function($q) use ($user, $target) {
        $q->where('requester_id', $target->id)->where('requested_id', $user->id);
    })->first();

    if ($existing) {
        // CASE 1: Already accepted
        if ($existing->status === 'accepted') {
            return $request->wantsJson()
                ? response()->json(['message' => 'This user is already in your contacts.'], 200)
                : back()->with('info', 'This user is already in your contacts.');
        }

        // CASE 2: Pending request
        if ($existing->status === 'pending') {
            // You sent the request
            if ($existing->requester_id === $user->id) {
                return $request->wantsJson()
                    ? response()->json(['message' => "You already sent a request to {$target->email}."], 200)
                    : back()->with('info', "You already sent a request to {$target->email}.");
            } 
            // They sent you a request
            else {
                return $request->wantsJson()
                    ? response()->json(['message' => "Check your contact requests, you have a pending request from {$target->email}."], 409)
                    : back()->with('warning', "Check your contact requests, you have a pending request from {$target->email}.");
            }
        }

        // CASE 3: Rejected request
        if ($existing->status === 'rejected') {
            // You were rejected
            if ($existing->requester_id === $user->id) {
                return $request->wantsJson()
                    ? response()->json(['message' => "This contact already rejected your request."], 403)
                    : back()->with('error', "This contact already rejected your request.");
            }
            // You rejected them - allow them to request again by deleting old record
            else {
                $existing->delete();
                // Continue to create new request below
            }
        }
    }

    // No conflicting record - create new pending request
    $contact = Contact::create([
        'requester_id' => $user->id,
        'requested_id' => $target->id,
        'name' => $data['name'] ?? null,
        'status' => 'pending',
    ]);

    // Notify the target user
    $target->notify(new ContactRequested($user, $contact));

    return $request->wantsJson()
        ? response()->json(['message' => 'Contact request sent.', 'contact' => $contact])
        : back()->with('success', 'Contact request sent.');
}

// Update contact display name
public function update(Request $request, Contact $contact)
{
    $user = Auth::user();

    // Only the requester (person who added the contact) can update the display name
    if ($contact->requester_id !== $user->id) {
        return $request->wantsJson()
            ? response()->json(['message' => 'Unauthorized'], 403)
            : back()->with('error', 'Unauthorized');
    }

    $data = $request->validate([
        'name' => ['required', 'string', 'max:255'],
    ]);

    $contact->update(['name' => $data['name']]);

    return $request->wantsJson()
        ? response()->json(['message' => 'Contact name updated', 'contact' => $contact])
        : back()->with('success', 'Contact name updated.');
}


    // Accept a contact request
    // Uses Route Model Binding: Contact $contact
   public function accept(Request $request, Contact $contact)
{
    $user = Auth::user();

    // 1. Check if the user is the requested party
    if ($contact->requested_id !== $user->id) {
        return $request->wantsJson()
            ? response()->json(['message' => 'Unauthorized'], 403)
            : back()->with('error', 'Unauthorized');
    }

    // 2. If already accepted, return success (idempotent)
    if ($contact->status === 'accepted') {
        return $request->wantsJson()
            ? response()->json(['message' => 'Contact already accepted.'], 200)
            : back()->with('success', 'Contact already accepted.');
    }

    // Use a transaction to ensure atomic operations
    DB::transaction(function () use ($contact, $user) {
        // 3. Update the incoming request to accepted
        $contact->update([
            'status' => 'accepted',
            'accepted_at' => now(),
        ]);

        // 4. Delete any reciprocal/duplicate records
        Contact::where('requester_id', $user->id)
               ->where('requested_id', $contact->requester_id)
               ->where('id', '!=', $contact->id)
               ->delete();
        
        // 5. Mark the contact request notification as read
        $user->unreadNotifications()
            ->where('data->request_id', $contact->id)
            ->where('data->type', 'ContactRequested')
            ->update(['read_at' => now()]);
    });

    // Notify original requester about acceptance
    $contact->requester->notify(new ContactAccepted($user, $contact));

    return $request->wantsJson()
        ? response()->json(['message' => 'Contact accepted', 'contact' => $contact])
        : back()->with('success', 'Contact accepted.');
}

    // Reject a contact request
    public function reject(Request $request, $id)
{
    $user = Auth::user();
    $contact = Contact::findOrFail($id);

    if ($contact->requested_id !== $user->id) {
        return $request->wantsJson()
            ? response()->json(['message' => 'Unauthorized'], 403)
            : back()->with('error', 'Unauthorized');
    }

    $contact->update(['status' => 'rejected']);

    // Notify the original requester about rejection
    $contact->requester->notify(new \App\Notifications\ContactRejected($user, $contact));

    // Mark the original contact request notification as read
    $user->unreadNotifications()
        ->where('data->request_id', $contact->id)
        ->where('data->type', 'ContactRequested')
        ->update(['read_at' => now()]);

    return $request->wantsJson()
        ? response()->json(['message' => 'Contact request rejected', 'contact' => $contact])
        : back()->with('success', 'Contact request rejected.');
}

    // Delete/cancel contact
    public function destroy(Request $request, $id)
    {
        $user = Auth::user();
        $contact = Contact::findOrFail($id);

        if ($contact->requester_id !== $user->id && $contact->requested_id !== $user->id) {
            return $request->wantsJson()
                ? response()->json(['message' => 'Unauthorized'], 403)
                : back()->with('error', 'Unauthorized');
        }

        // When deleting, we must also delete the reciprocal record if it exists (for accepted status).
        // However, since we now enforce only one record in the DB for the relationship,
        // we only need to delete this one record.
        $contact->delete();

        return $request->wantsJson()
            ? response()->json(['message' => 'Contact removed'])
            : back()->with('success', 'Contact removed.');
    }
}