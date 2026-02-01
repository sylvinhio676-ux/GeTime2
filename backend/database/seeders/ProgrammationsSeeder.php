<?php

namespace Database\Seeders;

use App\Models\Programmation;
use App\Models\Programmer;
use App\Models\Room;
use App\Models\Subject;
use App\Models\Year;
use Illuminate\Database\Seeder;

class ProgrammationsSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $subjectIds = Subject::query()->pluck('id')->all();
        $programmerIds = Programmer::query()->pluck('id')->all();
        $yearIds = Year::query()->pluck('id')->all();
        $roomIds = Room::query()->pluck('id')->all();
        $days = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi'];

        for ($i = 0; $i < 5; $i++) {
            Programmation::create([
                'day' => $days[$i % count($days)],
                'hour_star' => sprintf('%02d:00', 8 + ($i % 4)),
                'hour_end' => sprintf('%02d:00', 10 + ($i % 4)),
                'subject_id' => $subjectIds[$i % count($subjectIds)] ?? null,
                'programmer_id' => $programmerIds[$i % count($programmerIds)] ?? null,
                'year_id' => $yearIds[$i % count($yearIds)] ?? null,
                'room_id' => $roomIds[$i % count($roomIds)] ?? null,
            ]);
        }
    }
}
