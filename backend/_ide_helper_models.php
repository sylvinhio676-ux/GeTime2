<?php

// @formatter:off
// phpcs:ignoreFile
/**
 * A helper file for your Eloquent Models
 * Copy the phpDocs from this file to the correct Model,
 * And remove them from this file, to prevent double declarations.
 *
 * @author Barry vd. Heuvel <barryvdh@gmail.com>
 */


namespace App\Models{
/**
 * @property int $id
 * @property string $campus_name
 * @property string $localisation
 * @property int $etablishment_id
 * @property \Illuminate\Support\Carbon|null $created_at
 * @property \Illuminate\Support\Carbon|null $updated_at
 * @property-read \App\Models\Etablishment $etablishment
 * @property-read \Illuminate\Notifications\DatabaseNotificationCollection<int, \Illuminate\Notifications\DatabaseNotification> $notifications
 * @property-read int|null $notifications_count
 * @property-read \Illuminate\Database\Eloquent\Collection<int, \App\Models\Room> $rooms
 * @property-read int|null $rooms_count
 * @method static \Database\Factories\CampusFactory factory($count = null, $state = [])
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Campus newModelQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Campus newQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Campus query()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Campus whereCampusName($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Campus whereCreatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Campus whereEtablishmentId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Campus whereId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Campus whereLocalisation($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Campus whereUpdatedAt($value)
 */
	class Campus extends \Eloquent {}
}

namespace App\Models{
/**
 * @property int $id
 * @property \App\Enum\JourEnum $day
 * @property string $hour_star
 * @property string $hour_end
 * @property int $subject_id
 * @property \Illuminate\Support\Carbon|null $created_at
 * @property \Illuminate\Support\Carbon|null $updated_at
 * @property-read \Illuminate\Notifications\DatabaseNotificationCollection<int, \Illuminate\Notifications\DatabaseNotification> $notifications
 * @property-read int|null $notifications_count
 * @property-read \App\Models\Subject $subject
 * @method static \Database\Factories\DisponibilityFactory factory($count = null, $state = [])
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Disponibility newModelQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Disponibility newQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Disponibility query()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Disponibility whereCreatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Disponibility whereDay($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Disponibility whereHourEnd($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Disponibility whereHourStar($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Disponibility whereId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Disponibility whereSubjectId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Disponibility whereUpdatedAt($value)
 */
	class Disponibility extends \Eloquent {}
}

namespace App\Models{
/**
 * @property int $id
 * @property string $etablishment_name
 * @property string $description
 * @property string $city
 * @property \Illuminate\Support\Carbon|null $created_at
 * @property \Illuminate\Support\Carbon|null $updated_at
 * @property-read \Illuminate\Database\Eloquent\Collection<int, \App\Models\Campus> $campus
 * @property-read int|null $campus_count
 * @property-read \Illuminate\Notifications\DatabaseNotificationCollection<int, \Illuminate\Notifications\DatabaseNotification> $notifications
 * @property-read int|null $notifications_count
 * @property-read \Illuminate\Database\Eloquent\Collection<int, \App\Models\Programmer> $programmers
 * @property-read int|null $programmers_count
 * @method static \Database\Factories\EtablishmentFactory factory($count = null, $state = [])
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Etablishment newModelQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Etablishment newQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Etablishment query()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Etablishment whereCity($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Etablishment whereCreatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Etablishment whereDescription($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Etablishment whereEtablishmentName($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Etablishment whereId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Etablishment whereUpdatedAt($value)
 */
	class Etablishment extends \Eloquent {}
}

namespace App\Models{
/**
 * @property int $id
 * @property string $name_level
 * @property int $specialty_id
 * @property \Illuminate\Support\Carbon|null $created_at
 * @property \Illuminate\Support\Carbon|null $updated_at
 * @property-read \Illuminate\Notifications\DatabaseNotificationCollection<int, \Illuminate\Notifications\DatabaseNotification> $notifications
 * @property-read int|null $notifications_count
 * @property-read \Illuminate\Database\Eloquent\Collection<int, \App\Models\Specialty> $specialty
 * @property-read int|null $specialty_count
 * @method static \Database\Factories\LevelFactory factory($count = null, $state = [])
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Level newModelQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Level newQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Level query()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Level whereCreatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Level whereId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Level whereNameLevel($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Level whereSpecialtyId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Level whereUpdatedAt($value)
 */
	class Level extends \Eloquent {}
}

namespace App\Models{
/**
 * @property int $id
 * @property \App\Enum\JourEnum $day
 * @property string $hour_star
 * @property string $hour_end
 * @property int $subject_id
 * @property int $programmer_id
 * @property int $year_id
 * @property \Illuminate\Support\Carbon|null $created_at
 * @property \Illuminate\Support\Carbon|null $updated_at
 * @property-read \Illuminate\Notifications\DatabaseNotificationCollection<int, \Illuminate\Notifications\DatabaseNotification> $notifications
 * @property-read int|null $notifications_count
 * @property-read \App\Models\Programmer|null $programer
 * @property-read \Illuminate\Database\Eloquent\Collection<int, \App\Models\Room> $rooms
 * @property-read int|null $rooms_count
 * @property-read \Illuminate\Database\Eloquent\Collection<int, \App\Models\Specialty> $specialities
 * @property-read int|null $specialities_count
 * @property-read \App\Models\Subject $subject
 * @property-read \App\Models\Year $year
 * @method static \Database\Factories\ProgrammationFactory factory($count = null, $state = [])
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Programmation newModelQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Programmation newQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Programmation query()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Programmation whereCreatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Programmation whereDay($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Programmation whereHourEnd($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Programmation whereHourStar($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Programmation whereId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Programmation whereProgrammerId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Programmation whereSubjectId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Programmation whereUpdatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Programmation whereYearId($value)
 */
	class Programmation extends \Eloquent {}
}

namespace App\Models{
/**
 * @property int $id
 * @property string $registration_number
 * @property int $user_id
 * @property int $etablishment_id
 * @property \Illuminate\Support\Carbon|null $created_at
 * @property \Illuminate\Support\Carbon|null $updated_at
 * @property-read \App\Models\Etablishment $etablishment
 * @property-read \Illuminate\Notifications\DatabaseNotificationCollection<int, \Illuminate\Notifications\DatabaseNotification> $notifications
 * @property-read int|null $notifications_count
 * @property-read \Illuminate\Database\Eloquent\Collection<int, \App\Models\Programmation> $programmations
 * @property-read int|null $programmations_count
 * @property-read \Illuminate\Database\Eloquent\Collection<int, \App\Models\Specialty> $specialities
 * @property-read int|null $specialities_count
 * @property-read \App\Models\User $user
 * @method static \Database\Factories\ProgrammerFactory factory($count = null, $state = [])
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Programmer newModelQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Programmer newQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Programmer query()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Programmer whereCreatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Programmer whereEtablishmentId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Programmer whereId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Programmer whereRegistrationNumber($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Programmer whereUpdatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Programmer whereUserId($value)
 */
	class Programmer extends \Eloquent {}
}

namespace App\Models{
/**
 * @property int $id
 * @property string $code
 * @property int $capacity
 * @property bool $is_available
 * @property int $campus_id
 * @property int $programmation_id
 * @property \Illuminate\Support\Carbon|null $created_at
 * @property \Illuminate\Support\Carbon|null $updated_at
 * @property-read \App\Models\Campus $campus
 * @property-read \Illuminate\Notifications\DatabaseNotificationCollection<int, \Illuminate\Notifications\DatabaseNotification> $notifications
 * @property-read int|null $notifications_count
 * @property-read \App\Models\Programmation $programmation
 * @method static \Database\Factories\RoomFactory factory($count = null, $state = [])
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Room newModelQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Room newQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Room query()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Room whereCampusId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Room whereCapacity($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Room whereCode($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Room whereCreatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Room whereId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Room whereIsAvailable($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Room whereProgrammationId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Room whereUpdatedAt($value)
 */
	class Room extends \Eloquent {}
}

namespace App\Models{
/**
 * @property int $id
 * @property string $school_name
 * @property string $description
 * @property \Illuminate\Support\Carbon|null $created_at
 * @property \Illuminate\Support\Carbon|null $updated_at
 * @property-read \Illuminate\Notifications\DatabaseNotificationCollection<int, \Illuminate\Notifications\DatabaseNotification> $notifications
 * @property-read int|null $notifications_count
 * @property-read \Illuminate\Database\Eloquent\Collection<int, \App\Models\Sector> $sectors
 * @property-read int|null $sectors_count
 * @method static \Database\Factories\SchoolFactory factory($count = null, $state = [])
 * @method static \Illuminate\Database\Eloquent\Builder<static>|School newModelQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|School newQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|School query()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|School whereCreatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|School whereDescription($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|School whereId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|School whereSchoolName($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|School whereUpdatedAt($value)
 */
	class School extends \Eloquent {}
}

namespace App\Models{
/**
 * @property int $id
 * @property string $sector_name
 * @property string $code
 * @property int $school_id
 * @property \Illuminate\Support\Carbon|null $created_at
 * @property \Illuminate\Support\Carbon|null $updated_at
 * @property-read \Illuminate\Notifications\DatabaseNotificationCollection<int, \Illuminate\Notifications\DatabaseNotification> $notifications
 * @property-read int|null $notifications_count
 * @property-read \App\Models\School $school
 * @property-read \Illuminate\Database\Eloquent\Collection<int, \App\Models\Specialty> $specialities
 * @property-read int|null $specialities_count
 * @method static \Database\Factories\SectorFactory factory($count = null, $state = [])
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Sector newModelQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Sector newQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Sector query()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Sector whereCode($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Sector whereCreatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Sector whereId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Sector whereSchoolId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Sector whereSectorName($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Sector whereUpdatedAt($value)
 */
	class Sector extends \Eloquent {}
}

namespace App\Models{
/**
 * @property int $id
 * @property string $specialty_name
 * @property string $description
 * @property int $number_student
 * @property int $sector_id
 * @property int $programmer_id
 * @property \Illuminate\Support\Carbon|null $created_at
 * @property \Illuminate\Support\Carbon|null $updated_at
 * @property-read \App\Models\Level|null $level
 * @property-read \Illuminate\Notifications\DatabaseNotificationCollection<int, \Illuminate\Notifications\DatabaseNotification> $notifications
 * @property-read int|null $notifications_count
 * @property-read \Illuminate\Database\Eloquent\Collection<int, \App\Models\Programmation> $programmations
 * @property-read int|null $programmations_count
 * @property-read \App\Models\Programmer $programmer
 * @property-read \App\Models\Sector $sector
 * @property-read \Illuminate\Database\Eloquent\Collection<int, \App\Models\Subject> $subjects
 * @property-read int|null $subjects_count
 * @method static \Database\Factories\SpecialtyFactory factory($count = null, $state = [])
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Specialty newModelQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Specialty newQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Specialty query()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Specialty whereCreatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Specialty whereDescription($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Specialty whereId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Specialty whereNumberStudent($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Specialty whereProgrammerId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Specialty whereSectorId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Specialty whereSpecialtyName($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Specialty whereUpdatedAt($value)
 */
	class Specialty extends \Eloquent {}
}

namespace App\Models{
/**
 * @property int $id
 * @property int $specialty_id
 * @property int $programmation_id
 * @property \Illuminate\Support\Carbon|null $created_at
 * @property \Illuminate\Support\Carbon|null $updated_at
 * @method static \Database\Factories\SpecialtyProgrammationFactory factory($count = null, $state = [])
 * @method static \Illuminate\Database\Eloquent\Builder<static>|SpecialtyProgrammation newModelQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|SpecialtyProgrammation newQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|SpecialtyProgrammation query()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|SpecialtyProgrammation whereCreatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|SpecialtyProgrammation whereId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|SpecialtyProgrammation whereProgrammationId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|SpecialtyProgrammation whereSpecialtyId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|SpecialtyProgrammation whereUpdatedAt($value)
 */
	class SpecialtyProgrammation extends \Eloquent {}
}

namespace App\Models{
/**
 * @property int $id
 * @property string $subject_name
 * @property string $hour_by_week
 * @property int $total_hour
 * @property \App\Enum\TypeSubject $type_subject
 * @property int $teacher_id
 * @property int $specialty_id
 * @property \Illuminate\Support\Carbon|null $created_at
 * @property \Illuminate\Support\Carbon|null $updated_at
 * @property-read \Illuminate\Database\Eloquent\Collection<int, \App\Models\Disponibility> $disponibilities
 * @property-read int|null $disponibilities_count
 * @property-read \Illuminate\Notifications\DatabaseNotificationCollection<int, \Illuminate\Notifications\DatabaseNotification> $notifications
 * @property-read int|null $notifications_count
 * @property-read \Illuminate\Database\Eloquent\Collection<int, \App\Models\Programmation> $programmations
 * @property-read int|null $programmations_count
 * @property-read \App\Models\Specialty $specialty
 * @property-read \App\Models\Teacher $teacher
 * @method static \Database\Factories\SubjectFactory factory($count = null, $state = [])
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Subject newModelQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Subject newQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Subject query()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Subject whereCreatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Subject whereHourByWeek($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Subject whereId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Subject whereSpecialtyId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Subject whereSubjectName($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Subject whereTeacherId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Subject whereTotalHour($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Subject whereTypeSubject($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Subject whereUpdatedAt($value)
 */
	class Subject extends \Eloquent {}
}

namespace App\Models{
/**
 * @property int $id
 * @property string $registration_number
 * @property int $user_id
 * @property \Illuminate\Support\Carbon|null $created_at
 * @property \Illuminate\Support\Carbon|null $updated_at
 * @property-read \Illuminate\Notifications\DatabaseNotificationCollection<int, \Illuminate\Notifications\DatabaseNotification> $notifications
 * @property-read int|null $notifications_count
 * @property-read \Illuminate\Database\Eloquent\Collection<int, \App\Models\Subject> $subjects
 * @property-read int|null $subjects_count
 * @property-read \App\Models\User $user
 * @method static \Database\Factories\TeacherFactory factory($count = null, $state = [])
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Teacher newModelQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Teacher newQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Teacher query()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Teacher whereCreatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Teacher whereId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Teacher whereRegistrationNumber($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Teacher whereUpdatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Teacher whereUserId($value)
 */
	class Teacher extends \Eloquent {}
}

namespace App\Models{
/**
 * App\Models\User
 *
 * @mixin \Eloquent
 * @method mixed getKey()
 * @property static \Illuminate\Database\Eloquent\Factories\Factory|null $factory
 * @property int $id
 * @property string $name
 * @property string $email
 * @property string $phone
 * @property string $role
 * @property \Illuminate\Support\Carbon|null $email_verified_at
 * @property string $password
 * @property string|null $remember_token
 * @property \Illuminate\Support\Carbon|null $created_at
 * @property \Illuminate\Support\Carbon|null $updated_at
 * @property-read \Illuminate\Notifications\DatabaseNotificationCollection<int, \Illuminate\Notifications\DatabaseNotification> $notifications
 * @property-read int|null $notifications_count
 * @property-read \Illuminate\Database\Eloquent\Collection<int, \Spatie\Permission\Models\Permission> $permissions
 * @property-read int|null $permissions_count
 * @property-read \App\Models\Programmer|null $programmer
 * @property-read \Illuminate\Database\Eloquent\Collection<int, \Spatie\Permission\Models\Role> $roles
 * @property-read int|null $roles_count
 * @property-read \App\Models\Teacher|null $teacher
 * @property-read \Illuminate\Database\Eloquent\Collection<int, \Laravel\Sanctum\PersonalAccessToken> $tokens
 * @property-read int|null $tokens_count
 * @method static \Database\Factories\UserFactory factory($count = null, $state = [])
 * @method static \Illuminate\Database\Eloquent\Builder<static>|User newModelQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|User newQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|User permission($permissions, $without = false)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|User query()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|User role($roles, $guard = null, $without = false)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|User whereCreatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|User whereEmail($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|User whereEmailVerifiedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|User whereId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|User whereName($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|User wherePassword($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|User wherePhone($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|User whereRememberToken($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|User whereRole($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|User whereUpdatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|User withoutPermission($permissions)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|User withoutRole($roles, $guard = null)
 */
	class User extends \Eloquent {}
}

namespace App\Models{
/**
 * @property int $id
 * @property string $date_star
 * @property string $date_end
 * @property \Illuminate\Support\Carbon|null $created_at
 * @property \Illuminate\Support\Carbon|null $updated_at
 * @property-read \Illuminate\Notifications\DatabaseNotificationCollection<int, \Illuminate\Notifications\DatabaseNotification> $notifications
 * @property-read int|null $notifications_count
 * @property-read \Illuminate\Database\Eloquent\Collection<int, \App\Models\Programmation> $programmations
 * @property-read int|null $programmations_count
 * @method static \Database\Factories\YearFactory factory($count = null, $state = [])
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Year newModelQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Year newQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Year query()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Year whereCreatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Year whereDateEnd($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Year whereDateStar($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Year whereId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Year whereUpdatedAt($value)
 */
	class Year extends \Eloquent {}
}

