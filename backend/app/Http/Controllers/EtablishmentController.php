<?php

namespace App\Http\Controllers;

use App\Http\Requests\Stores\EtablishmentRequest;
use App\Http\Requests\Updates\EtablishmentUpdateRequest;
use App\Models\Etablishment;
use Illuminate\Http\Request;
use Exception;

class EtablishmentController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        try {
            $etablishments = Etablishment::all();
            if (!$etablishments) throw new Exception("Aucun établissement trouvé");
            return successResponse($etablishments);
        } catch (Exception $e) {
            return errorResponse($e->getMessage());
        }
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(EtablishmentRequest $request)
    {
        try {
            $etablishment = Etablishment::create($request->validated());
            return successResponse($etablishment, "Établissement créé avec succès");
        } catch (Exception $e) {
            return errorResponse($e->getMessage());
        }
    }

    /**
     * Display the specified resource.
     */
    public function show(Etablishment $etablishment)
    {
        try {
            if (!$etablishment) return notFoundResponse("Établissement non trouvé");
            return successResponse($etablishment);
        } catch (Exception $e) {
            return errorResponse($e->getMessage());
        }
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(EtablishmentUpdateRequest $request, Etablishment $etablishment)
    {
        try {
            $etablishment->update($request->validated());
            return successResponse($etablishment, "Établissement modifié avec succès");
        } catch (Exception $e) {
            return errorResponse($e->getMessage());
        }
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Etablishment $etablishment)
    {
        try {
            $etablishment->delete();
            return successResponse(null, "Établissement supprimé avec succès");
        } catch (Exception $e) {
            return errorResponse($e->getMessage());
        }
    }
}
