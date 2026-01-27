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
        $userIds = User::query()->take(5)->pluck('id')->all();
        $schools = [
            ['school_name' => 'Ecole d\'Informatique', 'description' => 'Formation en informatique et systèmes.'],
            ['school_name' => 'Ecole de Gestion', 'description' => 'Gestion, finance et comptabilité.'],
            ['school_name' => 'Ecole d\'Ingénierie', 'description' => 'Ingénierie et technologies appliquées.'],
            ['school_name' => 'Ecole de Droit', 'description' => 'Droit privé et public.'],
            ['school_name' => 'Ecole de Communication', 'description' => 'Communication et marketing.'],
        ];

        foreach ($schools as $index => $school) {
            $school['responsible_user_id'] = $userIds[$index % count($userIds)] ?? null;
            School::create($school);
        }
    }
}
