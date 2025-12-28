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
        Schema::create('programmations', function (Blueprint $table) {
            $table->id();
            $table->string('day');
            $table->string('hour_star');
            $table->string('hour_end');
            $table->foreignId('subject_id')->constrained()->cascadeOnDelete();
            $table->foreignId('programmer_id')->constrained()->cascadeOnDelete();
            $table->foreignId('year_id')->constrained()->cascadeOnDelete();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('programmations');
    }
};
