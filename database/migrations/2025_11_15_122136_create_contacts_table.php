<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('contacts', function (Blueprint $table) {
            $table->id();

            // The user who sends the contact request (initiator)
            $table->unsignedBigInteger('requester_id');

            // The user who receives the contact request (target)
            $table->unsignedBigInteger('requested_id');

            // Optional display name chosen by the requester for this contact
            // e.g. "Work - John" or a custom name in the requester's address book
            $table->string('name')->nullable();

            // status: pending, accepted, rejected
            $table->enum('status', ['pending', 'accepted', 'rejected'])->default('pending');

            // When the contact was accepted (null unless accepted)
            $table->timestamp('accepted_at')->nullable();

            $table->timestamps();

            // Uniqueness: don't allow duplicate requests in the same direction
            $table->unique(['requester_id', 'requested_id']);

            // Foreign keys
            $table->foreign('requester_id')
                  ->references('id')->on('users')
                  ->onDelete('cascade');

            $table->foreign('requested_id')
                  ->references('id')->on('users')
                  ->onDelete('cascade');

            // Indexes to speed up lookups
            $table->index('status');
            $table->index(['requester_id']);
            $table->index(['requested_id']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('contacts');
    }
};
