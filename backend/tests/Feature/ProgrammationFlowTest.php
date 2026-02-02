<?php

namespace Tests\Feature;

use App\Enum\JourEnum;
use App\Enum\TypeSubject;
use App\Models\Campus;
use App\Models\Disponibility;
use App\Models\Etablishment;
use App\Models\Programmer;
use App\Models\Programmation;
use App\Models\Room;
use App\Models\School;
use App\Models\Sector;
use App\Models\Specialty;
use App\Models\Subject;
use App\Models\Teacher;
use App\Models\User;
use App\Models\Year;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Carbon;
use Tests\TestCase;
use Spatie\Permission\Models\Role;

class ProgrammationFlowTest extends TestCase
{
    use RefreshDatabase;

    private function seedRoles(array $names): void
    {
        foreach ($names as $name) {
            Role::firstOrCreate(['name' => $name, 'guard_name' => 'sanctum']);
        }
    }

    public function test_disponibility_convert_validate_publish_flow(): void
    {
        $this->seedRoles(['super_admin', 'admin', 'teacher', 'programmer']);

        $admin = User::create([
            'name' => 'Admin Tester',
            'email' => 'admin.test@example.com',
            'phone' => '690100001',
            'password' => bcrypt('password'),
        ]);
        $admin->syncRoles(['admin']);

        $teacherUser = User::create([
            'name' => 'Teacher One',
            'email' => 'teacher.one@example.com',
            'phone' => '690100002',
            'password' => bcrypt('password'),
        ]);
        $teacherUser->syncRoles(['teacher']);
        $teacher = Teacher::create([
            'registration_number' => 'T20260001',
            'user_id' => $teacherUser->id,
        ]);

        $programmerUser = User::create([
            'name' => 'Programmer One',
            'email' => 'programmer.one@example.com',
            'phone' => '690100003',
            'password' => bcrypt('password'),
        ]);
        $programmerUser->syncRoles(['programmer']);

        $etablishment = Etablishment::create([
            'etablishment_name' => 'Central Campus',
            'description' => 'Test etablissement',
            'city' => 'Lyon',
        ]);

        $programmer = Programmer::create([
            'registration_number' => 'P20260001',
            'user_id' => $programmerUser->id,
            'etablishment_id' => $etablishment->id,
        ]);

        $school = School::create([
            'school_name' => 'School of Sciences',
            'description' => 'Test school',
        ]);

        $sector = Sector::create([
            'sector_name' => 'Mathematics',
            'code' => 'MATH',
            'school_id' => $school->id,
        ]);

        $campus = Campus::create([
            'campus_name' => 'Main Campus',
            'city' => 'Lyon',
            'etablishment_id' => $etablishment->id,
        ]);

        $room = Room::create([
            'code' => 'A101',
            'capacity' => 60,
            'is_available' => true,
            'type_room' => 'cours',
            'campus_id' => $campus->id,
        ]);

        $year = Year::create([
            'date_star' => Carbon::now()->subMonth()->toDateString(),
            'date_end' => Carbon::now()->addMonths(3)->toDateString(),
            'status' => 'active',
        ]);

        $specialty = Specialty::create([
            'specialty_name' => 'Engineering',
            'code' => 'ENG01',
            'description' => 'An engineering specialty',
            'number_student' => 40,
            'sector_id' => $sector->id,
            'programmer_id' => $programmer->id,
        ]);

        $subject = Subject::create([
            'subject_name' => 'Algorithms',
            'hour_by_week' => '4h',
            'total_hour' => 40,
            'type_subject' => TypeSubject::COURS->value,
            'color' => '#123456',
            'status' => 'not_programmed',
            'quota_hours' => 40,
            'teacher_id' => $teacher->id,
            'specialty_id' => $specialty->id,
        ]);

        $disponibility = Disponibility::create([
            'day' => JourEnum::LUNDI->value,
            'hour_star' => '08:00',
            'hour_end' => '10:00',
            'subject_id' => $subject->id,
            'etablishment_id' => $etablishment->id,
        ]);

        $convertResponse = $this->actingAs($admin, 'sanctum')
            ->postJson("/api/disponibilities/{$disponibility->id}/convert");

        $convertResponse->assertStatus(200)
            ->assertJsonPath('status', 'success')
            ->assertJsonPath('data.status', 'draft');

        $programmationId = $convertResponse->json('data.id');

        $this->assertFalse(Room::find($room->id)->is_available);
        $this->assertTrue($disponibility->fresh()->used);

        $this->actingAs($admin, 'sanctum')
            ->postJson("/api/programmations/{$programmationId}/validate")
            ->assertStatus(200)
            ->assertJsonPath('data.status', 'validated');

        $this->actingAs($admin, 'sanctum')
            ->postJson('/api/programmations/publish')
            ->assertStatus(200)
            ->assertJsonPath('data.count', 1);

        $programmation = Programmation::findOrFail($programmationId);
        $this->assertEquals('published', $programmation->status);
        $this->assertEquals(1, Programmation::where('status', 'published')->count());

        $this->actingAs($admin, 'sanctum')
            ->getJson('/api/programmations?status=published')
            ->assertStatus(200)
            ->assertJsonFragment(['id' => $programmationId]);
    }
}
