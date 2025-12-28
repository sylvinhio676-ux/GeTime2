<?php

namespace App\Http\Controllers;

use App\Http\Requests\Stores\YearRequest;
use App\Http\Requests\Updates\YearUpdateRequest;
use App\Models\Year;
use Illuminate\Http\Request;
use Exception;

class YearController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        try {
            $years = Year::all();
            if (!$years) throw new Exception("Aucune année trouvée");
            return successResponse($years);
        } catch (Exception $e) {
            return errorResponse($e->getMessage());
        }
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(YearRequest $request)
    {
        try {
            $year = Year::create($request->validated());
            return successResponse($year, "Année créée avec succès");
        } catch (Exception $e) {
            return errorResponse($e->getMessage());
        }
    }

    /**
     * Display the specified resource.
     */
    public function show(Year $year)
    {
        try {
            if (!$year) return notFoundResponse("Année non trouvée");
            return successResponse($year);
        } catch (Exception $e) {
            return errorResponse($e->getMessage());
        }
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(YearUpdateRequest $request, Year $year)
    {
        try {
            $year->update($request->validated());
            return successResponse($year, "Année modifiée avec succès");
        } catch (Exception $e) {
            return errorResponse($e->getMessage());
        }
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Year $year)
    {
        try {
            $year->delete();
            return successResponse(null, "Année supprimée avec succès");
        } catch (Exception $e) {
            return errorResponse($e->getMessage());
        }
    }
}
