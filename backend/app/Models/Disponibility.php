<?php

namespace App\Models;

use App\Enum\JourEnum;
use App\Events\DisponibilityCreated;
use App\Events\DisponibilityDeleted;
use App\Events\DisponibilityUpdated;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Notifications\Notifiable;

class Disponibility extends Model
{
    use HasFactory,Notifiable;
    protected $fillable = [
        'day',
        'hour_star',
        'hour_end',
        'subject_id',
        'etablishment_id',
        'used',
    ];

    protected $casts =[
        'day' => JourEnum::class,
        'used' => 'boolean',
    ];

    protected static function booted(): void
    {
        static::created(fn($d) => event(new DisponibilityCreated($d)));
        static::updated(fn($d) => event(new DisponibilityUpdated($d)));
        static::deleted(fn($d) => event(new DisponibilityDeleted($d)));
    }
 
    public function subject(){
        return $this->belongsTo(Subject::class);
    }

    public function etablishment(){
        return $this->belongsTo(Etablishment::class);
    }

    public function markAsUsed(): self
    {
        if (!$this->used) {
            $this->update(['used' => true]);
        }
        return $this;
    }
}
