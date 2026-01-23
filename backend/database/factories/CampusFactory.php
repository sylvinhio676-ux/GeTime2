<?php

namespace Database\Factories;

use App\Models\Etablishment;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Campus>
 */
class CampusFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'campus_name' => $this->faker->name(),
            'city'=> $this->faker->address(),
            'etablishment_id' => Etablishment::factory()
        ];
    }
}
