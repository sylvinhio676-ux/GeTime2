<?php

namespace App\Http\Controllers;

use App\Http\Requests\Stores\SpecialtyProgrammationRequest;
use App\Http\Requests\Updates\SpecialtyProgrammationUpdateRequest;
use App\Models\SpecialtyProgrammation;
use Illuminate\Http\Request;
use Exception;

class SpecialtyProgrammationController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        try {
            $specialtyProgrammations = SpecialtyProgrammation::with(['specialty', 'programmation'])->get();
            if (!$specialtyProgrammations) throw new Exception("Aucune programmation de spécialité trouvée");
            return successResponse($specialtyProgrammations);
        } catch (Exception $e) {
            return errorResponse($e->getMessage());
        }
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(SpecialtyProgrammationRequest $request)
    {
        try {
            $specialtyProgrammation = SpecialtyProgrammation::create($request->validated());
            return successResponse($specialtyProgrammation, "Programmation de spécialité créée avec succès");
        } catch (Exception $e) {
            return errorResponse($e->getMessage());
        }
    }

    /**
     * Display the specified resource.
     */
    public function show(SpecialtyProgrammation $specialtyProgrammation)
    {
        try {
            if (!$specialtyProgrammation) return notFoundResponse("Programmation de spécialité non trouvée");
            return successResponse($specialtyProgrammation);
        } catch (Exception $e) {
            return errorResponse($e->getMessage());
        }
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(SpecialtyProgrammationUpdateRequest $request, SpecialtyProgrammation $specialtyProgrammation)
    {
        try {
            $specialtyProgrammation->update($request->validated());
            return successResponse($specialtyProgrammation, "Programmation de spécialité modifiée avec succès");
        } catch (Exception $e) {
            return errorResponse($e->getMessage());
        }
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(SpecialtyProgrammation $specialtyProgrammation)
    {
        try {
            $specialtyProgrammation->delete();
            return successResponse(null, "Programmation de spécialité supprimée avec succès");
        } catch (Exception $e) {
            return errorResponse($e->getMessage());
        }
    }
}
