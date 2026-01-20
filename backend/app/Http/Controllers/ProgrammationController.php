<?php

namespace App\Http\Controllers;

use App\Events\TimetablePublished;
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
    // Vérifie si un créneau se chevauche avec un autre en filtrant sur les bornes et optionnellement en excluant un id.
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

    // Choisit une salle disponible respectant la capacité, le type et l'absence de chevauchement.
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

    // Résout l'id du programmeur pour la matière, en essayant la spécialité puis l'utilisateur authentifié.
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

    // Retrouve l'année académique couvrant la date courante.
    private function resolveCurrentYearId(): ?int
    {
        $today = Carbon::today();
        $current = Year::whereDate('date_star', '<=', $today)
            ->whereDate('date_end', '>=', $today)
            ->orderByDesc('date_end')
            ->first();

        return $current?->id;
    }

    // Convertit une heure en minutes depuis minuit pour simplifier les comparaisons.
    private function normalizeTime(string $time): int
    {
        [$h, $m] = array_map('intval', explode(':', $time));
        return $h * 60 + $m;
    }

    // Vérifie si un créneau empiète sur la pause déjeuner (12h-13h).
    private function overlapsBreak(string $start, string $end): bool
    {
        $breakStart = $this->normalizeTime('12:00');
        $breakEnd = $this->normalizeTime('13:00');
        $slotStart = $this->normalizeTime($start);
        $slotEnd = $this->normalizeTime($end);

        return $slotStart < $breakEnd && $slotEnd > $breakStart;
    }

    // Formate un nombre total de minutes en chaîne HH:MM.
    private function formatTime(int $minutes): string
    {
        $h = str_pad((string) floor($minutes / 60), 2, '0', STR_PAD_LEFT);
        $m = str_pad((string) ($minutes % 60), 2, '0', STR_PAD_LEFT);
        return "{$h}:{$m}";
    }

    // Génère des créneaux candidats à partir des disponibilités, en respectant les bornes horaires et en ignorant la pause.
    private function buildSlotsFromDisponibilities($disponibilities, int $slotMinutes = 120): array
    {
        $slots = [];
        $startLimit = $this->normalizeTime('08:00');
        $endLimit = $this->normalizeTime('17:00');

        foreach ($disponibilities as $dispo) {
            $day = $dispo->day?->value ?? $dispo->day;
            $start = max($startLimit, $this->normalizeTime($dispo->hour_star));
            $end = min($endLimit, $this->normalizeTime($dispo->hour_end));

            for ($t = $start; $t + $slotMinutes <= $end; $t += $slotMinutes) {
                $slotStart = $this->formatTime($t);
                $slotEnd = $this->formatTime($t + $slotMinutes);
                if ($this->overlapsBreak($slotStart, $slotEnd)) {
                    continue;
                }
                $slots[] = [
                    'day' => $day,
                    'start' => $slotStart,
                    'end' => $slotEnd,
                ];
            }
        }

        return $slots;
    }

    // Notifie les acteurs (enseignant, programmeur, admins) sauf l'auteur courant via la notification dédiée.
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
    // Liste les programmations en fonction des filtres et du rôle de l'utilisateur.
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
                $query->where('status', 'published');
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

            if (request('status')) {
                $query->where('status', request('status'));
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
    // Crée une programmation en validant la disponibilité, les conflits et en notifiant les parties prenantes.
    public function store(ProgrammationRequest $request)
    {
        try {
            $data = $request->validated();
            $subject = Subject::with('specialty')->findOrFail($data['subject_id']);
            $specialtyIds = $data['specialty_ids'] ?? [$subject->specialty_id];

            if ($this->overlapsBreak($data['hour_star'], $data['hour_end'])) {
                return errorResponse("Créneau invalide: pause 12h-13h");
            }

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
            if (empty($data['status'])) {
                $data['status'] = 'draft';
            }
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
    // Retourne une programmation précise.
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
    // Met à jour la programmation en revalidant les conflits, en affectant une salle et en notifiant.
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
            if ($this->overlapsBreak($start, $end)) {
                return errorResponse("Créneau invalide: pause 12h-13h");
            }
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
            if (array_key_exists('status', $data) && empty($data['status'])) {
                $data['status'] = $programmation->status ?? 'draft';
            }
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
    // Supprime une programmation et avertit les responsables.
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

    /**
     * Publish all validated programmations.
     */
    // Publie toutes les programmations validées en les marquant comme publiées.
    public function publishValidated(Request $request)
    {
        try {
            $count = Programmation::where('status', 'validated')->update(['status' => 'published']);
            return successResponse(['count' => $count], "Programmations publiées: {$count}");
        } catch (Exception $e) {
            return errorResponse($e->getMessage());
        }
    }

    /**
     * Suggest available slot + room based on availability and conflicts.
     */
    // Propose des créneaux libres en combinant disponibilités, conflits et salles libres.
    public function suggest(Request $request)
    {
        $request->validate([
            'subject_id' => ['required', 'exists:subjects,id'],
            'campus_id' => ['required', 'exists:campuses,id'],
            'day' => ['nullable', 'string'],
            'hour_star' => ['nullable', 'date_format:H:i'],
            'hour_end' => ['nullable', 'date_format:H:i'],
            'specialty_ids' => ['nullable', 'array'],
            'specialty_ids.*' => ['integer', 'exists:specialties,id'],
            'exclude_id' => ['nullable', 'integer'],
        ]);

        $subject = Subject::with(['specialty', 'teacher', 'disponibilities'])->findOrFail($request->input('subject_id'));
        $specialtyIds = $request->input('specialty_ids') ?? [$subject->specialty_id];
        $campusId = (int) $request->input('campus_id');
        $excludeId = $request->input('exclude_id');

        $disponibilities = $subject->disponibilities;
        if ($disponibilities->isEmpty()) {
            return errorResponse("Aucune disponibilité enregistrée pour cette matière");
        }

        $slots = $this->buildSlotsFromDisponibilities($disponibilities);
        $suggestions = [];

        $checkSlot = function (string $day, string $start, string $end) use ($subject, $specialtyIds, $campusId, $excludeId) {
            $teacherConflict = $this->hasOverlap(
                Programmation::whereHas('subject', function ($q) use ($subject) {
                    $q->where('teacher_id', $subject->teacher_id);
                }),
                $day,
                $start,
                $end,
                $excludeId
            );

            if ($teacherConflict) {
                return ['ok' => false, 'reason' => "Enseignant déjà occupé"];
            }

            $specialtyConflict = $this->hasOverlap(
                Programmation::whereHas('specialties', function ($q) use ($specialtyIds) {
                    $q->whereIn('specialty_id', $specialtyIds);
                }),
                $day,
                $start,
                $end,
                $excludeId
            );

            if ($specialtyConflict) {
                return ['ok' => false, 'reason' => "Spécialité déjà programmée"];
            }

            $room = $this->pickAvailableRoom($campusId, $subject, $day, $start, $end, $excludeId);
            if (!$room) {
                return ['ok' => false, 'reason' => "Aucune salle disponible"];
            }

            return ['ok' => true, 'room' => $room];
        };

        $current = null;
        $reason = null;
        $day = $request->input('day');
        $start = $request->input('hour_star');
        $end = $request->input('hour_end');

        if ($day && $start && $end) {
            $availabilityMatch = collect($slots)->first(fn ($s) => $s['day'] === $day && $s['start'] === $start && $s['end'] === $end);
            if (!$availabilityMatch) {
                $reason = "Créneau hors disponibilités";
            } elseif ($this->overlapsBreak($start, $end)) {
                $reason = "Créneau invalide: pause 12h-13h";
            } else {
                $check = $checkSlot($day, $start, $end);
                if ($check['ok']) {
                    $room = $check['room'];
                    $current = [
                        'day' => $day,
                        'hour_star' => $start,
                        'hour_end' => $end,
                        'room_id' => $room->id,
                        'room_label' => $room->code,
                    ];
                } else {
                    $reason = $check['reason'];
                }
            }
        }

        foreach ($slots as $slot) {
            $check = $checkSlot($slot['day'], $slot['start'], $slot['end']);
            if ($check['ok']) {
                $room = $check['room'];
                $suggestions[] = [
                    'day' => $slot['day'],
                    'hour_star' => $slot['start'],
                    'hour_end' => $slot['end'],
                    'room_id' => $room->id,
                    'room_label' => $room->code,
                ];
            }
            if (count($suggestions) >= 5) {
                break;
            }
        }

        return successResponse([
            'current' => $current,
            'reason' => $reason,
            'suggestions' => $suggestions,
        ], "Suggestions générées");
    }

    //publier les emplois du temps par semaine
    public function publishWeek(Request $request){
        $data = $request->validate([
            'year_id' => ['required', 'integer'],
            'week_start' => ['required', 'date'], // YYYY-MM-DD
            'week_end' => ['required', 'date', 'after_or_equal:week_start'],
        ]);

        Programmation::query()
            ->where('year_id', $data['year_id'])
            ->whereBetween('day', [$data['week_start'], $data['week_end']])
            ->update(['status' => 'published']);
        
        event(new TimetablePublished(
            $data['week_start'],
            $data['week_end'],
            (int) $data['year_id'],
            (int) ($request->user()->id) // ou programmer_id si tu l'as
        ));

        return response()->json([
            'message' => 'Timetable published and notifications sent.',
        ]);
    }
}
