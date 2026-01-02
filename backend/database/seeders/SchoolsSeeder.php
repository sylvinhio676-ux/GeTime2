<?php

namespace Database\Seeders;

use App\Models\School;
use App\Models\User;
use Illuminate\Database\Seeder;

class SchoolsSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $userIds = User::query()->pluck('id')->all();

        $baseSchools = [
            ['school_name' => 'Ecole d\'Informatique', 'description' => 'Formation en informatique et systemes.'],
            ['school_name' => 'Ecole de Gestion', 'description' => 'Gestion, finance et comptabilite.'],
            ['school_name' => 'Ecole d\'Ingenierie', 'description' => 'Ingenierie et technologies appliquees.'],
            ['school_name' => 'Ecole de Droit', 'description' => 'Droit prive et public.'],
            ['school_name' => 'Ecole de Communication', 'description' => 'Communication et marketing.'],
            ['school_name' => 'Ecole de Sante', 'description' => 'Sciences de la sante.'],
            ['school_name' => 'Ecole des Arts', 'description' => 'Arts, design et creation.'],
            ['school_name' => 'Ecole des Sciences', 'description' => 'Sciences fondamentales.'],
            ['school_name' => 'Ecole de Langues', 'description' => 'Langues et traduction.'],
            ['school_name' => 'Ecole de Sport', 'description' => 'Management du sport.'],
        ];
        $count = 30;

        for ($index = 0; $index < $count; $index++) {
            $school = $baseSchools[$index % count($baseSchools)];
            if ($index >= count($baseSchools)) {
                $school['school_name'] = sprintf('%s %d', $school['school_name'], $index + 1);
            }
            $school['responsible_user_id'] = $userIds[$index % count($userIds)] ?? null;
            School::create($school);
        }
    }
}
