<?php

namespace Database\Factories;

use App\Models\Programmation;
use App\Models\Specialty;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\SpecialtyProgrammation>
 */
class SpecialtyProgrammationFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'specialty_id' => Specialty::factory(),
            'programmation_id' => Programmation::factory(),
        ];
    }
}
