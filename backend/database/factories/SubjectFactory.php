<?php

namespace Database\Factories;

use App\Enum\TypeSubject;
use App\Models\Specialty;
use App\Models\Teacher;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Subject>
 */
class SubjectFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $type = array_map(fn($e) => $e->value, TypeSubject::cases());
        return [
            'subject_name' => $this->faker->name(),
            'hour_by_week' => $this->faker->numberBetween(4,8),
            'total_hour' => $this->faker->numberBetween(4,100),
            'type_subject' => $this->faker->randomElement($type),
            'teacher_id' => Teacher::factory(),
            'specialty_id' => Specialty::factory()
        ];
    }
}
