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
        Schema::table('levels', function (Blueprint $table) {
            if (Schema::hasColumn('levels', 'specialty_id')) {
                $table->dropConstrainedForeignId('specialty_id');
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('levels', function (Blueprint $table) {
            if (!Schema::hasColumn('levels', 'specialty_id')) {
                $table->foreignId('specialty_id')->nullable()->constrained()->cascadeOnDelete();
            }
        });
    }
};
