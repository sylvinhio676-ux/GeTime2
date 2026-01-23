<?php

namespace App\Http\Controllers;

use App\Http\Requests\Stores\CampusRequest;
use App\Http\Requests\Updates\CampusUpdateRequest;
use App\Models\Campus;
use App\Models\Location;
use Illuminate\Http\Request;
use Illuminate\Support\Arr;
use Illuminate\Support\Collection;

class CampusController extends Controller
{
    public function index()
    {
        try {
            $campus = $this->buildCampusQuery()->get();
            if ($campus->isEmpty()) throw new Exception("Aucun campus trouvé");
            return successResponse($campus);
        } catch (Exception $e) {
            return errorResponse($e->getMessage());
        }
    }

    public function store(CampusRequest $request)
    {
        try {
            $validated = $request->validated();
            $locationData = Arr::only($validated, ['city', 'address', 'latitude', 'longitude']);
            $location = Location::create(array_filter($locationData, fn($value) => $value !== null && $value !== ''));
            $campusData = array_merge($validated, ['location_id' => $location->id ?? null]);
            $campus = Campus::create($campusData);
            return successResponse($campus->load('location'), "Campus créé avec succès");
        } catch (Exception $e) {
            return errorResponse($e->getMessage());
        }
    }

    public function show(Campus $campus)
    {
        try {
            if (!$campus) return notFoundResponse("Campus non trouvé");
            $campus = $this->buildCampusQuery()->where('id', $campus->id)->first();
            return successResponse($campus);
        } catch (Exception $e) {
            return errorResponse($e->getMessage());
        }
    }

    public function update(CampusUpdateRequest $request, Campus $campus)
    {
        try {
            $validated = $request->validated();
            $locationData = Arr::only($validated, ['city', 'address', 'latitude', 'longitude']);
            if (!empty(array_filter($locationData, fn($value) => $value !== null && $value !== ''))) {
                if ($campus->location) {
                    $campus->location->update($locationData);
                } else {
                $location = Location::create(array_filter($locationData, fn($value) => $value !== null && $value !== ''));
                    $campus->location_id = $location->id;
                }
            }
            $campus->fill($validated);
            $campus->save();
            return successResponse($campus->load('location'), "Campus modifié avec succès");
        } catch (Exception $e) {
            return errorResponse($e->getMessage());
        }
    }

    public function destroy(Campus $campus)
    {
        try {
            $campus->delete();
            if (!$campus) return notFoundResponse("Campus non trouvé");
            return successResponse(null,"Campus supprimé avec succès");
        } catch (Exception $e) {
            return errorResponse($e->getMessage());
        }
    }

    public function teacherCampuses(Request $request)
    {
        try {
            $teacher = $request->user()?->teacher;
            if (!$teacher) return notFoundResponse("Profil enseignant introuvable");

            $establishmentIds = $teacher->subjects()
                ->whereHas('specialty.programmer')
                ->with('specialty.programmer')
                ->get()
                ->pluck('specialty.programmer.etablishment_id')
                ->filter()
                ->unique();

            if ($establishmentIds->isEmpty()) {
                return successResponse([], "Aucun établissement associé");
            }

            $campuses = $this->buildCampusQuery()
                ->whereIn('etablishment_id', $establishmentIds)
                ->get();

            return successResponse($campuses);
        } catch (Exception $e) {
            return errorResponse($e->getMessage());
        }
    }

    private function buildCampusQuery(): \Illuminate\Database\Eloquent\Builder
    {
        return Campus::with(['etablishment', 'rooms', 'location'])
            ->withCount([
                'rooms',
                'rooms as available_rooms_count' => function ($query) {
                    $query->where('is_available', true);
                }
            ])
            ->withSum('rooms', 'capacity');
    }
}
