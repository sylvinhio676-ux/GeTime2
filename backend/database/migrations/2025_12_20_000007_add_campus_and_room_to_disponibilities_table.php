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
        Schema::table('disponibilities', function (Blueprint $table) {
            $table->foreignId('campus_id')->nullable()->constrained()->cascadeOnDelete();
            $table->foreignId('room_id')->nullable()->constrained()->nullOnDelete();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('disponibilities', function (Blueprint $table) {
            $table->dropConstrainedForeignId('room_id');
            $table->dropConstrainedForeignId('campus_id');
        });
    }
};
