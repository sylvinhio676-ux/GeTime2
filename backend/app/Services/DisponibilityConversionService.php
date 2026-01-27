<?php

namespace App\Services;

use App\Models\Campus;
use App\Models\Disponibility;
use App\Models\Programmation;
use App\Models\Room;
use App\Models\Year;
use App\Notifications\ProgrammationNotification;
use Illuminate\Support\Collection;

class DisponibilityConversionService
{
    /**
     * Convertit toutes les disponibilités actives en programmations validées.
     *
     * @return Programmation[]
     */
    public function processPending(): array
    {
        $year = $this->resolveCurrentYear();
        if (!$year) {
            return [];
        }

        $processed = [];
        foreach ($this->getPendingDisponibilities() as $disponibility) {
            $room = $this->findRoomFor($disponibility);
            if (!$room) {
                continue;
            }

            $programmation = $this->buildProgrammation($disponibility, $room, $year);

            $disponibility->markAsReserved();

            $this->notifyStakeholders($disponibility, $programmation);

            $processed[] = $programmation;
        }

        return $processed;
    }

    /**
     * Récupère les disponibilités encore actives.
     */
    protected function getPendingDisponibilities(): Collection
    {
        return Disponibility::with([
            'subject.teacher.user',
            'subject.specialty.programmer.user',
            'etablishment',
        ])->active()->get();
    }

    protected function findRoomFor(Disponibility $disponibility): ?Room
    {
        $subject = $disponibility->subject;
        if (!$subject) {
            return null;
        }

        $day = $disponibility->day?->value ?? $disponibility->day;
        $campusIds = $this->resolveCampusIds($disponibility);
        $requiredCapacity = $subject->specialty?->number_student ?? 0;
        $roomType = $subject->type_subject?->value ?? null;

        $rooms = Room::query()
            ->where('is_available', true)
            ->when(count($campusIds), fn ($query) => $query->whereIn('campus_id', $campusIds))
            ->when($requiredCapacity > 0, fn ($query) => $query->where('capacity', '>=', $requiredCapacity));

        if ($roomType) {
            $rooms->where('type_room', $roomType);
        }

        return $rooms->whereDoesntHave('programmations', function ($query) use ($day, $disponibility) {
            $query->where('day', $day)
                ->where('hour_star', '<', $disponibility->hour_end)
                ->where('hour_end', '>', $disponibility->hour_star);
        })->orderBy('capacity')->first();
    }

    protected function resolveCampusIds(Disponibility $disponibility): array
    {
        if ($disponibility->etablishment_id) {
            $ids = Campus::query()
                ->where('etablishment_id', $disponibility->etablishment_id)
                ->pluck('id')
                ->all();

            if (!empty($ids)) {
                return $ids;
            }
        }

        return Campus::pluck('id')->all();
    }

    protected function buildProgrammation(Disponibility $disponibility, Room $room, Year $year): Programmation
    {
        $programmerId = $disponibility->subject->specialty?->programmer_id;

        $programmation = Programmation::create([
            'day' => $disponibility->day,
            'hour_star' => $disponibility->hour_star,
            'hour_end' => $disponibility->hour_end,
            'subject_id' => $disponibility->subject_id,
            'programmer_id' => $programmerId,
            'year_id' => $year->id,
            'room_id' => $room->id,
            'status' => 'validated',
        ]);

        $programmation->load(['room.campus', 'subject.specialty.level']);

        return $programmation;
    }

    protected function notifyStakeholders(Disponibility $disponibility, Programmation $programmation): void
    {
        $recipients = collect([
            $disponibility->subject->teacher?->user,
            $disponibility->subject->specialty?->programmer?->user,
        ])->filter()->unique('id');

        if ($recipients->isEmpty()) {
            return;
        }

        $room = $programmation->room;
        $campus = $room?->campus;
        $subjectLabel = $programmation->subject->subject_name ?? 'matière';
        $roomLabel = $room?->code ? "salle {$room->code}" : 'salle disponible';
        $campusLabel = $campus?->campus_name ?? 'campus non défini';
        $establishmentName = $disponibility->etablishment?->etablishment_name ?? 'établissement';

        $payload = [
            'type' => 'automatic_programmation',
            'title' => 'Programmation automatique créée',
            'message' => "{$subjectLabel} ({$programmation->hour_star} - {$programmation->hour_end}) a été planifiée dans {$roomLabel} sur {$campusLabel}.",
            'meta' => [
                'disponibility_id' => $disponibility->id,
                'programmation_id' => $programmation->id,
                'subject_id' => $programmation->subject_id,
                'room_id' => $room?->id,
                'campus_id' => $campus?->id,
                'etablishment_name' => $establishmentName,
            ],
            'action_url' => url('/dashboard/programmations'),
            'action_label' => 'Voir le planning',
        ];

        foreach ($recipients as $user) {
            $user->notify(new ProgrammationNotification($payload));
        }
    }

    protected function resolveCurrentYear(): ?Year
    {
        $today = now();

        return Year::query()
            ->whereDate('date_star', '<=', $today)
            ->whereDate('date_end', '>=', $today)
            ->orderByDesc('date_end')
            ->first();
    }
}
