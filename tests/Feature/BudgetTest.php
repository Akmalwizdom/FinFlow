<?php

namespace Tests\Feature;

use App\Models\Budget;
use App\Models\Category;
use App\Models\Transaction;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class BudgetTest extends TestCase
{
    use RefreshDatabase;

    protected User $user;
    protected Category $category;

    protected function setUp(): void
    {
        parent::setUp();
        $this->user = User::factory()->create();
        $this->category = Category::factory()->create([
            'user_id' => $this->user->id,
            'type' => 'expense',
            'name' => 'Food',
        ]);
    }

    public function test_user_can_list_their_budgets(): void
    {
        Budget::factory()->count(3)->create([
            'user_id' => $this->user->id,
            'category_id' => $this->category->id,
        ]);
        Budget::factory()->create(); // Another user's budget

        $response = $this->actingAs($this->user)
            ->getJson('/api/v1/budgets');

        $response->assertOk()
            ->assertJsonCount(3, 'data.items');
    }

    public function test_user_can_create_budget(): void
    {
        $response = $this->actingAs($this->user)
            ->postJson('/api/v1/budgets', [
                'name' => 'Monthly Food Budget',
                'amount' => 2000000,
                'category_id' => $this->category->id,
                'period' => 'monthly',
                'start_date' => now()->format('Y-m-d'),
                'alert_threshold' => 80,
            ]);

        $response->assertCreated()
            ->assertJsonPath('data.name', 'Monthly Food Budget')
            ->assertJsonPath('data.amount', 2000000);

        $this->assertDatabaseHas('budgets', [
            'user_id' => $this->user->id,
            'name' => 'Monthly Food Budget',
        ]);
    }

    public function test_user_can_create_budget_without_category(): void
    {
        $response = $this->actingAs($this->user)
            ->postJson('/api/v1/budgets', [
                'name' => 'Overall Monthly Budget',
                'amount' => 5000000,
                'period' => 'monthly',
                'start_date' => now()->format('Y-m-d'),
            ]);

        $response->assertCreated()
            ->assertJsonPath('data.name', 'Overall Monthly Budget');
    }

    public function test_user_can_view_their_budget(): void
    {
        $budget = Budget::factory()->create([
            'user_id' => $this->user->id,
            'category_id' => $this->category->id,
        ]);

        $response = $this->actingAs($this->user)
            ->getJson("/api/v1/budgets/{$budget->id}");

        $response->assertOk()
            ->assertJsonPath('data.id', $budget->id);
    }

    public function test_user_cannot_view_other_users_budget(): void
    {
        $otherBudget = Budget::factory()->create();

        $response = $this->actingAs($this->user)
            ->getJson("/api/v1/budgets/{$otherBudget->id}");

        $response->assertForbidden();
    }

    public function test_user_can_update_their_budget(): void
    {
        $budget = Budget::factory()->create([
            'user_id' => $this->user->id,
            'category_id' => $this->category->id,
            'name' => 'Old Budget',
            'amount' => 1000000,
        ]);

        $response = $this->actingAs($this->user)
            ->putJson("/api/v1/budgets/{$budget->id}", [
                'name' => 'Updated Budget',
                'amount' => 1500000,
                'period' => 'monthly',
                'start_date' => now()->format('Y-m-d'),
            ]);

        $response->assertOk()
            ->assertJsonPath('data.name', 'Updated Budget')
            ->assertJsonPath('data.amount', 1500000);
    }

    public function test_user_can_delete_their_budget(): void
    {
        $budget = Budget::factory()->create([
            'user_id' => $this->user->id,
            'category_id' => $this->category->id,
        ]);

        $response = $this->actingAs($this->user)
            ->deleteJson("/api/v1/budgets/{$budget->id}");

        $response->assertOk();
        $this->assertDatabaseMissing('budgets', ['id' => $budget->id]);
    }

    public function test_budget_period_validation(): void
    {
        $response = $this->actingAs($this->user)
            ->postJson('/api/v1/budgets', [
                'name' => 'Test Budget',
                'amount' => 1000000,
                'period' => 'invalid_period',
                'start_date' => now()->format('Y-m-d'),
            ]);

        $response->assertUnprocessable()
            ->assertJsonValidationErrors(['period']);
    }

    public function test_budget_summary_includes_overall_stats(): void
    {
        Budget::factory()->create([
            'user_id' => $this->user->id,
            'category_id' => $this->category->id,
            'amount' => 1000000,
        ]);

        $response = $this->actingAs($this->user)
            ->getJson('/api/v1/budgets');

        $response->assertOk()
            ->assertJsonStructure([
                'data' => [
                    'items',
                    'summary' => [
                        'budget_count',
                        'total_budget_amount',
                        'total_spent_amount',
                        'total_remaining',
                        'overall_progress',
                    ],
                ],
            ]);
    }

    public function test_budget_progress_calculation_with_transactions(): void
    {
        $budget = Budget::factory()->create([
            'user_id' => $this->user->id,
            'category_id' => $this->category->id,
            'amount' => 1000000,
            'period' => 'monthly',
            'start_date' => now()->startOfMonth()->format('Y-m-d'),
        ]);

        // Create expense transaction in this category
        Transaction::create([
            'user_id' => $this->user->id,
            'category_id' => $this->category->id,
            'type' => 'expense',
            'amount' => 250000,
            'transaction_date' => now()->format('Y-m-d'),
        ]);

        $response = $this->actingAs($this->user)
            ->getJson("/api/v1/budgets/{$budget->id}");

        $response->assertOk()
            ->assertJsonStructure([
                'data' => [
                    'spent_amount',
                    'remaining_amount', 
                    'progress_percentage',
                ],
            ]);

        // Check values with float tolerance
        $data = $response->json('data');
        $this->assertEquals(250000, (int) $data['spent_amount']);
        $this->assertEquals(750000, (int) $data['remaining_amount']);
        $this->assertEquals(25, $data['progress_percentage']);
    }
}
