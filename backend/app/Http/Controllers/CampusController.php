<?php

namespace App\Http\Controllers;

use App\Http\Requests\Stores\CampusRequest;
use App\Http\Requests\Updates\CampusUpdateRequest;
use App\Models\Campus;
use Illuminate\Http\Request;
use Exception;

class CampusController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        try{
            $campus = Campus::with('etablishment')->get();
            if(!$campus) throw new Exception("Aucun campus trouvé");
            return successResponse($campus);   
        }catch(Exception $e){
            return errorResponse($e->getMessage());
        }
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(CampusRequest $request)
    {
        try{
            $campus = Campus::create($request->validated());
            return successResponse($campus, "Campus créé avec succès");
        }catch(Exception $e){
            return errorResponse($e->getMessage());
        }
    }

    /**
     * Display the specified resource.
     */
    public function show(Campus $campus)
    {
        try{
            if(!$campus) return notFoundResponse("Campus non trouvé");
            return successResponse($campus);
        }catch(Exception $e){
            return errorResponse($e->getMessage());
        }
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(CampusUpdateRequest $request, Campus $campus)
    {
        try{
            $campus->update($request->validated());
            return successResponse($campus, "Campus modifié avec succès");
        }catch(Exception $e){
            return errorResponse($e->getMessage());
        }
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Campus $campus)
    {
        try{
            $campus->delete();
            if(!$campus) return notFoundResponse("Campus non trouvé");
            return successResponse(null,"Campus supprimé avec succès");
        }catch(Exception $e){
            return errorResponse($e->getMessage());
        }
    }
}
