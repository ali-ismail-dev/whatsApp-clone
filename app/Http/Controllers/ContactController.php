<?php

namespace App\Http\Controllers;

use App\Models\Contact;
use App\Models\User;
use App\Notifications\ContactRequested;
use App\Notifications\ContactAccepted;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
class ContactController extends Controller
{
    // List accepted contacts for current user
    public function index(Request $request)
    {
        $user = Auth::user();

        $contacts = Contact::where(function ($q) use ($user) {
            $q->where('requester_id', $user->id)
              ->orWhere('requested_id', $user->id);
        })->where('status', 'accepted')->with(['requester', 'requested'])->get();

        $mapped = $contacts->map(function ($c) use ($user) {
            if ($c->requester_id === $user->id) {
                return [
                    'id' => $c->requested->id,
                    'name' => $c->name ?? $c->requested->name,
                    'added_by_me' => true,
                    'contact_record_id' => $c->id,
                    'user' => $c->requested,
                ];
            } else {
                return [
                    'id' => $c->requester->id,
                    'name' => $c->name ?? $c->requester->name,
                    'added_by_me' => false,
                    'contact_record_id' => $c->id,
                    'user' => $c->requester,
                ];
            }
        });

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
        return back()->withErrors(['email' => "You can't add yourself."]);
    }

    $target = User::where('email', $data['email'])->first();
    if (!$target) {
        return back()->withErrors(['email' => "This user doesn't have an account on our platform."]);
    }

    // Prevent duplicate requests
    $exists = Contact::where('requester_id', $user->id)
        ->where('requested_id', $target->id)
        ->first();

    if ($exists) {
        if ($exists->status === 'accepted') {
            return back()->with('success', 'This user is already in your contacts.');
        }
        if ($exists->status === 'pending') {
            return back()->with('success', 'Contact request already sent and pending.');
        }
    }

    $contact = Contact::create([
        'requester_id' => $user->id,
        'requested_id' => $target->id,
        'name' => $data['name'] ?? null,
        'status' => 'pending',
    ]);

    $target->notify(new ContactRequested($user, $contact));

    return back()->with('success', 'Contact request sent.');
}


   // Accept a contact request
    // Parameter changed from $id to Contact $contact to use Route Model Binding
    public function accept(Request $request, Contact $contact)
    {
        $user = Auth::user();

        // 1. Check if the user is the requested party
        if ($contact->requested_id !== $user->id) {
            return $request->wantsJson()
                ? response()->json(['message' => 'Unauthorized'], 403)
                : back()->with('error', 'Unauthorized');
        }

        // 2. Check for acceptance status (Addressing the 409 Conflict)
        if ($contact->status === 'accepted') {
            // Instead of throwing a 409 Conflict error, return a 200 OK success 
            // if the action was already completed. This is common for idempotent operations.
            return $request->wantsJson()
                ? response()->json(['message' => 'Contact already accepted.'], 200)
                : back()->with('success', 'Contact already accepted.');
        }

        $contact->update([
            'status' => 'accepted',
            'accepted_at' => now(),
        ]);

        // Create the reciprocal contact record for the other user's view
        $reciprocal = Contact::firstOrCreate(
            ['requester_id' => $user->id, 'requested_id' => $contact->requester_id],
            ['status' => 'accepted', 'accepted_at' => now()]
        );

        $contact->requester->notify(new ContactAccepted($user, $contact));

        return $request->wantsJson()
            ? response()->json(['message' => 'Contact accepted', 'contact' => $contact, 'reciprocal' => $reciprocal])
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

        $contact->delete();

        return $request->wantsJson()
            ? response()->json(['message' => 'Contact removed'])
            : back()->with('success', 'Contact removed.');
    }
}
