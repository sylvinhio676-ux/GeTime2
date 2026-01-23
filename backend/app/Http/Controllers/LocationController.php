<?php

namespace App\Http\Controllers;

use App\Http\Requests\Stores\LocationRequest;
use App\Http\Requests\Updates\LocationUpdateRequest;
use App\Models\Location;
use Exception;

class LocationController extends Controller
{
    public function index()
    {
        try {
            $locations = Location::query()->orderBy('city')->orderBy('address')->get();
            return successResponse($locations);
        } catch (Exception $e) {
            return errorResponse($e->getMessage());
        }
    }

    public function store(LocationRequest $request)
    {
        try {
            $location = Location::create($request->validated());
            return successResponse($location, 'Location enregistrée');
        } catch (Exception $e) {
            return errorResponse($e->getMessage());
        }
    }

    public function update(LocationUpdateRequest $request, Location $location)
    {
        try {
            $location->update(array_filter($request->validated(), fn ($value) => $value !== null));
            return successResponse($location, 'Location mise à jour');
        } catch (Exception $e) {
            return errorResponse($e->getMessage());
        }
    }

    public function destroy(Location $location)
    {
        try {
            $location->delete();
            return successResponse(null, 'Location supprimée');
        } catch (Exception $e) {
            return errorResponse($e->getMessage());
        }
    }
}
