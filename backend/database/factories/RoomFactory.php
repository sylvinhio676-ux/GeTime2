<?php

namespace Database\Factories;

use App\Models\Campus;
use App\Models\Programmation;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Room>
 */
class RoomFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'code' => $this->faker->currencyCode(),
            'capacity' => $this->faker->numberBetween(10,50),
            'is_available' => $this->faker->boolean(80),
            'campus_id' => Campus::factory(),
            'programmation_id' => Programmation::factory(),
        ];
    }
}
