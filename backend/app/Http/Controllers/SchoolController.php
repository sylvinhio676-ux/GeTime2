<?php

namespace App\Http\Controllers;

use App\Models\School;
use App\Http\Requests\Stores\SchoolRequest;
use App\Http\Requests\Updates\SchoolUpdateRequest;
use Exception;

class SchoolController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        try {
            $schools = School::with(['responsible', 'sectors'])->withCount('sectors')->get();
            if (!$schools) throw new Exception("Aucune école trouvée");
            return successResponse($schools);
        } catch (Exception $e) {
            return errorResponse($e->getMessage());
        }
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(SchoolRequest $request)
    {
        try {
            $school = School::create($request->validated());
            return successResponse($school, "École créée avec succès");
        } catch (Exception $e) {
            return errorResponse($e->getMessage());
        }
    }

    /**
     * Display the specified resource.
     */
    public function show(School $school)
    {
        try {
            if (!$school) return notFoundResponse("École non trouvée");
            return successResponse($school);
        } catch (Exception $e) {
            return errorResponse($e->getMessage());
        }
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(SchoolUpdateRequest $request, School $school)
    {
        try {
            $school->update($request->validated());
            return successResponse($school, "École modifiée avec succès");
        } catch (Exception $e) {
            return errorResponse($e->getMessage());
        }
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(School $school)
    {
        try {
            $school->delete();
            return successResponse(null, "École supprimée avec succès");
        } catch (Exception $e) {
            return errorResponse($e->getMessage());
        }
    }
}
