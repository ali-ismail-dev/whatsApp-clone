<?php

use App\Http\Controllers\ContactController;
use App\Http\Controllers\ConversationController;
use App\Http\Controllers\GroupController;
use App\Http\Controllers\HomeController;
use App\Http\Controllers\MessageController;
use App\Http\Controllers\NotificationController;
use App\Http\Controllers\ProfileController;
use App\Http\Controllers\UserController;
use Illuminate\Foundation\Application;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

// All routes behind auth
Route::middleware('auth')->group(function () {
    Route::get('/', [HomeController::class, 'home'])->name('dashboard');

    // Chat routes
    Route::get('user/{user}', [MessageController::class, 'byUser'])->name('chat.user');
    Route::get('group/{group}', [MessageController::class, 'byGroup'])->name('chat.group');

    // Messages
    Route::get('message/older/{message}', [MessageController::class, 'loadOlder'])->name('message.loadOlder');
    Route::post('message', [MessageController::class, 'store'])->name('message.store');
    Route::delete('messages/{message}', [MessageController::class, 'destroy'])->name('messages.destroy');

    // Conversation actions
    // Clear conversation (user or group) — returns JSON and broadcasts event
    Route::post('/conversation/{id}/clear', [ConversationController::class, 'clear'])
        ->name('conversation.clear');

    // Groups
    Route::post('/group', [GroupController::class, 'store'])->name('group.store');
    Route::put('/group/{group}', [GroupController::class, 'update'])->name('group.update');
    Route::delete('/group/{group}', [GroupController::class, 'destroy'])->name('group.destroy');

    // Contacts (contact requests, acceptance, rejection, delete)
    Route::get('/contacts', [ContactController::class, 'index'])->name('contacts.index');
    Route::get('/contacts/requests', [ContactController::class, 'incomingRequests'])->name('contacts.requests');
    Route::post('/contacts', [ContactController::class, 'store'])->name('contacts.store');
    Route::post('/contacts/{contact}/accept', [ContactController::class, 'accept'])->name('contacts.accept');
    Route::post('/contacts/{contact}/reject', [ContactController::class, 'reject'])->name('contacts.reject');
    Route::delete('/contacts/{id}', [ContactController::class, 'destroy'])->name('contacts.destroy');

    // Notifications
    Route::post('/notifications/{id}/read', [NotificationController::class, 'markRead'])->name('notifications.read');
    Route::post('/notifications/read-all', [NotificationController::class, 'markAllRead'])->name('notifications.readAll');

    // User creation (open to any authenticated user)
    Route::post('/user', [UserController::class, 'store'])->name('user.store');

    // Block/unblock user — moved out of admin middleware so frontend calls won't 403
    Route::post('user/block-unblock/{user}', [UserController::class, 'blockUnBlock'])->name('user.blockUnBlock');

    // Admin-only actions
    Route::middleware('admin')->group(function () {
        Route::post('user/change-role/{user}', [UserController::class, 'changeRole'])->name('user.changeRole');
        // keep other admin-only routes here if needed
    });
});

// Dashboard route (also has auth,verified middleware already)
Route::get('/dashboard', function () {
    return Inertia::render('Dashboard');
})->middleware(['auth', 'verified'])->name('dashboard');

// Profile routes
Route::middleware('auth')->group(function () {
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');
});

require __DIR__ . '/auth.php';
