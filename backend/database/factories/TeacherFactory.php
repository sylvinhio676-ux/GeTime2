<?php

namespace Database\Factories;

use App\Enum\RuleEnum;
use App\Models\Teacher;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Teacher>
 */
class TeacherFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'registration_number' => Teacher::RegistrationNumber(),
            'user_id' => User::factory()->state([
                'role' => RuleEnum::TEACHER,
            ]),
        ];
    }
}
