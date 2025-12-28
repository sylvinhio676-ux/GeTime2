<?php

use Illuminate\Support\Str;
use Illuminate\Support\Carbon;

/**
 * --------------------------------------
 *  Réponses API standardisées
 * --------------------------------------
 */

if (!function_exists('successResponse')) {
    function successResponse($data = null, string $message = "Opération réussie")
    {
        return response()->json([
            'status'  => 'success',
            'message' => $message,
            'data'    => $data
        ], 200);
    }
}

if (!function_exists('createdResponse')) {
    function createdResponse($data = null, string $message = "Création réussie")
    {
        return response()->json([
            'status'  => 'success',
            'message' => $message,
            'data'    => $data
        ], 201);
    }
}

if (!function_exists('errorResponse')) {
    function errorResponse(string $message = "Erreur", $data = null)
    {
        return response()->json([
            'status'  => 'error',
            'message' => $message,
            'data'    => $data
        ], 400);
    }
}

if (!function_exists('notFoundResponse')) {
    function notFoundResponse(string $message = "Ressource non trouvée")
    {
        return response()->json([
            'status'  => 'error',
            'message' => $message,
            'data'    => null
        ], 404);
    }
}

if (!function_exists('forbiddenResponse')) {
    function forbiddenResponse(string $message = "Action interdite")
    {
        return response()->json([
            'status'  => 'error',
            'message' => $message,
            'data'    => null
        ], 403);
    }
}

if (!function_exists('unauthorizedResponse')) {
    function unauthorizedResponse(string $message = "Non autorisé")
    {
        return response()->json([
            'status'  => 'error',
            'message' => $message,
            'data'    => null
        ], 401);
    }
}

if (!function_exists('validationErrorResponse')) {
    function validationErrorResponse($errors, string $message = "Erreur de validation")
    {
        return response()->json([
            'status'  => 'error',
            'message' => $message,
            'errors'  => $errors
        ], 422);
    }
}

/**
 * --------------------------------------
 *  Pagination et collections
 * --------------------------------------
 */

if (!function_exists('paginatedResponse')) {
    /**
     * Retourne une collection paginée avec formatage standard
     */
    function paginatedResponse($paginator, string $message = "Liste récupérée")
    {
        return response()->json([
            'status'  => 'success',
            'message' => $message,
            'data'    => $paginator->items(),
            'meta'    => [
                'current_page' => $paginator->currentPage(),
                'last_page'    => $paginator->lastPage(),
                'per_page'     => $paginator->perPage(),
                'total'        => $paginator->total(),
            ]
        ], 200);
    }
}

/**
 * --------------------------------------
 *  Formatage des dates / heures
 * --------------------------------------
 */

if (!function_exists('formatDate')) {
    function formatDate($date = null, $format = 'd/m/Y H:i')
    {
        if (!$date) return null;
        return Carbon::parse($date)->format($format);
    }
}

/**
 * --------------------------------------
 *  Génération d'identifiants uniques
 * --------------------------------------
 */

if (!function_exists('generateUniqueId')) {
    function generateUniqueId($length = 10)
    {
        return Str::upper(Str::random($length));
    }
}

/**
 * --------------------------------------
 *  Fonctions spécifiques au projet
 * --------------------------------------
 */

if (!function_exists('formatSchedule')) {
    /**
     * Formate un emploi du temps ou programmation
     * Ex: ajout des champs jour, heure début/fin, salle
     */
    function formatSchedule($programmation)
    {
        return [
            'id'         => $programmation->id,
            'matiere'    => $programmation->matiere->nom ?? null,
            'professeur' => $programmation->matiere->professeur->user->name ?? null,
            'specialite' => $programmation->matiere->specialite->libelle ?? null,
            'salle'      => $programmation->salle->nom ?? null,
            'jour'       => $programmation->jour ?? null,
            'heure_debut'=> formatDate($programmation->heure_debut, 'H:i'),
            'heure_fin'  => formatDate($programmation->heure_fin, 'H:i'),
        ];
    }
}

if (!function_exists('getCurrentAcademicYear')) {
    /**
     * Retourne l'année académique courante
     */
    function getCurrentAcademicYear()
    {
        $year = date('Y');
        $month = date('m');

        if ($month >= 9) { // septembre ou plus
            return $year . '-' . ($year + 1);
        }

        return ($year - 1) . '-' . $year;
    }
}
