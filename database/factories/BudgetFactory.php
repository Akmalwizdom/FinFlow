<?php

namespace Database\Factories;

use App\Models\Budget;
use App\Models\Category;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Budget>
 */
class BudgetFactory extends Factory
{
    protected $model = Budget::class;

    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'user_id' => User::factory(),
            'category_id' => Category::factory()->state(['type' => 'expense']),
            'name' => fake()->randomElement(['Food', 'Entertainment', 'Transport', 'Shopping', 'Bills']) . ' Budget',
            'amount' => fake()->randomElement([500000, 1000000, 2000000, 3000000, 5000000]),
            'period' => fake()->randomElement(array_keys(Budget::PERIODS)),
            'start_date' => now()->startOfMonth(),
            'end_date' => null,
            'alert_threshold' => fake()->randomElement([70, 80, 90]),
            'is_active' => true,
        ];
    }

    /**
     * Indicate that the budget is inactive.
     */
    public function inactive(): static
    {
        return $this->state(fn (array $attributes) => [
            'is_active' => false,
        ]);
    }

    /**
     * Indicate the budget period.
     */
    public function period(string $period): static
    {
        return $this->state(fn (array $attributes) => [
            'period' => $period,
        ]);
    }

    /**
     * Set a specific category.
     */
    public function forCategory(Category $category): static
    {
        return $this->state(fn (array $attributes) => [
            'category_id' => $category->id,
        ]);
    }
}
