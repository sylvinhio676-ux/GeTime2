<?php

namespace App\Http\Controllers;

use App\Http\Requests\Stores\RoomRequest;
use App\Http\Requests\Updates\RoomUpdateRequest;
use App\Models\Room;
use Illuminate\Http\Request;
use Exception;

class RoomController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        try {
            $rooms = Room::with(['campus','programmation'])->get();
            if (!$rooms) throw new Exception("Aucune salle trouvée");
            return successResponse($rooms);
        } catch (Exception $e) {
            return errorResponse($e->getMessage());
        }
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(RoomRequest $request)
    {
        try {
            $room = Room::create($request->validated());
            return successResponse($room, "Salle créée avec succès");
        } catch (Exception $e) {
            return errorResponse($e->getMessage());
        }
    }

    /**
     * Display the specified resource.
     */
    public function show(Room $room)
    {
        try {
            if (!$room) return notFoundResponse("Salle non trouvée");
            return successResponse($room);
        } catch (Exception $e) {
            return errorResponse($e->getMessage());
        }
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(RoomUpdateRequest $request, Room $room)
    {
        try {
            $room->update($request->validated());
            return successResponse($room, "Salle modifiée avec succès");
        } catch (Exception $e) {
            return errorResponse($e->getMessage());
        }
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Room $room)
    {
        try {
            $room->delete();
            return successResponse(null, "Salle supprimée avec succès");
        } catch (Exception $e) {
            return errorResponse($e->getMessage());
        }
    }
}
