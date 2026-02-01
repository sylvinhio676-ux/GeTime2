<?php

namespace App\Services;

use App\Events\DisponibilityConverted;
use App\Models\Campus;
use App\Models\Disponibility;
use App\Models\Programmation;
use App\Models\Room;
use App\Models\Subject;
use App\Models\Year;
use App\Services\ContinuityService;

/** Service: conversion disponibilités → programmations. */
class DisponibilityToProgrammationService
{
    public function __construct(private ContinuityService $continuityService)
    {
    }
    /** Convertit une disponibilité en programmation. */
    public function convert(Disponibility $disponibility, array $overrides = []): Programmation
    {
        $subject = $disponibility->subject;

        // Vérifie si l'enseignant est libre
        if ($subject && $subject->teacher_id) {
            $this->validateTeacherAvailability(
                $subject->teacher_id,
                $disponibility->day?->value ?? (string) $disponibility->day,
                $disponibility->hour_star,
                $disponibility->hour_end
            );
        }

        // Prépare et crée la programmation
        $payload = array_merge($this->buildPayload($disponibility), $overrides);
        $this->continuityService->enforceSameRoom($payload, $subject);
        $programmation = Programmation::create($payload);
        $this->syncSpecialties($programmation, $subject);
        $this->continuityService->resolveConflicts($programmation);
        $this->occupyRoom($payload['room_id'] ?? null);

        $disponibility->markAsUsed();
        event(new DisponibilityConverted($disponibility, $programmation));

        return $programmation;
    }

    /** Vérifie disponibilité enseignant. */
    protected function validateTeacherAvailability(int $teacherId, string $day, string $start, string $end): void
    {
        $conflict = Programmation::whereHas('subject', function ($q) use ($teacherId) {
                $q->where('teacher_id', $teacherId);
            })
            ->where('day', $day)
            ->where('hour_star', '<', $end)
            ->where('hour_end', '>', $start)
            ->where('status', 'published')
            ->exists();

        if ($conflict) {
            throw new \RuntimeException("L'enseignant est déjà occupé pendant ce créneau.");
        }
    }

    /** Construit le payload pour la programmation. */
    protected function buildPayload(Disponibility $disponibility): array
    {
        $subject = $disponibility->subject;
        $room = $this->pickRoom($disponibility, $subject);

        if (!$room) {
            throw new \RuntimeException("Aucune salle disponible n'a été trouvée pour cette disponibilité.");
        }

        return [
            'day' => $disponibility->day,
            'hour_star' => $disponibility->hour_star,
            'hour_end' => $disponibility->hour_end,
            'subject_id' => $disponibility->subject_id,
            'programmer_id' => $subject?->specialty?->programmer_id,
            'year_id' => $this->getCurrentYearId(),
            'room_id' => $room->id,
            'status' => 'draft',
        ];
    }

    /** Sélectionne une salle disponible. */
    protected function pickRoom(Disponibility $disponibility, ?Subject $subject): ?Room
    {
        if (!$subject) {
            return null;
        }

        $capacity = $subject->specialty?->number_student ?? 0;
        $roomType = $subject->type_subject?->value ?? null;
        $day = $disponibility->day?->value ?? (string) $disponibility->day;
        $start = $disponibility->hour_star;
        $end = $disponibility->hour_end;
        $campusIds = $this->resolveCampusIds($disponibility->etablishment_id);

        $baseQuery = $this->buildRoomQuery($campusIds, $capacity, $day, $start, $end);

        if ($roomType) {
            $typedQuery = (clone $baseQuery)->where('type_room', $roomType);
            $typedRoom = $typedQuery->first();
            if ($typedRoom) {
                return $typedRoom;
            }
        }

        return $baseQuery->first();
    }

    /** Construits la requête des salles disponibles. */
    protected function buildRoomQuery(array $campusIds, int $capacity, string $day, string $start, string $end)
    {
        $query = Room::where('is_available', true)
            ->where('capacity', '>=', $capacity);

        if (!empty($campusIds)) {
            $query->whereIn('campus_id', $campusIds);
        }

        return $query->whereDoesntHave('programmations', function ($q) use ($day, $start, $end) {
            $q->where('day', $day)
                ->where('hour_star', '<', $end)
                ->where('hour_end', '>', $start)
                ->where('status', 'published');
        })->orderBy('capacity');
    }

    /** Récupère les IDs des campus d'un établissement. */
    protected function resolveCampusIds(?int $etablishmentId): array
    {
        if (!$etablishmentId) {
            return [];
        }

        return Campus::where('etablishment_id', $etablishmentId)
            ->pluck('id')
            ->filter()
            ->all();
    }

    protected function occupyRoom(?int $roomId): void
    {
        if (!$roomId) {
            return;
        }

        Room::where('id', $roomId)->update(['is_available' => false]);
    }

    /** Récupère l'ID de l'année la plus récente. */
    protected function getCurrentYearId(): ?int
    {
        return Year::query()->latest('id')->value('id');
    }

    protected function syncSpecialties(Programmation $programmation, ?Subject $subject): void
    {
        if (!$subject?->specialty_id) {
            return;
        }
        $programmation->specialties()->sync([$subject->specialty_id]);
    }
}
