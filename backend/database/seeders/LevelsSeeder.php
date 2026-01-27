<?php

namespace Database\Seeders;

use App\Models\Level;
use Illuminate\Database\Seeder;

class LevelsSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $levels = ['L1', 'L2', 'L3', 'M1', 'M2'];
        foreach ($levels as $name) {
            Level::create(['name_level' => $name]);
        }
    }
}
