<?php

namespace App\Providers;

use Illuminate\Support\ServiceProvider;
use Kreait\Firebase\Factory;
use Kreait\Firebase\Contract\Messaging;


class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        $credentials = env('FIREBASE_CREDENTIALS');
        if ($credentials && file_exists($credentials)) {
            $this->app->singleton(Messaging::class, function () use ($credentials) {
                return (new Factory)
                    ->withServiceAccount($credentials)
                    ->createMessaging();
            });
        }
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        //
    }
}
