<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('automation_runs', function (Blueprint $table) {
            $table->id();
            $table->integer('published_count')->default(0);
            $table->integer('skipped_count')->default(0);
            $table->integer('conflicts_count')->default(0);
            $table->integer('quota_alerts_count')->default(0);
            $table->json('skipped_details')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('automation_runs');
    }
};
