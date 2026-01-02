<?php

namespace Database\Seeders;

use App\Models\Disponibility;
use App\Models\Etablishment;
use App\Models\Subject;
use Illuminate\Database\Seeder;

class DisponibilitiesSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $subjectIds = Subject::query()->pluck('id')->all();
        $etablishmentIds = Etablishment::query()->pluck('id')->all();
        $days = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi', 'Dimanche'];

        for ($i = 0; $i < 30; $i++) {
            Disponibility::create([
                'day' => $days[$i % count($days)],
                'hour_star' => sprintf('%02d:00:00', 8 + ($i % 4)),
                'hour_end' => sprintf('%02d:00:00', 10 + ($i % 4)),
                'subject_id' => $subjectIds[$i % count($subjectIds)] ?? null,
                'etablishment_id' => $etablishmentIds[$i % count($etablishmentIds)] ?? null,
            ]);
        }
    }
}
