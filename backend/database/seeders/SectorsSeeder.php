<?php

namespace Database\Seeders;

use App\Models\School;
use App\Models\Sector;
use Illuminate\Database\Seeder;

class SectorsSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $schoolIds = School::query()->pluck('id')->all();

        $baseSectors = [
            ['sector_name' => 'Informatique', 'code' => 'INFO'],
            ['sector_name' => 'Gestion', 'code' => 'GEST'],
            ['sector_name' => 'Ingenierie', 'code' => 'ING'],
            ['sector_name' => 'Droit', 'code' => 'DRT'],
            ['sector_name' => 'Communication', 'code' => 'COM'],
            ['sector_name' => 'Sante', 'code' => 'SANT'],
            ['sector_name' => 'Arts', 'code' => 'ART'],
            ['sector_name' => 'Sciences', 'code' => 'SCI'],
            ['sector_name' => 'Langues', 'code' => 'LANG'],
            ['sector_name' => 'Sport', 'code' => 'SPORT'],
        ];
        $count = 30;

        for ($index = 0; $index < $count; $index++) {
            $sector = $baseSectors[$index % count($baseSectors)];
            if ($index >= count($baseSectors)) {
                $sector['sector_name'] = sprintf('%s %d', $sector['sector_name'], $index + 1);
                $sector['code'] = sprintf('%s%02d', $sector['code'], $index + 1);
            }
            $sector['school_id'] = $schoolIds[$index % count($schoolIds)] ?? null;
            Sector::create($sector);
        }
    }
}
