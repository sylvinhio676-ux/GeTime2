<?php

namespace App\Http\Controllers;

use App\Http\Requests\Stores\DisponibilityRequest;
use App\Http\Requests\Updates\DisponibilityUpdateRequest;
use App\Models\Disponibility;
use Illuminate\Http\Request;
use Exception;

class DisponibilityController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        try {
            $disponibilities = Disponibility::with(['subject.teacher.user','etablishment'])->get();
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
            $disponibility = Disponibility::create($request->validated());
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
