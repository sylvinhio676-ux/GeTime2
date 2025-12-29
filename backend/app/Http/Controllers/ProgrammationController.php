<?php

namespace App\Http\Controllers;

use App\Http\Requests\Stores\ProgrammationRequest;
use App\Http\Requests\Updates\ProgrammationUpdateRequest;
use App\Models\Programmation;
use App\Models\Room;
use App\Models\Subject;
use Illuminate\Http\Request;
use Exception;

class ProgrammationController extends Controller
{
    private function hasOverlap($query, string $day, string $start, string $end, ?int $excludeId = null): bool
    {
        $query->where('day', $day)
            ->where('hour_star', '<', $end)
            ->where('hour_end', '>', $start);

        if ($excludeId) {
            $query->where('id', '!=', $excludeId);
        }

        return $query->exists();
    }

    private function pickAvailableRoom(int $campusId, Subject $subject, string $day, string $start, string $end, ?int $excludeId = null): ?Room
    {
        $requiredCapacity = $subject->specialty?->number_student ?? 0;
        $roomType = $subject->type_subject?->value ?? null;

        $roomsQuery = Room::where('campus_id', $campusId)
            ->where('is_available', true)
            ->where('capacity', '>=', $requiredCapacity);

        if ($roomType) {
            $roomsQuery->where('type_room', $roomType);
        }

        return $roomsQuery->whereDoesntHave('programmations', function ($q) use ($day, $start, $end, $excludeId) {
            $q->where('day', $day)
                ->where('hour_star', '<', $end)
                ->where('hour_end', '>', $start);

            if ($excludeId) {
                $q->where('id', '!=', $excludeId);
            }
        })->orderBy('capacity')->first();
    }

    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        try {
            $query = Programmation::with([
                'subject.teacher.user',
                'subject.specialty.level',
                'subject.specialty.sector.school.responsible',
                'programmer.user',
                'year',
                'room.campus',
                'specialties',
            ]);

            if (request('specialty_id')) {
                $query->whereHas('specialties', function ($q) {
                    $q->where('specialty_id', request('specialty_id'));
                });
            }

            if (request('teacher_id')) {
                $query->whereHas('subject', function ($q) {
                    $q->where('teacher_id', request('teacher_id'));
                });
            }

            if (request('level_id')) {
                $query->whereHas('subject.specialty', function ($q) {
                    $q->where('level_id', request('level_id'));
                });
            }

            if (request('year_id')) {
                $query->where('year_id', request('year_id'));
            }

            if (request('campus_id')) {
                $query->whereHas('room', function ($q) {
                    $q->where('campus_id', request('campus_id'));
                });
            }

            $programmations = $query->get();
            if (!$programmations) throw new Exception("Aucune programmation trouvée");
            return successResponse($programmations);
        } catch (Exception $e) {
            return errorResponse($e->getMessage());
        }
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(ProgrammationRequest $request)
    {
        try {
            $data = $request->validated();
            $subject = Subject::with('specialty')->findOrFail($data['subject_id']);
            $specialtyIds = $data['specialty_ids'] ?? [$subject->specialty_id];

            $campusId = $data['campus_id'] ?? null;

            if (empty($data['room_id'])) {
                if (!$campusId) {
                    return errorResponse("Campus requis pour l'assignation automatique de salle");
                }
                $room = $this->pickAvailableRoom($campusId, $subject, $data['day'], $data['hour_star'], $data['hour_end']);
                if (!$room) {
                    return errorResponse("Aucune salle disponible pour ce créneau");
                }
                $data['room_id'] = $room->id;
            }

            $roomConflict = $this->hasOverlap(
                Programmation::where('room_id', $data['room_id']),
                $data['day'],
                $data['hour_star'],
                $data['hour_end']
            );

            if ($roomConflict) {
                return errorResponse("Conflit: la salle est déjà occupée sur ce créneau");
            }

            $teacherConflict = $this->hasOverlap(
                Programmation::whereHas('subject', function ($q) use ($subject) {
                    $q->where('teacher_id', $subject->teacher_id);
                }),
                $data['day'],
                $data['hour_star'],
                $data['hour_end']
            );

            if ($teacherConflict) {
                return errorResponse("Conflit: l'enseignant est déjà programmé sur ce créneau");
            }

            if (!empty($specialtyIds)) {
                $specialtyConflict = $this->hasOverlap(
                    Programmation::whereHas('specialties', function ($q) use ($specialtyIds) {
                        $q->whereIn('specialty_id', $specialtyIds);
                    }),
                    $data['day'],
                    $data['hour_star'],
                    $data['hour_end']
                );

                if ($specialtyConflict) {
                    return errorResponse("Conflit: la spécialité est déjà programmée sur ce créneau");
                }
            }

            unset($data['campus_id']);
            $programmation = Programmation::create($data);

            if (!empty($specialtyIds)) {
                $programmation->specialties()->sync($specialtyIds);
            }
            return successResponse($programmation, "Programmation créée avec succès");
        } catch (Exception $e) {
            return errorResponse($e->getMessage());
        }
    }

    /**
     * Display the specified resource.
     */
    public function show(Programmation $programmation)
    {
        try {
            if (!$programmation) return notFoundResponse("Programmation non trouvée");
            return successResponse($programmation);
        } catch (Exception $e) {
            return errorResponse($e->getMessage());
        }
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(ProgrammationUpdateRequest $request, Programmation $programmation)
    {
        try {
            $data = $request->validated();
            $subjectId = $data['subject_id'] ?? $programmation->subject_id;
            $subject = Subject::with('specialty')->findOrFail($subjectId);
            $specialtyIds = $data['specialty_ids'] ?? $programmation->specialties()->pluck('specialty_id')->all();

            $day = $data['day'] ?? $programmation->day;
            $start = $data['hour_star'] ?? $programmation->hour_star;
            $end = $data['hour_end'] ?? $programmation->hour_end;
            $campusId = $data['campus_id'] ?? $programmation->room?->campus_id;

            if (empty($data['room_id'])) {
                if (!$campusId) {
                    return errorResponse("Campus requis pour l'assignation automatique de salle");
                }
                $room = $this->pickAvailableRoom($campusId, $subject, $day, $start, $end, $programmation->id);
                if (!$room) {
                    return errorResponse("Aucune salle disponible pour ce créneau");
                }
                $data['room_id'] = $room->id;
            }

            $roomConflict = $this->hasOverlap(
                Programmation::where('room_id', $data['room_id']),
                $day,
                $start,
                $end,
                $programmation->id
            );

            if ($roomConflict) {
                return errorResponse("Conflit: la salle est déjà occupée sur ce créneau");
            }

            $teacherConflict = $this->hasOverlap(
                Programmation::whereHas('subject', function ($q) use ($subject) {
                    $q->where('teacher_id', $subject->teacher_id);
                }),
                $day,
                $start,
                $end,
                $programmation->id
            );

            if ($teacherConflict) {
                return errorResponse("Conflit: l'enseignant est déjà programmé sur ce créneau");
            }

            if (!empty($specialtyIds)) {
                $specialtyConflict = $this->hasOverlap(
                    Programmation::whereHas('specialties', function ($q) use ($specialtyIds) {
                        $q->whereIn('specialty_id', $specialtyIds);
                    }),
                    $day,
                    $start,
                    $end,
                    $programmation->id
                );

                if ($specialtyConflict) {
                    return errorResponse("Conflit: la spécialité est déjà programmée sur ce créneau");
                }
            }

            unset($data['campus_id']);
            $programmation->update($data);

            if (!empty($specialtyIds)) {
                $programmation->specialties()->sync($specialtyIds);
            }
            return successResponse($programmation, "Programmation modifiée avec succès");
        } catch (Exception $e) {
            return errorResponse($e->getMessage());
        }
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Programmation $programmation)
    {
        try {
            $programmation->delete();
            return successResponse(null, "Programmation supprimée avec succès");
        } catch (Exception $e) {
            return errorResponse($e->getMessage());
        }
    }
}
