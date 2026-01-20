<?php

use App\Models\User;
use App\Notifications\TimetablePublishedNotification;
use App\Services\FcmService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Notification;
use Laravel\Sanctum\Sanctum;

uses(RefreshDatabase::class);

beforeEach(fn () => config(['services.fcm.enabled' => true]));

test('le point d\'entrée device-token stocke un token pour l\'utilisateur authentifié', function () {
    $user = User::factory()->create();
    Sanctum::actingAs($user);

    $response = $this->postJson('/api/device-token', [
        'token' => 'abc123',
        'platform' => 'android',
    ]);

    $response->assertStatus(201)
        ->assertJsonPath('data.token', 'abc123')
        ->assertJsonPath('data.platform', 'android');

    $this->assertDatabaseHas('device_tokens', [
        'user_id' => $user->id,
        'token' => 'abc123',
        'platform' => 'android',
    ]);
});

test('la notification de publication enregistre une entrée en base', function () {
    $user = User::factory()->create();

    Notification::sendNow($user, new TimetablePublishedNotification(
        '2026-01-01',
        '2026-01-07',
        1
    ), ['database']);

    $this->assertDatabaseHas('notifications', [
        'notifiable_type' => User::class,
        'notifiable_id' => $user->id,
        'type' => TimetablePublishedNotification::class,
    ]);
});

test('le canal Fcm invoque FcmService avec les tokens de l utilisateur', function () {
    $user = User::factory()->create();
    $user->deviceTokens()->create([
        'token' => 'fake-token',
        'platform' => 'android',
    ]);

    $mock = \Mockery::mock(FcmService::class);
    $mock->shouldReceive('sendToTokens')->once()
        ->withArgs(function ($tokens, $title, $body, $data) {
            expect($tokens)->toEqual(['fake-token']);
            expect($title)->toBe('Emploi du temps publié');
            expect($body)->toContain('2026-01-01');
            expect($data['type'])->toBe('timetable_published');
            expect((int) $data['year_id'])->toBe(1);
            return true;
        });

    app()->instance(FcmService::class, $mock);

    app(\App\Notifications\Channels\FcmChannel::class)->send($user, new TimetablePublishedNotification(
        '2026-01-01',
        '2026-01-07',
        1
    ));
});
