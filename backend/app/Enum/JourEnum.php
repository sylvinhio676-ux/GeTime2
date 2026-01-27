<?php

namespace App\Enum;

use ValueError;

enum JourEnum: string
{
    case LUNDI = 'Lundi';
    case MARDI = 'Mardi';
    case MERCREDI = 'Mercredi';
    case JEUDI = 'Jeudi';
    case VENDREDI = 'Vendredi';
    case SAMEDI = 'Samedi';
    case DIMANCHE = 'Dimanche';

    public function label(): string
    {
        return $this->value;
    }

    public function lowercase(): string
    {
        return mb_strtolower($this->value, 'UTF-8');
    }

    public static function fromString(string $value): self
    {
        $normalized = mb_convert_case(trim($value), MB_CASE_TITLE, 'UTF-8');
        if ($enum = self::tryFrom($normalized)) {
            return $enum;
        }

        throw new ValueError("{$normalized} is not a valid value for " . self::class);
    }
}
