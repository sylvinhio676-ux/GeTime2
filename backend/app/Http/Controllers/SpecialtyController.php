<?php

namespace App\Http\Controllers;

use App\Http\Requests\Stores\SpecialtyRequest;
use App\Http\Requests\Updates\SpecialtyUpdateRequest;
use App\Models\Specialty;
use Illuminate\Http\Request;
use Exception;

class SpecialtyController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        try {
            $query = Specialty::with(['sector.school.responsible', 'programmer.user', 'level']);
            $user = request()->user();
            if ($user && $user->hasRole('teacher')) {
                $teacherId = $user->teacher?->id;
                $query->when($teacherId, function ($q) use ($teacherId) {
                    $q->whereHas('subjects', function ($subjectQuery) use ($teacherId) {
                        $subjectQuery->where('teacher_id', $teacherId);
                    });
                });
            }
            $specialties = $query->get();
            if (!$specialties) throw new Exception("Aucune spécialité trouvée");
            return successResponse($specialties);
        } catch (Exception $e) {
            return errorResponse($e->getMessage());
        }
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(SpecialtyRequest $request)
    {
        try {
            $specialty = Specialty::create($request->validated());
            return successResponse($specialty, "Spécialité créée avec succès");
        } catch (Exception $e) {
            return errorResponse($e->getMessage());
        }
    }

    /**
     * Display the specified resource.
     */
    public function show(Specialty $specialty)
    {
        try {
            if (!$specialty) return notFoundResponse("Spécialité non trouvée");
            $user = request()->user();
            if ($user && $user->hasRole('teacher')) {
                $teacherId = $user->teacher?->id;
                if ($teacherId) {
                    $hasSubject = $specialty->subjects()->where('teacher_id', $teacherId)->exists();
                    if (!$hasSubject) {
                        return forbiddenResponse("Accès refusé");
                    }
                }
            }
            return successResponse($specialty);
        } catch (Exception $e) {
            return errorResponse($e->getMessage());
        }
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(SpecialtyUpdateRequest $request, Specialty $specialty)
    {
        try {
            $specialty->update($request->validated());
            return successResponse($specialty, "Spécialité modifiée avec succès");
        } catch (Exception $e) {
            return errorResponse($e->getMessage());
        }
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Specialty $specialty)
    {
        try {
            $specialty->delete();
            return successResponse(null, "Spécialité supprimée avec succès");
        } catch (Exception $e) {
            return errorResponse($e->getMessage());
        }
    }
}
