<?php

namespace App\Http\Controllers;

use App\Http\Requests\Stores\SubjectRequest;
use App\Http\Requests\Updates\SubjectUpdateRequest;
use App\Models\Subject;
use Illuminate\Http\Request;
use Exception;

class SubjectController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        try {
            $query = Subject::with(['specialty', 'teacher.user', 'specialty']);
            $user = request()->user();
            if ($user && $user->hasRole('teacher')) {
                $teacherId = $user->teacher?->id;
                $query->when($teacherId, function ($q) use ($teacherId) {
                    $q->where('teacher_id', $teacherId);
                });
            }
            $subjects = $query->get();
            if (!$subjects) throw new Exception("Aucune matière trouvée");
            return successResponse($subjects);
        } catch (Exception $e) {
            return errorResponse($e->getMessage());
        }
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(SubjectRequest $request)
    {
        try {
            $subject = Subject::create($request->validated());
            return successResponse($subject, "Matière créée avec succès");
        } catch (Exception $e) {
            return errorResponse($e->getMessage());
        }
    }

    /**
     * Display the specified resource.
     */
    public function show(Subject $subject)
    {
        try {
            if (!$subject) return notFoundResponse("Matière non trouvée");
            $user = request()->user();
            if ($user && $user->hasRole('teacher')) {
                $teacherId = $user->teacher?->id;
                if ($teacherId && $subject->teacher_id !== $teacherId) {
                    return forbiddenResponse("Accès refusé");
                }
            }
            return successResponse($subject);
        } catch (Exception $e) {
            return errorResponse($e->getMessage());
        }
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(SubjectUpdateRequest $request, Subject $subject)
    {
        try {
            $subject->update($request->validated());
            return successResponse($subject, "Matière modifiée avec succès");
        } catch (Exception $e) {
            return errorResponse($e->getMessage());
        }
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Subject $subject)
    {
        try {
            $subject->delete();
            return successResponse(null, "Matière supprimée avec succès");
        } catch (Exception $e) {
            return errorResponse($e->getMessage());
        }
    }
}
