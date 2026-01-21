<?php

namespace Database\Seeders;

use App\Models\Category;
use App\Models\Transaction;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Database\Seeder;

class TransactionSeeder extends Seeder
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
            $this->seedTransactionsForUser($user);
        }

        $this->command->info('Sample transactions seeded successfully!');
    }

    /**
     * Seed transactions for a specific user.
     */
    private function seedTransactionsForUser(User $user): void
    {
        $categories = $user->categories()->get()->keyBy('name');

        // Current month transactions
        $currentMonth = Carbon::now();
        $this->createMonthlyTransactions($user, $categories, $currentMonth);

        // Previous month transactions
        $previousMonth = Carbon::now()->subMonth();
        $this->createMonthlyTransactions($user, $categories, $previousMonth);

        // Two months ago
        $twoMonthsAgo = Carbon::now()->subMonths(2);
        $this->createMonthlyTransactions($user, $categories, $twoMonthsAgo);
    }

    /**
     * Create transactions for a specific month.
     */
    private function createMonthlyTransactions(User $user, $categories, Carbon $month): void
    {
        $startOfMonth = $month->copy()->startOfMonth();
        $endOfMonth = $month->copy()->endOfMonth();
        $daysInMonth = $month->daysInMonth;

        // Income transactions (1-2 per month)
        $this->createIncomeTransactions($user, $categories, $startOfMonth);

        // Expense transactions (multiple per month)
        for ($day = 1; $day <= min($daysInMonth, Carbon::now()->day); $day++) {
            $date = $startOfMonth->copy()->addDays($day - 1);
            
            // Skip if date is in the future
            if ($date->isFuture()) {
                continue;
            }

            // Random chance to have transactions on this day (70%)
            if (rand(1, 100) <= 70) {
                $this->createDailyExpenses($user, $categories, $date);
            }
        }
    }

    /**
     * Create income transactions.
     */
    private function createIncomeTransactions(User $user, $categories, Carbon $startOfMonth): void
    {
        // Salary on day 25
        $salaryDate = $startOfMonth->copy()->addDays(24);
        if (!$salaryDate->isFuture() && isset($categories['Gaji'])) {
            Transaction::create([
                'user_id' => $user->id,
                'category_id' => $categories['Gaji']->id,
                'type' => 'income',
                'amount' => rand(5000000, 15000000),
                'note' => 'Gaji bulanan',
                'transaction_date' => $salaryDate->format('Y-m-d'),
                'spending_type' => null,
            ]);
        }

        // Random freelance income (50% chance)
        if (rand(1, 100) <= 50 && isset($categories['Freelance'])) {
            $freelanceDate = $startOfMonth->copy()->addDays(rand(5, 20));
            if (!$freelanceDate->isFuture()) {
                Transaction::create([
                    'user_id' => $user->id,
                    'category_id' => $categories['Freelance']->id,
                    'type' => 'income',
                    'amount' => rand(500000, 3000000),
                    'note' => 'Project freelance',
                    'transaction_date' => $freelanceDate->format('Y-m-d'),
                    'spending_type' => null,
                ]);
            }
        }
    }

    /**
     * Create daily expense transactions.
     */
    private function createDailyExpenses(User $user, $categories, Carbon $date): void
    {
        $expenses = [
            // Need expenses
            ['category' => 'Makanan', 'min' => 25000, 'max' => 100000, 'type' => 'need', 'notes' => ['Makan siang', 'Makan malam', 'Sarapan', 'Kopi pagi']],
            ['category' => 'Transportasi', 'min' => 10000, 'max' => 50000, 'type' => 'need', 'notes' => ['Grab', 'Gojek', 'Bensin', 'Parkir']],
            ['category' => 'Tagihan', 'min' => 100000, 'max' => 500000, 'type' => 'need', 'notes' => ['Listrik', 'Internet', 'Air', 'Pulsa'], 'chance' => 10],
            ['category' => 'Kesehatan', 'min' => 50000, 'max' => 300000, 'type' => 'need', 'notes' => ['Obat', 'Vitamin', 'Dokter'], 'chance' => 15],
            
            // Want expenses
            ['category' => 'Hiburan', 'min' => 50000, 'max' => 200000, 'type' => 'want', 'notes' => ['Nonton bioskop', 'Netflix', 'Spotify', 'Game'], 'chance' => 30],
            ['category' => 'Belanja', 'min' => 50000, 'max' => 500000, 'type' => 'want', 'notes' => ['Baju baru', 'Gadget', 'Aksesoris', 'Skincare'], 'chance' => 25],
        ];

        foreach ($expenses as $expense) {
            $chance = $expense['chance'] ?? 60;
            
            if (rand(1, 100) <= $chance && isset($categories[$expense['category']])) {
                Transaction::create([
                    'user_id' => $user->id,
                    'category_id' => $categories[$expense['category']]->id,
                    'type' => 'expense',
                    'amount' => rand($expense['min'], $expense['max']),
                    'note' => $expense['notes'][array_rand($expense['notes'])],
                    'transaction_date' => $date->format('Y-m-d'),
                    'spending_type' => $expense['type'],
                ]);
            }
        }
    }
}
