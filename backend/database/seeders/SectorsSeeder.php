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
        foreach (array_slice($baseSectors, 0, 5) as $index => $sector) {
            $sector['school_id'] = $schoolIds[$index % count($schoolIds)] ?? null;
            Sector::create($sector);
        }
    }
}
