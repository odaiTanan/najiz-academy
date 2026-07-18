<?php

return [
    'access_token_name' => env('AUTH_ACCESS_TOKEN_NAME', 'spa-access-token'),
    'access_token_ttl_minutes' => (int) env('AUTH_ACCESS_TOKEN_TTL_MINUTES', 15),
    'refresh_token_ttl_days' => (int) env('AUTH_REFRESH_TOKEN_TTL_DAYS', 7),
    'refresh_cookie_name' => env('AUTH_REFRESH_COOKIE_NAME', 'refresh_token'),
    'refresh_cookie_path' => env('AUTH_REFRESH_COOKIE_PATH', '/api/auth'),
];