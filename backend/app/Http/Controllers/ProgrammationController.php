<?php

namespace App\Http\Controllers;

use App\Http\Requests\Stores\ProgrammationRequest;
use App\Http\Requests\Updates\ProgrammationUpdateRequest;
use App\Models\Programmation;
use Illuminate\Http\Request;
use Exception;

class ProgrammationController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        try {
            $programmations = Programmation::with(['subject','programer','year'])->get();
            if (!$programmations) throw new Exception("Aucune programmation trouvée");
            return successResponse($programmations);
        } catch (Exception $e) {
            return errorResponse($e->getMessage());
        }
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(ProgrammationRequest $request)
    {
        try {
            $programmation = Programmation::create($request->validated());
            return successResponse($programmation, "Programmation créée avec succès");
        } catch (Exception $e) {
            return errorResponse($e->getMessage());
        }
    }

    /**
     * Display the specified resource.
     */
    public function show(Programmation $programmation)
    {
        try {
            if (!$programmation) return notFoundResponse("Programmation non trouvée");
            return successResponse($programmation);
        } catch (Exception $e) {
            return errorResponse($e->getMessage());
        }
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(ProgrammationUpdateRequest $request, Programmation $programmation)
    {
        try {
            $programmation->update($request->validated());
            return successResponse($programmation, "Programmation modifiée avec succès");
        } catch (Exception $e) {
            return errorResponse($e->getMessage());
        }
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Programmation $programmation)
    {
        try {
            $programmation->delete();
            return successResponse(null, "Programmation supprimée avec succès");
        } catch (Exception $e) {
            return errorResponse($e->getMessage());
        }
    }
}
