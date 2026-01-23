<?php

namespace App\Http\Controllers;

use App\Http\Requests\Stores\SectorRequest;
use App\Http\Requests\Updates\SectorUpdateRequest;
use App\Models\Sector;
use Illuminate\Http\Request;
use Exception;

class SectorController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        try {
            $sectors = Sector::with(['school', 'specialities'])->get();
            if (!$sectors) throw new Exception("Aucun secteur trouvé");
            return successResponse($sectors);
        } catch (Exception $e) {
            return errorResponse($e->getMessage());
        }
    }

    public function teacherIndex(Request $request)
    {
        try {
            $teacher = $request->user()?->teacher;
            if (!$teacher) {
                return successResponse([], "Profil enseignant introuvable");
            }

            $schoolIds = $teacher->subjects()
                ->with('specialty.sector')
                ->get()
                ->map(fn ($subject) => $subject->specialty?->sector?->school_id)
                ->filter()
                ->unique();

            if ($schoolIds->isEmpty()) {
                return successResponse([], "Aucun secteur lié");
            }

            $sectors = Sector::with(['school', 'specialities'])
                ->whereIn('school_id', $schoolIds)
                ->get();

            return successResponse($sectors);
        } catch (Exception $e) {
            return errorResponse($e->getMessage());
        }
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(SectorRequest $request)
    {
        try {
            $sector = Sector::create($request->validated());
            return successResponse($sector, "Secteur créé avec succès");
        } catch (Exception $e) {
            return errorResponse($e->getMessage());
        }
    }

    /**
     * Display the specified resource.
     */
    public function show(Sector $sector)
    {
        try {
            if (!$sector) return notFoundResponse("Secteur non trouvé");
            return successResponse($sector);
        } catch (Exception $e) {
            return errorResponse($e->getMessage());
        }
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(SectorUpdateRequest $request, Sector $sector)
    {
        try {
            $sector->update($request->validated());
            return successResponse($sector, "Secteur modifié avec succès");
        } catch (Exception $e) {
            return errorResponse($e->getMessage());
        }
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Sector $sector)
    {
        try {
            $sector->delete();
            return successResponse(null, "Secteur supprimé avec succès");
        } catch (Exception $e) {
            return errorResponse($e->getMessage());
        }
    }
}
