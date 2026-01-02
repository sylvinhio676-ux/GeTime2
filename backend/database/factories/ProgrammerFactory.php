<?php

namespace Database\Factories;

use App\Models\Etablishment;
use App\Models\Programmer;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Programmer>
 */
class ProgrammerFactory extends Factory
{
    protected static $counter = 0;

    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'registration_number' => $this->generateRegistrationNumber(),
            'user_id' => User::factory(),
            'etablishment_id' => Etablishment::factory(),
        ];
    }

    private function generateRegistrationNumber(): string
    {
        $year = date('Y');
        static::$counter++;
        return "P{$year}" . str_pad(static::$counter, 4, '0', STR_PAD_LEFT);
    }
}
