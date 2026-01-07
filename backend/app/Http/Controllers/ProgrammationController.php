<?php

namespace App\Http\Controllers;

use App\Http\Requests\Stores\ProgrammationRequest;
use App\Http\Requests\Updates\ProgrammationUpdateRequest;
use App\Models\Programmation;
use App\Models\Programmer;
use App\Models\Room;
use App\Models\Subject;
use App\Models\Year;
use App\Models\User;
use App\Notifications\ProgrammationNotification;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;
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

    private function resolveProgrammerId(Request $request, Subject $subject, ?int $fallbackId = null): ?int
    {
        if ($fallbackId) {
            return $fallbackId;
        }

        $specialtyProgrammerId = $subject->specialty?->programmer_id;
        if ($specialtyProgrammerId) {
            return $specialtyProgrammerId;
        }

        return $request->user()?->programmer?->id;
    }

    private function resolveCurrentYearId(): ?int
    {
        $today = Carbon::today();
        $current = Year::whereDate('date_star', '<=', $today)
            ->whereDate('date_end', '>=', $today)
            ->orderByDesc('date_end')
            ->first();

        return $current?->id;
    }

    private function notifyUsers(?User $teacherUser, ?User $programmerUser, array $payload, ?int $actorId = null): void
    {
        $admins = User::role(['super_admin', 'admin'])->get();
        $recipients = collect([$teacherUser, $programmerUser])
            ->merge($admins)
            ->filter()
            ->unique('id');

        foreach ($recipients as $user) {
            if ($actorId && $user->id === $actorId) {
                continue;
            }
            $user->notify(new ProgrammationNotification($payload));
        }
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

            $user = request()->user();
            if ($user && $user->hasRole('teacher')) {
                $teacherId = $user->teacher?->id;
                $query->when($teacherId, function ($q) use ($teacherId) {
                    $q->whereHas('subject', function ($subjectQuery) use ($teacherId) {
                        $subjectQuery->where('teacher_id', $teacherId);
                    });
                });
            }

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
            $data['programmer_id'] = $this->resolveProgrammerId($request, $subject, $data['programmer_id'] ?? null);
            if (!$data['programmer_id']) {
                return errorResponse("Aucun programmeur associé pour cette programmation");
            }

            if (empty($data['year_id'])) {
                $data['year_id'] = $this->resolveCurrentYearId();
            }
            if (empty($data['year_id'])) {
                return errorResponse("Aucune année académique courante trouvée");
            }

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
                $teacherUser = $subject->teacher?->user;
                $programmerUser = Programmer::find($data['programmer_id'])?->user;
                $this->notifyUsers($teacherUser, $programmerUser, [
                    'type' => 'programmation_conflict',
                    'title' => 'Conflit de salle',
                    'message' => "Conflit détecté: la salle est déjà occupée le {$data['day']} ({$data['hour_star']} - {$data['hour_end']}).",
                    'meta' => ['room_id' => $data['room_id'], 'subject_id' => $subject->id],
                    'action_url' => url('/dashboard/programmations'),
                    'action_label' => 'Voir le planning',
                ], $request->user()?->id);
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
                $teacherUser = $subject->teacher?->user;
                $programmerUser = Programmer::find($data['programmer_id'])?->user;
                $this->notifyUsers($teacherUser, $programmerUser, [
                    'type' => 'programmation_conflict',
                    'title' => 'Conflit d\'enseignant',
                    'message' => "Conflit détecté: l'enseignant est déjà programmé le {$data['day']} ({$data['hour_star']} - {$data['hour_end']}).",
                    'meta' => ['subject_id' => $subject->id],
                    'action_url' => url('/dashboard/programmations'),
                    'action_label' => 'Voir le planning',
                ], $request->user()?->id);
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
                    $teacherUser = $subject->teacher?->user;
                    $programmerUser = Programmer::find($data['programmer_id'])?->user;
                    $this->notifyUsers($teacherUser, $programmerUser, [
                        'type' => 'programmation_conflict',
                        'title' => 'Conflit de spécialité',
                        'message' => "Conflit détecté: spécialité déjà programmée le {$data['day']} ({$data['hour_star']} - {$data['hour_end']}).",
                        'meta' => ['subject_id' => $subject->id],
                        'action_url' => url('/dashboard/programmations'),
                        'action_label' => 'Voir le planning',
                    ], $request->user()?->id);
                    return errorResponse("Conflit: la spécialité est déjà programmée sur ce créneau");
                }
            }

            unset($data['campus_id']);
            $programmation = Programmation::create($data);

            if (!empty($specialtyIds)) {
                $programmation->specialties()->sync($specialtyIds);
            }
            $teacherUser = $subject->teacher?->user;
            $programmerUser = Programmer::find($data['programmer_id'])?->user;
            $this->notifyUsers($teacherUser, $programmerUser, [
                'type' => 'programmation_created',
                'title' => 'Nouvelle programmation',
                'message' => "Une nouvelle séance a été ajoutée le {$data['day']} ({$data['hour_star']} - {$data['hour_end']}).",
                'meta' => ['programmation_id' => $programmation->id, 'subject_id' => $subject->id],
                'action_url' => url('/dashboard/programmations'),
                'action_label' => 'Voir le planning',
            ], $request->user()?->id);
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
            $data['programmer_id'] = $this->resolveProgrammerId($request, $subject, $data['programmer_id'] ?? $programmation->programmer_id);
            if (!$data['programmer_id']) {
                return errorResponse("Aucun programmeur associé pour cette programmation");
            }

            if (empty($data['year_id'])) {
                $data['year_id'] = $this->resolveCurrentYearId() ?? $programmation->year_id;
            }

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
                $teacherUser = $subject->teacher?->user;
                $programmerUser = Programmer::find($data['programmer_id'])?->user;
                $this->notifyUsers($teacherUser, $programmerUser, [
                    'type' => 'programmation_conflict',
                    'title' => 'Conflit de salle',
                    'message' => "Conflit détecté: la salle est déjà occupée le {$day} ({$start} - {$end}).",
                    'meta' => ['room_id' => $data['room_id'] ?? $programmation->room_id, 'subject_id' => $subject->id],
                    'action_url' => url('/dashboard/programmations'),
                    'action_label' => 'Voir le planning',
                ], $request->user()?->id);
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
                $teacherUser = $subject->teacher?->user;
                $programmerUser = Programmer::find($data['programmer_id'])?->user;
                $this->notifyUsers($teacherUser, $programmerUser, [
                    'type' => 'programmation_conflict',
                    'title' => 'Conflit d\'enseignant',
                    'message' => "Conflit détecté: l'enseignant est déjà programmé le {$day} ({$start} - {$end}).",
                    'meta' => ['subject_id' => $subject->id],
                    'action_url' => url('/dashboard/programmations'),
                    'action_label' => 'Voir le planning',
                ], $request->user()?->id);
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
                    $teacherUser = $subject->teacher?->user;
                    $programmerUser = Programmer::find($data['programmer_id'])?->user;
                    $this->notifyUsers($teacherUser, $programmerUser, [
                        'type' => 'programmation_conflict',
                        'title' => 'Conflit de spécialité',
                        'message' => "Conflit détecté: spécialité déjà programmée le {$day} ({$start} - {$end}).",
                        'meta' => ['subject_id' => $subject->id],
                        'action_url' => url('/dashboard/programmations'),
                        'action_label' => 'Voir le planning',
                    ], $request->user()?->id);
                    return errorResponse("Conflit: la spécialité est déjà programmée sur ce créneau");
                }
            }

            unset($data['campus_id']);
            $programmation->update($data);

            if (!empty($specialtyIds)) {
                $programmation->specialties()->sync($specialtyIds);
            }
            $teacherUser = $subject->teacher?->user;
            $programmerUser = Programmer::find($data['programmer_id'])?->user;
            $this->notifyUsers($teacherUser, $programmerUser, [
                'type' => 'programmation_updated',
                'title' => 'Programmation modifiée',
                'message' => "Une séance a été modifiée le {$day} ({$start} - {$end}).",
                'meta' => ['programmation_id' => $programmation->id, 'subject_id' => $subject->id],
                'action_url' => url('/dashboard/programmations'),
                'action_label' => 'Voir le planning',
            ], $request->user()?->id);
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
            $subject = $programmation->subject;
            $teacherUser = $subject?->teacher?->user;
            $programmerUser = $programmation->programmer?->user;
            $payload = [
                'type' => 'programmation_deleted',
                'title' => 'Programmation supprimée',
                'message' => "Une séance du {$programmation->day} ({$programmation->hour_star} - {$programmation->hour_end}) a été supprimée.",
                'meta' => ['programmation_id' => $programmation->id, 'subject_id' => $subject?->id],
                'action_url' => url('/dashboard/programmations'),
                'action_label' => 'Voir le planning',
            ];
            $programmation->delete();
            $this->notifyUsers($teacherUser, $programmerUser, $payload, request()->user()?->id);
            return successResponse(null, "Programmation supprimée avec succès");
        } catch (Exception $e) {
            return errorResponse($e->getMessage());
        }
    }
}
