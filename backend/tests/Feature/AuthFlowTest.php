<?php

namespace Tests\Feature;

use App\Models\RefreshToken;
use App\Models\User;
use App\Services\Auth\SessionTokenService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Laravel\Sanctum\Sanctum;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;
use Tests\TestCase;

class AuthFlowTest extends TestCase
{
    use RefreshDatabase;

    public function test_login_returns_access_token_refresh_cookie_and_authorization_payload(): void
    {
        $this->seedAuthorizationData();

        $response = $this->postJson('/api/auth/login', [
            'email' => 'admin@example.com',
            'password' => 'Admin12345!',
        ]);

        $response->assertOk()
            ->assertJsonPath('message', 'Authenticated successfully.')
            ->assertJsonPath('token_type', 'Bearer')
            ->assertJsonPath('user.email', 'admin@example.com')
            ->assertJsonPath('user.roles.0.name', 'System Administrator')
            ->assertJsonPath('user.permissions.0', 'view-dashboard')
            ->assertJsonPath('user.permissions.1', 'manage-users')
            ->assertCookie(config('auth_tokens.refresh_cookie_name'));
    }

    public function test_refresh_rotates_tokens_and_reissues_refresh_cookie(): void
    {
        $user = $this->makeAdminUser();
        $request = Request::create('/', 'POST', [], [], [], [
            'REMOTE_ADDR' => '127.0.0.1',
            'HTTP_USER_AGENT' => 'PHPUnit',
        ]);

        $session = app(SessionTokenService::class)->issue($user, $request);

        $rotatedSession = app(SessionTokenService::class)->rotateFromPlainText($session['refresh_token_plain_text'], $request);

        $tokens = RefreshToken::query()
            ->where('session_id', $session['refresh_token_model']->session_id)
            ->orderBy('id')
            ->get();

        $this->assertCount(2, $tokens);
        $this->assertNotNull($tokens->firstWhere('id', $session['refresh_token_model']->id)?->revoked_at);
        $this->assertNotNull($tokens->last()?->expires_at);
        $this->assertNull($tokens->last()?->revoked_at);
        $this->assertSame('admin@example.com', $rotatedSession['user']->email);
    }

    public function test_logout_revokes_refresh_session_and_clears_refresh_cookie(): void
    {
        $user = $this->makeAdminUser();
        $request = Request::create('/', 'POST', [], [], [], [
            'REMOTE_ADDR' => '127.0.0.1',
            'HTTP_USER_AGENT' => 'PHPUnit',
        ]);

        $session = app(SessionTokenService::class)->issue($user, $request);

        app(SessionTokenService::class)->revokeByPlainText($session['refresh_token_plain_text']);

        $this->assertDatabaseMissing('refresh_tokens', [
            'session_id' => $session['refresh_token_model']->session_id,
        ]);
    }

    public function test_dashboard_route_requires_a_role_or_permission(): void
    {
        $user = User::query()->create([
            'name' => 'Regular User',
            'email' => 'regular@example.com',
            'password' => Hash::make('Password123!'),
        ]);

        Sanctum::actingAs($user, ['*']);

        $this->getJson('/api/dashboard')->assertForbidden();

        $adminRole = Role::query()->firstOrCreate([
            'name' => 'System Administrator',
            'guard_name' => 'web',
        ]);

        Permission::query()->firstOrCreate([
            'name' => 'view-dashboard',
            'guard_name' => 'web',
        ]);

        $adminRole->syncPermissions(['view-dashboard']);
        $user->assignRole($adminRole);

        $this->getJson('/api/dashboard')
            ->assertOk()
            ->assertJsonPath('message', 'Dashboard data loaded successfully.');
    }

    private function seedAuthorizationData(): void
    {
        Permission::query()->firstOrCreate([
            'name' => 'view-dashboard',
            'guard_name' => 'web',
        ]);

        Permission::query()->firstOrCreate([
            'name' => 'manage-users',
            'guard_name' => 'web',
        ]);

        $adminRole = Role::query()->firstOrCreate([
            'name' => 'System Administrator',
            'guard_name' => 'web',
        ]);

        $adminRole->syncPermissions(['view-dashboard', 'manage-users']);

        $user = User::query()->create([
            'name' => 'Admin User',
            'email' => 'admin@example.com',
            'password' => Hash::make('Admin12345!'),
        ]);

        $user->assignRole($adminRole);
    }

    private function makeAdminUser(): User
    {
        $this->seedAuthorizationData();

        return User::query()->where('email', 'admin@example.com')->firstOrFail();
    }
}