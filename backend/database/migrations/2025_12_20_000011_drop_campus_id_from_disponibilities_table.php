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
            if (Schema::hasColumn('disponibilities', 'campus_id')) {
                $table->dropConstrainedForeignId('campus_id');
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('disponibilities', function (Blueprint $table) {
            if (!Schema::hasColumn('disponibilities', 'campus_id')) {
                $table->foreignId('campus_id')->nullable()->constrained()->cascadeOnDelete();
            }
        });
    }
};
