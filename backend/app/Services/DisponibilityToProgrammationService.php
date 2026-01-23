<?php

namespace App\Services;

use App\Events\DisponibilityConverted;
use App\Models\Disponibility;
use App\Models\Programmation;
use App\Models\Year;

class DisponibilityToProgrammationService
{
    public function convert(Disponibility $disponibility, array $overrides = []): Programmation
    {
        $payload = array_merge($this->buildPayload($disponibility), $overrides);

        $programmation = Programmation::create($payload);

        $disponibility->markAsUsed();

        event(new DisponibilityConverted($disponibility, $programmation));

        return $programmation;
    }

    protected function buildPayload(Disponibility $disponibility): array
    {
        $subject = $disponibility->subject;

        return [
            'day' => $disponibility->day,
            'hour_star' => $disponibility->hour_star,
            'hour_end' => $disponibility->hour_end,
            'subject_id' => $disponibility->subject_id,
            'programmer_id' => $subject?->specialty?->programmer_id,
            'year_id' => $this->getCurrentYearId(),
            'status' => 'draft',
        ];
    }

    protected function getCurrentYearId(): ?int
    {
        return Year::query()->latest('id')->value('id');
    }
}
