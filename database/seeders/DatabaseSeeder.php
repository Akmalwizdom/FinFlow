<?php

namespace Database\Seeders;

use App\Models\User;
// use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // Create default user with known password for testing
        User::firstOrCreate(
            ['email' => 'faiqihya@gmail.com'],
            [
                'name' => 'Faiq',
                'password' => Hash::make('password'),
                'email_verified_at' => now(),
            ]
        );

        // Create additional test user
        User::firstOrCreate(
            ['email' => 'admin@example.com'],
            [
                'name' => 'Admin User',
                'password' => Hash::make('admin123'),
                'email_verified_at' => now(),
            ]
        );

        $this->call([
            CategorySeeder::class,
            AccountSeeder::class,
            TransactionSeeder::class,
            BudgetSeeder::class,
        ]);

        $this->command->info('Database seeded successfully!');
        $this->command->info('Login credentials:');
        $this->command->info('  Email: faiqihya@gmail.com | Password: password');
        $this->command->info('  Email: admin@example.com | Password: admin123');
    }
}

