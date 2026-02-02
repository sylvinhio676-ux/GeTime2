<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('disponibilities', function (Blueprint $table) {
            if (!Schema::hasColumn('disponibilities', 'is_grouped')) {
                $table->boolean('is_grouped')->default(false)->after('used');
            }
        });
    }

    public function down(): void
    {
        Schema::table('disponibilities', function (Blueprint $table) {
            if (Schema::hasColumn('disponibilities', 'is_grouped')) {
                $table->dropColumn('is_grouped');
            }
        });
    }
};
