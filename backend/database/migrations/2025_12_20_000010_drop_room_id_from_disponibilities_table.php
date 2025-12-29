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
            if (Schema::hasColumn('disponibilities', 'room_id')) {
                $table->dropConstrainedForeignId('room_id');
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('disponibilities', function (Blueprint $table) {
            if (!Schema::hasColumn('disponibilities', 'room_id')) {
                $table->foreignId('room_id')->nullable()->constrained()->nullOnDelete();
            }
        });
    }
};
