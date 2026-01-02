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
        $baseLevels = [
            'L1',
            'L2',
            'L3',
            'M1',
            'M2',
            'D1',
            'D2',
            'D3',
            'Certification 1',
            'Certification 2',
        ];
        $count = 30;

        for ($i = 0; $i < $count; $i++) {
            $name = $baseLevels[$i % count($baseLevels)];
            if ($i >= count($baseLevels)) {
                $name = sprintf('%s %d', $name, $i + 1);
            }
            Level::create(['name_level' => $name]);
        }
    }
}
