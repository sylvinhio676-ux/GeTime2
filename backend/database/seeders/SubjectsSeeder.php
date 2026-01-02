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
        $teacherIds = Teacher::query()->pluck('id')->all();
        $specialtyIds = Specialty::query()->pluck('id')->all();
        $types = ['cours', 'td', 'tp'];
        $colors = ['#2563eb', '#16a34a', '#dc2626', '#d97706', '#7c3aed'];

        $baseSubjects = [
            ['subject_name' => 'Algorithmique', 'hour_by_week' => '4h', 'total_hour' => 40],
            ['subject_name' => 'Bases de donnees', 'hour_by_week' => '3h', 'total_hour' => 36],
            ['subject_name' => 'Reseaux 1', 'hour_by_week' => '2h', 'total_hour' => 24],
            ['subject_name' => 'Securite', 'hour_by_week' => '2h', 'total_hour' => 28],
            ['subject_name' => 'Comptabilite generale', 'hour_by_week' => '3h', 'total_hour' => 30],
            ['subject_name' => 'Marketing digital', 'hour_by_week' => '2h', 'total_hour' => 20],
            ['subject_name' => 'Genie civil', 'hour_by_week' => '4h', 'total_hour' => 45],
            ['subject_name' => 'Biologie cellulaire', 'hour_by_week' => '3h', 'total_hour' => 32],
            ['subject_name' => 'Traduction technique', 'hour_by_week' => '2h', 'total_hour' => 22],
            ['subject_name' => 'Gestion sportive', 'hour_by_week' => '2h', 'total_hour' => 26],
        ];
        $count = 30;

        for ($index = 0; $index < $count; $index++) {
            $subject = $baseSubjects[$index % count($baseSubjects)];
            if ($index >= count($baseSubjects)) {
                $subject['subject_name'] = sprintf('%s %d', $subject['subject_name'], $index + 1);
                $subject['total_hour'] = $subject['total_hour'] + ($index % 5);
            }
            $subject['type_subject'] = $types[$index % count($types)];
            $subject['color'] = $colors[$index % count($colors)];
            $subject['teacher_id'] = $teacherIds[$index % count($teacherIds)] ?? null;
            $subject['specialty_id'] = $specialtyIds[$index % count($specialtyIds)] ?? null;
            Subject::create($subject);
        }
    }
}
