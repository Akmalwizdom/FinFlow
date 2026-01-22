<?php

namespace Database\Seeders;

use App\Models\Account;
use App\Models\User;
use Illuminate\Database\Seeder;

class AccountSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $users = User::all();

        if ($users->isEmpty()) {
            $this->command->info('No users found. Please create a user first.');
            return;
        }

        foreach ($users as $user) {
            $this->seedAccountsForUser($user);
        }

        $this->command->info('Sample accounts seeded successfully!');
    }

    /**
     * Seed accounts for a specific user.
     */
    private function seedAccountsForUser(User $user): void
    {
        $accounts = [
            [
                'name' => 'BCA Checking',
                'type' => 'bank',
                'initial_balance' => 5000000,
                'currency' => 'IDR',
                'color' => '#0066AE',
                'is_active' => true,
            ],
            [
                'name' => 'Mandiri Savings',
                'type' => 'bank',
                'initial_balance' => 15000000,
                'currency' => 'IDR',
                'color' => '#003D79',
                'is_active' => true,
            ],
            [
                'name' => 'GoPay',
                'type' => 'ewallet',
                'initial_balance' => 500000,
                'currency' => 'IDR',
                'color' => '#00AA13',
                'is_active' => true,
            ],
            [
                'name' => 'OVO',
                'type' => 'ewallet',
                'initial_balance' => 300000,
                'currency' => 'IDR',
                'color' => '#4C3494',
                'is_active' => true,
            ],
            [
                'name' => 'Cash Wallet',
                'type' => 'cash',
                'initial_balance' => 1000000,
                'currency' => 'IDR',
                'color' => '#10B981',
                'is_active' => true,
            ],
            [
                'name' => 'Bibit Investment',
                'type' => 'investment',
                'initial_balance' => 10000000,
                'currency' => 'IDR',
                'color' => '#F59E0B',
                'is_active' => true,
            ],
        ];

        foreach ($accounts as $account) {
            $user->accounts()->create($account);
        }
    }
}
