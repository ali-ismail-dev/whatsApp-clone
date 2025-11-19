<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('contacts', function (Blueprint $table) {
            // Rename 'name' to 'requester_name'
            $table->renameColumn('name', 'requester_name');
            
            // Add new 'requested_name' column
            $table->string('requested_name')->nullable()->after('requester_name');
        });
    }

    public function down(): void
    {
        Schema::table('contacts', function (Blueprint $table) {
            $table->renameColumn('requester_name', 'name');
            $table->dropColumn('requested_name');
        });
    }
};