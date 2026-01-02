<?php

namespace Database\Seeders;

use App\Models\Level;
use App\Models\Programmer;
use App\Models\Sector;
use App\Models\Specialty;
use Illuminate\Database\Seeder;

class SpecialtiesSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $sectorIds = Sector::query()->pluck('id')->all();
        $programmerIds = Programmer::query()->pluck('id')->all();
        $levelIds = Level::query()->pluck('id')->all();

        $baseSpecialties = [
            ['specialty_name' => 'Developpement Web', 'code' => 'WEB', 'description' => 'Creation d\'applications web', 'number_student' => 30],
            ['specialty_name' => 'Data Science', 'code' => 'DATA', 'description' => 'Analyse et science des donnees', 'number_student' => 25],
            ['specialty_name' => 'Reseaux', 'code' => 'NET', 'description' => 'Infrastructure reseau', 'number_student' => 20],
            ['specialty_name' => 'Cybersecurite', 'code' => 'CYBER', 'description' => 'Securite informatique', 'number_student' => 18],
            ['specialty_name' => 'Comptabilite', 'code' => 'COMP', 'description' => 'Comptabilite et audit', 'number_student' => 28],
            ['specialty_name' => 'Marketing', 'code' => 'MKT', 'description' => 'Strategie marketing', 'number_student' => 22],
            ['specialty_name' => 'Genie Civil', 'code' => 'GC', 'description' => 'Conception et construction', 'number_student' => 26],
            ['specialty_name' => 'Biologie', 'code' => 'BIO', 'description' => 'Sciences biologiques', 'number_student' => 24],
            ['specialty_name' => 'Traduction', 'code' => 'TRAD', 'description' => 'Langues et traduction', 'number_student' => 19],
            ['specialty_name' => 'Management Sportif', 'code' => 'SPORT', 'description' => 'Gestion des activites sportives', 'number_student' => 21],
        ];
        $count = 30;

        for ($index = 0; $index < $count; $index++) {
            $specialty = $baseSpecialties[$index % count($baseSpecialties)];
            if ($index >= count($baseSpecialties)) {
                $specialty['specialty_name'] = sprintf('%s %d', $specialty['specialty_name'], $index + 1);
                $specialty['code'] = sprintf('%s%02d', $specialty['code'], $index + 1);
                $specialty['number_student'] = $specialty['number_student'] + ($index % 6);
            }
            $specialty['sector_id'] = $sectorIds[$index % count($sectorIds)] ?? null;
            $specialty['programmer_id'] = $programmerIds[$index % count($programmerIds)] ?? null;
            $specialty['level_id'] = $levelIds[$index % count($levelIds)] ?? null;
            Specialty::create($specialty);
        }
    }
}
