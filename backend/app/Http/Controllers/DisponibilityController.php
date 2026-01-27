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
    public function index()
    {
        try {
            $query = Disponibility::with(['subject.teacher.user','subject.specialty.level','etablishment']);
            $user = request()->user();
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
            $data = $request->validated();
            $disponibility = Disponibility::create($data);
            $subject = $disponibility->subject;
            $programmerUser = $subject?->specialty?->programmer?->user;
            $this->notifyAdminsAndProgrammer($programmerUser, [
                'type' => 'disponibility_created',
                'title' => 'Nouvelle disponibilité',
                'message' => "Disponibilité ajoutée pour {$data['day']} ({$data['hour_star']} - {$data['hour_end']}).",
                'meta' => ['disponibility_id' => $disponibility->id, 'subject_id' => $data['subject_id']],
                'action_url' => url('/dashboard/disponibilities'),
                'action_label' => 'Voir les disponibilités',
            ], $request->user()?->id);
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
                'message' => "Disponibilité modifiée pour {$disponibility->day} ({$disponibility->hour_star} - {$disponibility->hour_end}).",
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
            $overrides = array_filter(
                $request->only(['room_id', 'programmer_id', 'year_id', 'status']),
                fn ($value) => $value !== null
            );

            $programmation = $service->convert($disponibility, $overrides);
            $this->notifyProgrammationCreation($programmation, $request->user()?->id);
            return successResponse($programmation, "Programmation créée à partir de la disponibilité");
        } catch (Exception $e) {
            return errorResponse($e->getMessage());
        }
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
}
