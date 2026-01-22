<?php

namespace Database\Seeders;

use App\Models\Budget;
use App\Models\Category;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Database\Seeder;

class BudgetSeeder extends Seeder
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
            $this->seedBudgetsForUser($user);
        }

        $this->command->info('Sample budgets seeded successfully!');
    }

    /**
     * Seed budgets for a specific user.
     */
    private function seedBudgetsForUser(User $user): void
    {
        $categories = $user->categories()
            ->where('type', 'expense')
            ->get()
            ->keyBy('name');

        $startOfMonth = Carbon::now()->startOfMonth();

        // Category-specific budgets
        $budgets = [
            [
                'name' => 'Budget Makanan',
                'category_name' => 'Makanan',
                'amount' => 2000000,
                'period' => 'monthly',
                'alert_threshold' => 80,
            ],
            [
                'name' => 'Budget Transportasi',
                'category_name' => 'Transportasi',
                'amount' => 1000000,
                'period' => 'monthly',
                'alert_threshold' => 80,
            ],
            [
                'name' => 'Budget Hiburan',
                'category_name' => 'Hiburan',
                'amount' => 500000,
                'period' => 'monthly',
                'alert_threshold' => 70,
            ],
            [
                'name' => 'Budget Belanja',
                'category_name' => 'Belanja',
                'amount' => 1500000,
                'period' => 'monthly',
                'alert_threshold' => 75,
            ],
            [
                'name' => 'Budget Tagihan',
                'category_name' => 'Tagihan',
                'amount' => 2000000,
                'period' => 'monthly',
                'alert_threshold' => 90,
            ],
        ];

        foreach ($budgets as $budget) {
            if (isset($categories[$budget['category_name']])) {
                $user->budgets()->create([
                    'name' => $budget['name'],
                    'category_id' => $categories[$budget['category_name']]->id,
                    'amount' => $budget['amount'],
                    'period' => $budget['period'],
                    'start_date' => $startOfMonth,
                    'alert_threshold' => $budget['alert_threshold'],
                    'is_active' => true,
                ]);
            }
        }

        // Create one overall monthly budget (without category)
        $user->budgets()->create([
            'name' => 'Total Budget Bulanan',
            'category_id' => null,
            'amount' => 8000000,
            'period' => 'monthly',
            'start_date' => $startOfMonth,
            'alert_threshold' => 85,
            'is_active' => true,
        ]);
    }
}
