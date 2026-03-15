<?php

namespace Database\Factories;

use App\Models\Receipt;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Receipt>
 */
class ReceiptFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'user_id' => User::factory(),
            'image_path' => 'receipts/test.jpg',
            'raw_text' => null,
            'parsed_data' => null,
            'status' => 'pending',
            'error_message' => null,
            'transaction_id' => null,
        ];
    }

    /**
     * Indicate that the receipt is completed.
     */
    public function completed(): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => 'completed',
            'parsed_data' => [
                'merchant' => 'Test Store',
                'total' => 100000,
                'date' => now()->format('Y-m-d'),
                'items' => [],
                'confidence' => 0.95,
            ],
        ]);
    }
}
