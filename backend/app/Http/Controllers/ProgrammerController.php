<?php

namespace App\Http\Controllers;

use App\Http\Requests\Stores\ProgrammerRequest;
use App\Http\Requests\Updates\ProgrammerUpdateRequest;
use App\Models\Programmer;
use Illuminate\Http\Request;
use Exception;

class ProgrammerController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        try {
            $programmers = Programmer::with(['user','etablishment'])->get();
            if (!$programmers) throw new Exception("Aucun programmateur trouvé");
            return successResponse($programmers);
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

            $programmerIds = $teacher->subjects()
                ->with('specialty.programmer')
                ->get()
                ->map(fn ($subject) => $subject->specialty?->programmer?->id)
                ->filter()
                ->unique();

            if ($programmerIds->isEmpty()) {
                return successResponse([], "Aucun programmateur lié");
            }

            $programmers = Programmer::with(['user', 'etablishment'])->whereIn('id', $programmerIds)->get();
            return successResponse($programmers);
        } catch (Exception $e) {
            return errorResponse($e->getMessage());
        }
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(ProgrammerRequest $request)
    {
        try {
            $programmer = Programmer::create($request->validated());
            return successResponse($programmer, "Programmateur créé avec succès");
        } catch (Exception $e) {
            return errorResponse($e->getMessage());
        }
    }

    /**
     * Display the specified resource.
     */
    public function show(Programmer $programmer)
    {
        try {
            if (!$programmer) return notFoundResponse("Programmateur non trouvé");
            return successResponse($programmer);
        } catch (Exception $e) {
            return errorResponse($e->getMessage());
        }
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(ProgrammerUpdateRequest $request, Programmer $programmer)
    {
        try {
            $programmer->update($request->validated());
            return successResponse($programmer, "Programmateur modifié avec succès");
        } catch (Exception $e) {
            return errorResponse($e->getMessage());
        }
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Programmer $programmer)
    {
        try {
            $programmer->delete();
            return successResponse(null, "Programmateur supprimé avec succès");
        } catch (Exception $e) {
            return errorResponse($e->getMessage());
        }
    }
}
