<?php

namespace App\Http\Controllers;

use App\Http\Requests\Stores\DisponibilityRequest;
use App\Http\Requests\Updates\DisponibilityUpdateRequest;
use App\Enum\JourEnum;
use App\Models\Disponibility;
use App\Models\Programmation;
use App\Models\User;
use App\Notifications\ProgrammationNotification;
use App\Services\DisponibilityToProgrammationService;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\DB;
use Exception;

class DisponibilityController extends Controller
{
    private function notifyAdminsAndProgrammer(?User $programmerUser, array $payload, ?int $actorId = null): void
    {
        $admins = User::role(['super_admin', 'admin'])->get();
        $recipients = collect([$programmerUser])
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
    public function index(Request $request)
    {
        try {
            $query = Disponibility::with(['subject.teacher.user', 'subject.specialty.level', 'etablishment']);

            // FILTRE PAR ANNÉE (Indispensable)
            if ($request->filled('year_id')) {
                $query->where('year_id', $request->year_id);
            }

            // FILTRE PAR SPÉCIALITÉ / NIVEAU
            // On cherche les disponibilités dont la matière (subject) appartient à la spécialité/niveau
            if ($request->filled('specialty_id')) {
                $query->whereHas('subject', function($q) use ($request) {
                    $q->where('specialty_id', $request->specialty_id);
                });
            }

            $user = $request->user();
            // Si c'est un prof, on restreint à ses propres matières uniquement
            if ($user && $user->hasRole('teacher')) {
                $teacherId = $user->teacher?->id;
                $query->whereHas('subject', fn($q) => $q->where('teacher_id', $teacherId));
            }

            $disponibilities = $query->get();
            return successResponse($disponibilities);
        } catch (Exception $e) {
            return errorResponse($e->getMessage());
        }
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(DisponibilityRequest $request)
    {
        try {
            $validated = $request->validated();

            // Cas : Tableau de disponibilités
            if (isset($validated[0])) {
                $createdItems = [];
                foreach ($validated as $itemData) {
                    $disponibility = Disponibility::create($itemData);
                    $createdItems[] = $disponibility;
                    
                    // On notifie pour chaque création
                    $this->sendCreationNotification($disponibility, $request->user()?->id);
                }
                return successResponse($createdItems, "Disponibilités créées avec succès");
            }

            // Cas : Disponibilité unique
            $disponibility = Disponibility::create($validated);
            $this->sendCreationNotification($disponibility, $request->user()?->id);

            return successResponse($disponibility, "Disponibilité créée avec succès");

        } catch (Exception $e) {
            return errorResponse($e->getMessage());
        }
    }

    /**
     * Display the specified resource.
     */
    public function show(Disponibility $disponibility)
    {
        try {
            if (!$disponibility) return notFoundResponse("Disponibilité non trouvée");
            return successResponse($disponibility);
        } catch (Exception $e) {
            return errorResponse($e->getMessage());
        }
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(DisponibilityUpdateRequest $request, Disponibility $disponibility)
    {
        try {
            $data = $request->validated();
            $disponibility->update($data);
            $subject = $disponibility->subject;
            $programmerUser = $subject?->specialty?->programmer?->user;
            $this->notifyAdminsAndProgrammer($programmerUser, [
                'type' => 'disponibility_updated',
                'title' => 'Disponibilité modifiée',
                'message' => "Disponibilité modifiée pour {$this->resolveDayLabel($disponibility->day)} ({$disponibility->hour_star} - {$disponibility->hour_end}).",
                'meta' => ['disponibility_id' => $disponibility->id, 'subject_id' => $disponibility->subject_id],
                'action_url' => url('/dashboard/disponibilities'),
                'action_label' => 'Voir les disponibilités',
            ], $request->user()?->id);
            return successResponse($disponibility, "Disponibilité modifiée avec succès");
        } catch (Exception $e) {
            return errorResponse($e->getMessage());
        }
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Disponibility $disponibility)
    {
        try {
            $subject = $disponibility->subject;
            $programmerUser = $subject?->specialty?->programmer?->user;
            $dayLabel = $disponibility->day?->value ?? $disponibility->day;
            $payload = [
                'type' => 'disponibility_deleted',
                'title' => 'Disponibilité supprimée',
                'message' => "Disponibilité supprimée pour {$dayLabel} ({$disponibility->hour_star} - {$disponibility->hour_end}).",
                'meta' => ['disponibility_id' => $disponibility->id, 'subject_id' => $disponibility->subject_id],
                'action_url' => url('/dashboard/disponibilities'),
                'action_label' => 'Voir les disponibilités',
            ];
            $disponibility->delete();
            $this->notifyAdminsAndProgrammer($programmerUser, $payload, request()->user()?->id);
            return successResponse(null, "Disponibilité supprimée avec succès");
        } catch (Exception $e) {
            return errorResponse($e->getMessage());
        }
    }

    public function convert(Request $request, Disponibility $disponibility, DisponibilityToProgrammationService $service)
    {
        try {
            $user = $request->user();
            if ($user && $user->hasRole('teacher')) {
                return forbiddenResponse('Accès refusé');
            }

            return $this->performConversion($request, $disponibility, $service);
        } catch (Exception $e) {
            return errorResponse($e->getMessage());
        }
    }

    public function convertAsAdmin(Request $request, Disponibility $disponibility, DisponibilityToProgrammationService $service)
    {
        try {
            return $this->performConversion($request, $disponibility, $service);
        } catch (Exception $e) {
            return errorResponse($e->getMessage());
        }
    }

    private function performConversion(Request $request, Disponibility $disponibility, DisponibilityToProgrammationService $service)
    {
        $overrides = array_filter(
            $request->only(['room_id', 'programmer_id', 'year_id', 'status']),
            fn ($value) => $value !== null
        );

        $programmation = $service->convert($disponibility, $overrides);
        $this->notifyProgrammationCreation($programmation, $request->user()?->id);
        return successResponse($programmation, "Programmation créée à partir de la disponibilité");
    }

    public function group(Request $request)
    {
        $data = $request->validate([
            'ids' => ['required', 'array', 'min:2'],
            'ids.*' => ['integer', 'exists:disponibilities,id'],
        ]);

        $disponibilities = Disponibility::whereIn('id', $data['ids'])
            ->with(['subject', 'etablishment'])
            ->get();

        if ($disponibilities->count() < 2) {
            return errorResponse('Au moins deux disponibilités doivent être sélectionnées');
        }

        $first = $disponibilities->first();
        $day = $first->day;
        $subjectId = $first->subject_id;
        $etabId = $first->etablishment_id;
        $minutes = $disponibilities->map(fn($d) => Carbon::parse($d->hour_star)->diffInMinutes(Carbon::parse($d->hour_end)));
        if (!$disponibilities->every(fn($d) => $d->day == $day && $d->subject_id == $subjectId && $d->etablishment_id == $etabId)) {
            return errorResponse('Les disponibilités doivent partager la même matière/jour/établissement');
        }

        $starts = $disponibilities->map(fn($d) => Carbon::parse($d->hour_star));
        $ends = $disponibilities->map(fn($d) => Carbon::parse($d->hour_end));
        $aggregateStart = $starts->min()->format('H:i');
        $aggregateEnd = $ends->max()->format('H:i');

        DB::transaction(function () use ($first, $disponibilities, $aggregateStart, $aggregateEnd) {
            $first->update([
                'hour_star' => $aggregateStart,
                'hour_end' => $aggregateEnd,
                'is_grouped' => true,
            ]);
            $idsToDelete = $disponibilities->pluck('id')->filter(fn($id) => $id !== $first->id);
            Disponibility::whereIn('id', $idsToDelete)->delete();
        });

        return successResponse([
            'start' => $aggregateStart,
            'end' => $aggregateEnd,
            'day' => $day,
            'subject_id' => $subjectId,
        ], "Disponibilités regroupées");
    }

    public function ungroup(Request $request)
    {
        $data = $request->validate([
            'id' => ['required', 'integer', 'exists:disponibilities,id'],
            'slot_minutes' => ['nullable', 'integer', 'min:30'],
        ]);

        $slotMinutes = $data['slot_minutes'] ?? 120;
        $disponibility = Disponibility::findOrFail($data['id']);
        $start = Carbon::parse($disponibility->hour_star);
        $end = Carbon::parse($disponibility->hour_end);

        if ($start->greaterThanOrEqualTo($end)) {
            return errorResponse('Plage invalide pour la désagrégation');
        }

        $slots = [];
        $cursor = $start->copy();
        while ($cursor->lt($end)) {
            $slotEnd = $cursor->copy()->addMinutes($slotMinutes);
            if ($slotEnd->gt($end)) {
                $slotEnd = $end->copy();
            }
            $slots[] = [
                'hour_star' => $cursor->format('H:i'),
                'hour_end' => $slotEnd->format('H:i'),
            ];
            $cursor = $slotEnd->copy();
        }

        if (count($slots) <= 1) {
            return errorResponse('Impossible de désagréger un créneau trop court');
        }

        DB::transaction(function () use ($disponibility, $slots) {
            $disponibility->delete();
            foreach ($slots as $slot) {
                Disponibility::create([
                    'day' => $disponibility->day,
                    'hour_star' => $slot['hour_star'],
                    'hour_end' => $slot['hour_end'],
                    'subject_id' => $disponibility->subject_id,
                    'etablishment_id' => $disponibility->etablishment_id,
                    'is_grouped' => false,
                ]);
            }
        });

        return successResponse($slots, "Disponibilité désagrégée en " . count($slots) . " blocs");
    }

    public function convertMultiple(Request $request, DisponibilityToProgrammationService $service)
    {
        $data = $request->validate([
            'ids' => ['required', 'array', 'min:1'],
            'ids.*' => ['integer', 'exists:disponibilities,id'],
        ]);

        $user = $request->user();
        if ($user && $user->hasRole('teacher')) {
            return forbiddenResponse('Accès refusé');
        }

        $converted = [];
        $errors = [];
        foreach ($data['ids'] as $id) {
            try {
                $disp = Disponibility::findOrFail($id);
                $converted[] = $service->convert($disp);
            } catch (Exception $e) {
                $errors[$id] = $e->getMessage();
            }
        }

        return successResponse([
            'converted' => $converted,
            'errors' => $errors,
        ], 'Conversion groupée terminée');
    }

    private function notifyProgrammationCreation(Programmation $programmation, ?int $actorId = null): void
    {
        $programmerUser = $programmation->programmer?->user;
        $payload = [
            'type' => 'programmation_created_from_disponibility',
            'title' => 'Programmation générée',
            'message' => "Programmation créée pour {$this->resolveDayLabel($programmation->day)} ({$programmation->hour_star} - {$programmation->hour_end}).",
            'meta' => ['programmation_id' => $programmation->id],
            'action_url' => url('/dashboard/programmations'),
            'action_label' => 'Voir la programmation',
        ];
        $this->notifyAdminsAndProgrammer($programmerUser, $payload, $actorId);
    }

    private function resolveDayLabel(string|JourEnum|null $value): string
    {
        if ($value instanceof JourEnum) {
            return $value->value;
        }
        return (string) ($value ?? '—');
    }

    private function sendCreationNotification(Disponibility $disponibility, ?int $actorId)
    {
        $subject = $disponibility->subject;
        $programmerUser = $subject?->specialty?->programmer?->user;
        
        $this->notifyAdminsAndProgrammer($programmerUser, [
            'type' => 'disponibility_created',
            'title' => 'Nouvelle disponibilité',
            'message' => "Disponibilité ajoutée pour {$disponibility->day->value} ({$disponibility->hour_star} - {$disponibility->hour_end}).",
            'meta' => ['disponibility_id' => $disponibility->id, 'subject_id' => $disponibility->subject_id],
            'action_url' => url('/dashboard/disponibilities'),
            'action_label' => 'Voir les disponibilités',
        ], $actorId);
    }
}
