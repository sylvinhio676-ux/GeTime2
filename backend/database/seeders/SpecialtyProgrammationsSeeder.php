<?php

namespace Database\Seeders;

use App\Models\SpecialtyProgrammation;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class SpecialtyProgrammationsSeeder extends Seeder
{
    /**
     * Run the databS::factory()->count(5)ase seeds.
     */
    public function run(): void
    {
        SpecialtyProgrammation::factory()->count(5)->create();
    }
}
