<?php

namespace Database\Factories;

use App\Enum\JourEnum;
use App\Models\Programmer;
use App\Models\Subject;
use App\Models\Year;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Programmation>
 */
class ProgrammationFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $days = array_map(fn($d) => $d->value, JourEnum::cases());
        // Générer une heure de début et fin cohérentes
        $start = $this->faker->time('H:i');
        $end = $this->faker->time('H:i');

        // Forcer hour_end > hour_start
        if ($end <= $start) {
            $end = date('H:i', strtotime($start . ' +1 hour'));
        }
        return [
            'day' => $this->faker->randomElement($days),
            'hour_star' => $start,
            'hour_end' => $end,
            'subject_id' => Subject::factory(),
            'programmer_id' => Programmer::factory(),
            'year_id' => Year::factory()

        ];
    }
}
