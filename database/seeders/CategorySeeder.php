<?php

namespace Database\Seeders;

use App\Models\Category;
use App\Models\User;
use Illuminate\Database\Seeder;

class CategorySeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Get all users or create a default one if none exist
        $users = User::all();

        if ($users->isEmpty()) {
            $this->command->info('No users found. Please create a user first.');
            return;
        }

        $defaultCategories = [
            // Income categories
            ['name' => 'Gaji', 'type' => 'income', 'color' => '#078834', 'is_default' => true],
            ['name' => 'Freelance', 'type' => 'income', 'color' => '#10b981', 'is_default' => true],
            ['name' => 'Bonus', 'type' => 'income', 'color' => '#059669', 'is_default' => true],
            ['name' => 'Investasi', 'type' => 'income', 'color' => '#34d399', 'is_default' => true],
            ['name' => 'Lainnya', 'type' => 'income', 'color' => '#6ee7b7', 'is_default' => true],

            // Expense categories - Using FinFlow teal color palette
            ['name' => 'Makanan', 'type' => 'expense', 'color' => '#007180', 'is_default' => true],
            ['name' => 'Transportasi', 'type' => 'expense', 'color' => '#4db6ac', 'is_default' => true],
            ['name' => 'Belanja', 'type' => 'expense', 'color' => '#80cbc4', 'is_default' => true],
            ['name' => 'Hiburan', 'type' => 'expense', 'color' => '#009688', 'is_default' => true],
            ['name' => 'Tagihan', 'type' => 'expense', 'color' => '#26a69a', 'is_default' => true],
            ['name' => 'Kesehatan', 'type' => 'expense', 'color' => '#00897b', 'is_default' => true],
            ['name' => 'Pendidikan', 'type' => 'expense', 'color' => '#b2dfdb', 'is_default' => true],
            ['name' => 'Lainnya', 'type' => 'expense', 'color' => '#e0f2f1', 'is_default' => true],
        ];

        foreach ($users as $user) {
            foreach ($defaultCategories as $category) {
                Category::firstOrCreate(
                    [
                        'user_id' => $user->id,
                        'name' => $category['name'],
                        'type' => $category['type'],
                    ],
                    [
                        'color' => $category['color'],
                        'is_default' => $category['is_default'],
                    ]
                );
            }
        }

        $this->command->info('Default categories seeded successfully!');
    }
}
