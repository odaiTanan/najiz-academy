<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use Spatie\Permission\PermissionRegistrar;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;

class DatabaseSeeder extends Seeder
{
    use WithoutModelEvents;

    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        $permissions = [
            'view-dashboard',
            'manage-users',
            'settings.override',
            'system-audit-logs',
            'create-assessments',
            'add-candidates',
            'review-results',
            'assign-training',
            'track-employees',
            'manage-courses',
            'track-trainees',
            'evaluate-performance',
            'issue-recommendations',
            'take-assessment',
            'view-own-results',
            'attend-courses',
            'download-certificates',
            'retake-assessments',
            'track-own-training',
            'view-development-plan',
        ];

        foreach ($permissions as $permissionName) {
            Permission::query()->firstOrCreate([
                'name' => $permissionName,
                'guard_name' => 'web',
            ]);
        }

        app(PermissionRegistrar::class)->forgetCachedPermissions();

        $systemAdministratorRole = Role::query()->firstOrCreate([
            'name' => 'System Administrator',
            'guard_name' => 'web',
        ]);
        $systemAdministratorRole->syncPermissions($permissions);

        $admin = User::query()->updateOrCreate(
            ['email' => 'admin@example.com'],
            [
                'name' => 'مدير النظام',
                'password' => Hash::make('Admin12345!'),
            ],
        );

        $admin->syncRoles([$systemAdministratorRole]);

        $hrManagerRole = Role::query()->firstOrCreate([
            'name' => 'HR Manager',
            'guard_name' => 'web',
        ]);
        $hrManagerRole->syncPermissions([
            'view-dashboard',
            'create-assessments',
            'add-candidates',
            'review-results',
            'assign-training',
            'track-employees',
        ]);

        $trainerRole = Role::query()->firstOrCreate([
            'name' => 'Trainer',
            'guard_name' => 'web',
        ]);
        $trainerRole->syncPermissions([
            'view-dashboard',
            'manage-courses',
            'track-trainees',
            'evaluate-performance',
            'issue-recommendations',
        ]);

        $candidateRole = Role::query()->firstOrCreate([
            'name' => 'Candidate',
            'guard_name' => 'web',
        ]);
        $candidateRole->syncPermissions([
            'view-dashboard',
            'take-assessment',
            'view-own-results',
            'attend-courses',
            'download-certificates',
        ]);

        $employeeRole = Role::query()->firstOrCreate([
            'name' => 'Employee',
            'guard_name' => 'web',
        ]);
        $employeeRole->syncPermissions([
            'view-dashboard',
            'retake-assessments',
            'track-own-training',
            'view-development-plan',
            'take-assessment',
            'view-own-results',
        ]);

        User::query()->updateOrCreate(
            ['email' => 'hr@example.com'],
            [
                'name' => 'مدير الموارد البشرية',
                'password' => Hash::make('Hr12345!'),
            ],
        )->syncRoles([$hrManagerRole]);

        User::query()->updateOrCreate(
            ['email' => 'trainer@example.com'],
            [
                'name' => 'مدرب الأكاديمية',
                'password' => Hash::make('Trainer12345!'),
            ],
        )->syncRoles([$trainerRole]);

        User::query()->updateOrCreate(
            ['email' => 'candidate@example.com'],
            [
                'name' => 'مرشح للتوظيف',
                'password' => Hash::make('Candidate12345!'),
            ],
        )->syncRoles([$candidateRole]);

        User::query()->updateOrCreate(
            ['email' => 'employee@example.com'],
            [
                'name' => 'سائق موظف',
                'password' => Hash::make('Employee12345!'),
            ],
        )->syncRoles([$employeeRole]);

        $this->call(AcademySeeder::class);
    }
}
