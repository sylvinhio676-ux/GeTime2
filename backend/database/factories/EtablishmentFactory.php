<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Notifications\Notifiable;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Etablishment>
 */
class EtablishmentFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'etablishment_name' => 'Etablissement ' . $this->faker->company(),
            'description' => $this->faker->sentence(20),
            'city' => $this->faker->city(),
        ];
    }
}
