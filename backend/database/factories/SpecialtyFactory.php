<?php

namespace Database\Factories;

use App\Models\Programmer;
use App\Models\Sector;
use App\Models\Level;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Specialty>
 */
class SpecialtyFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'specialty_name' => $this->faker->name(),
            'code' => strtoupper($this->faker->bothify('??##')),
            'description' => $this->faker->sentence(200),
            'number_student' => $this->faker->numerify(),
            'sector_id' => Sector::factory(),
            'programmer_id' => Programmer::factory(),
            'level_id' => Level::factory(),
        ];
    }
}
