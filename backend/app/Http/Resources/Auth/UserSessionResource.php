<?php

namespace App\Http\Resources\Auth;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class UserSessionResource extends JsonResource
{
    /**
     * Transform the user into the payload shape the SPA needs.
     */
    public function toArray(Request $request): array
    {
        $this->resource->loadMissing(['roles.permissions', 'permissions']);

        return [
            'id' => $this->id,
            'name' => $this->name,
            'email' => $this->email,
            'roles' => $this->roles->map(static function ($role): array {
                return [
                    'id' => $role->id,
                    'name' => $role->name,
                    'permissions' => $role->permissions->pluck('name')->values()->all(),
                ];
            })->values()->all(),
            'permissions' => $this->getAllPermissions()->pluck('name')->unique()->values()->all(),
        ];
    }
}