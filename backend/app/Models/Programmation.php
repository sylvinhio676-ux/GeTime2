<?php

namespace App\Models;

use App\Enum\JourEnum;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Notifications\Notifiable;
use Carbon\Carbon;

class Programmation extends Model
{
    use HasFactory, Notifiable;

    // Propriété pour éviter les boucles infinies lors des sauvegardes
    public static $isUpdatingStatus = false;

    protected $fillable = [
        'day', 'hour_star', 'hour_end', 'subject_id', 
        'programmer_id', 'year_id', 'room_id', 'status', 'hours_used',
    ];

    protected $casts = [
        'day' => JourEnum::class,
        'hours_used' => 'float', // Changé de decimal:2 à float pour faciliter les calculs mathématiques PHP
    ];

    public function subject() { return $this->belongsTo(Subject::class); }
    public function room() { return $this->belongsTo(Room::class); }
    public function year() { return $this->belongsTo(Year::class); }
    public function programmer() { return $this->belongsTo(Programmer::class); }

    public function specialties() {
        return $this->belongsToMany(Specialty::class, 'specialty_programmations', 'programmation_id', 'specialty_id');
    }

    protected static function booted()
    {
        static::saved(function ($programmation) {
            if (static::$isUpdatingStatus) return;
            static::$isUpdatingStatus = true;

            $quotaService = app(\App\Services\QuotaService::class);

            if ($programmation->wasRecentlyCreated) {
                $quotaService->updateQuotaOnCreate($programmation);
            } else {
                // Utilisation de getOriginal pour comparer les heures avant modif
                $oldHours = (float) ($programmation->getOriginal('hours_used') ?? 0);
                $quotaService->updateQuotaOnUpdate($programmation, $oldHours);
            }

            // On met à jour le statut du cours
            static::updateSubjectStatus($programmation->subject_id);
            
            static::$isUpdatingStatus = false;
        });

        static::deleted(function ($programmation) {
            app(\App\Services\QuotaService::class)->updateQuotaOnDelete($programmation);
            static::updateSubjectStatus($programmation->subject_id);
        });
    }

    /**
     * Calcule le statut du cours basé sur la colonne hours_used
     * des séances dont le statut est 'published'.
     */
    public static function updateSubjectStatus($subjectId)
    {
        $subject = Subject::find($subjectId);
        if (!$subject) return;

        // ÉVITER CARBON ICI : Utilisons directement la colonne hours_used calculée par le service
        // C'est beaucoup plus performant et moins sujet aux erreurs de parsing
        $publishedHours = self::where('subject_id', $subjectId)
            ->where('status', 'published')
            ->sum('hours_used');

        // Debug optionnel (à retirer après test)
        // \Log::info("Subject ID: {$subjectId}, Published Hours: {$publishedHours}, Total Target: {$subject->total_hour}");

        if ($publishedHours <= 0) {
            $newStatus = 'not_programmed';
        } elseif ($publishedHours >= $subject->total_hour) {
            $newStatus = 'completed';
        } else {
            $newStatus = 'in_progress';
        }

        // Utilisation de updateQuietly ou save pour mettre à jour la table subjects
        $subject->update(['status' => $newStatus]);
    }
}