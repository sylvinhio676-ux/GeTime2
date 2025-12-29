<?php

namespace App\Http\Controllers;

use App\Http\Requests\Stores\DisponibilityRequest;
use App\Http\Requests\Updates\DisponibilityUpdateRequest;
use App\Models\Disponibility;
use App\Models\Room;
use App\Models\Subject;
use Illuminate\Http\Request;
use Exception;

class DisponibilityController extends Controller
{
    private function pickAvailableRoom(int $campusId, Subject $subject, string $day, string $start, string $end): ?Room
    {
        $requiredCapacity = $subject->specialty?->number_student ?? 0;
        $roomType = $subject->type_subject?->value ?? null;

        $roomsQuery = Room::where('campus_id', $campusId)
            ->where('is_available', true)
            ->where('capacity', '>=', $requiredCapacity);

        if ($roomType) {
            $roomsQuery->where('type_room', $roomType);
        }

        return $roomsQuery->whereDoesntHave('programmations', function ($q) use ($day, $start, $end) {
            $q->where('day', $day)
                ->where('hour_star', '<', $end)
                ->where('hour_end', '>', $start);
        })->orderBy('capacity')->first();
    }

    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        try {
            $disponibilities = Disponibility::with(['subject.teacher.user','room','campus'])->get();
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
            $subject = Subject::with('specialty')->findOrFail($data['subject_id']);
            $room = $this->pickAvailableRoom($data['campus_id'], $subject, $data['day'], $data['hour_star'], $data['hour_end']);

            if (!$room) {
                return errorResponse("Aucune salle disponible pour ce créneau");
            }

            $data['room_id'] = $room->id;
            $disponibility = Disponibility::create($data);
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
            $disponibility->update($request->validated());
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
            $disponibility->delete();
            return successResponse(null, "Disponibilité supprimée avec succès");
        } catch (Exception $e) {
            return errorResponse($e->getMessage());
        }
    }
}
