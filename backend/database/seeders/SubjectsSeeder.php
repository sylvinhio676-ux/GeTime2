<?php

namespace Database\Seeders;

use App\Models\Specialty;
use App\Models\Subject;
use App\Models\Teacher;
use Illuminate\Database\Seeder;

class SubjectsSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $teacherIds = Teacher::query()->take(5)->pluck('id')->all();
        $specialtyIds = Specialty::query()->take(5)->pluck('id')->all();
        $subjects = [
            [
                'subject_name' => 'Algorithmique',
                'hour_by_week' => '4h',
                'total_hour' => 40,
                'type_subject' => 'cours',
                'color' => '#2563eb',
            ],
            [
                'subject_name' => 'Bases de donnees',
                'hour_by_week' => '3h',
                'total_hour' => 36,
                'type_subject' => 'td',
                'color' => '#16a34a',
            ],
            [
                'subject_name' => 'Reseaux 1',
                'hour_by_week' => '2h',
                'total_hour' => 24,
                'type_subject' => 'tp',
                'color' => '#dc2626',
            ],
            [
                'subject_name' => 'Marketing digital',
                'hour_by_week' => '2h',
                'total_hour' => 20,
                'type_subject' => 'cours',
                'color' => '#d97706',
            ],
            [
                'subject_name' => 'Gestion sportive',
                'hour_by_week' => '2h',
                'total_hour' => 26,
                'type_subject' => 'td',
                'color' => '#7c3aed',
            ],
        ];

        foreach ($subjects as $index => $subject) {
            $subject['teacher_id'] = $teacherIds[$index % count($teacherIds)] ?? null;
            $subject['specialty_id'] = $specialtyIds[$index % count($specialtyIds)] ?? null;
            Subject::create($subject);
        }
    }
}
