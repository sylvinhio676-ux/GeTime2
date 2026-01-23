<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('disponibilities', function (Blueprint $table) {
            if (!Schema::hasColumn('disponibilities', 'used')) {
                $table->boolean('used')->default(false)->after('etablishment_id');
            }
        });
    }

    public function down(): void
    {
        Schema::table('disponibilities', function (Blueprint $table) {
            if (Schema::hasColumn('disponibilities', 'used')) {
                $table->dropColumn('used');
            }
        });
    }
};
