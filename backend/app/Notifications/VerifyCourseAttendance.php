<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Notification;
use Illuminate\Contracts\Queue\ShouldQueue;

class VerifyCourseAttendance extends Notification
{
    use Queueable;

    // 1. Déclarer les propriétés pour qu'elles soient accessibles dans toute la classe
    protected $programmation;
    protected $subject;

    /**
     * 2. Injecter les données lors de la création de la notification
     */
    public function __construct($programmation)
    {
        $this->programmation = $programmation;
        // On récupère la matière directement depuis la relation de la programmation
        $this->subject = $programmation->subject;
    }

    /**
     * 3. Choisir le canal (on utilise 'database' pour que React puisse les lire)
     */
    public function via(object $notifiable): array
    {
        return ['database']; 
    }

    /**
     * 4. Structure des données envoyées au Frontend (React)
     */
    public function toArray(object $notifiable): array
    {
        return [
            'type' => 'verification_cours', //Declancheur pour les boutons React
            'title' => 'Vérification de cours',
            'message' => "Le cours de {$this->subject->subject_name} a-t-il été fait ?",
            'programmation_id' => $this->programmation->id,
            'category' => 'pédagogie',
            'teacher_name' => $this->subject->teacher->name ?? 'N/A',
        ];
    }
}