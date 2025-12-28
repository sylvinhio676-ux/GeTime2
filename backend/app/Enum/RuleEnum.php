<?php

namespace App\Enum;

enum RuleEnum : string
{
    case ADMIN = 'admin';
    case TEACHER = 'teacher';
    case PROGRAMMER = 'programmer';
    case SUPER_ADMIN = 'super_admin';
}
