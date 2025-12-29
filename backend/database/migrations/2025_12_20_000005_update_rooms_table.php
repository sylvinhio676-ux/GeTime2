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
        Schema::table('rooms', function (Blueprint $table) {
            $table->string('type_room', 20)->default('cours')->after('is_available');
            $table->dropConstrainedForeignId('programmation_id');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('rooms', function (Blueprint $table) {
            $table->foreignId('programmation_id')->nullable()->constrained()->cascadeOnDelete();
            $table->dropColumn('type_room');
        });
    }
};
