<?php

namespace Database\Seeders;

use App\Models\Programmation;
use App\Models\Specialty;
use App\Models\SpecialtyProgrammation;
use Illuminate\Database\Seeder;

class SpecialtyProgrammationsSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $specialtyIds = Specialty::query()->pluck('id')->all();
        $programmationIds = Programmation::query()->pluck('id')->all();

        for ($i = 0; $i < 30; $i++) {
            SpecialtyProgrammation::create([
                'specialty_id' => $specialtyIds[$i % count($specialtyIds)] ?? null,
                'programmation_id' => $programmationIds[$i % count($programmationIds)] ?? null,
            ]);
        }
    }
}
