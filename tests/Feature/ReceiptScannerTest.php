<?php

namespace Tests\Feature;

use App\Models\Account;
use App\Models\Category;
use App\Models\Receipt;
use App\Models\Transaction;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Route;
use Tests\TestCase;

class ReceiptScannerTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        
        // Disable CSRF verification for API tests
        Route::middlewareGroup('api', []);
    }

    public function test_user_can_create_transaction_from_receipt()
    {
        $user = User::factory()->create();

        // Create a receipt with parsed data
        $receipt = Receipt::factory()->create([
            'user_id' => $user->id,
            'status' => 'completed',
            'parsed_data' => [
                'merchant' => 'ALFIM SWALAYAN',
                'total' => 201600,
                'date' => '2024-03-13',
                'items' => [],
                'confidence' => 0.95,
            ],
        ]);

        // Create category and account
        $category = Category::factory()->create([
            'user_id' => $user->id,
            'type' => 'expense',
            'name' => 'Groceries',
        ]);

        $account = Account::factory()->create([
            'user_id' => $user->id,
        ]);

        // Make request to create transaction
        $response = $this->actingAs($user)
            ->withoutMiddleware([\Illuminate\Foundation\Http\Middleware\ValidateCsrfToken::class])
            ->postJson("/api/v1/receipts/{$receipt->id}/transaction", [
                'category_id' => $category->id,
                'account_id' => $account->id,
                'type' => 'expense',
                'amount' => 201600,
                'note' => 'ALFIM SWALAYAN',
                'transaction_date' => '2024-03-13',
                'spending_type' => 'want',
            ]);

        $response->assertStatus(201)
            ->assertJson([
                'success' => true,
                'message' => 'Transaction created from receipt successfully',
            ]);

        // Assert transaction was created in database
        $this->assertDatabaseHas('transactions', [
            'user_id' => $user->id,
            'category_id' => $category->id,
            'account_id' => $account->id,
            'type' => 'expense',
            'amount' => 201600,
            'note' => 'ALFIM SWALAYAN',
        ]);

        // Assert receipt was updated with transaction_id
        $receipt->refresh();
        $this->assertNotNull($receipt->transaction_id);
    }

    public function test_user_cannot_create_transaction_without_category()
    {
        $user = User::factory()->create();
        $receipt = Receipt::factory()->create(['user_id' => $user->id]);

        $account = Account::factory()->create(['user_id' => $user->id]);

        $response = $this->actingAs($user)
            ->withoutMiddleware([\Illuminate\Foundation\Http\Middleware\ValidateCsrfToken::class])
            ->postJson("/api/v1/receipts/{$receipt->id}/transaction", [
                'account_id' => $account->id,
                'type' => 'expense',
                'amount' => 100000,
                'transaction_date' => '2024-03-13',
            ]);

        $response->assertStatus(422)
            ->assertJsonValidationErrors('category_id');
    }

    public function test_user_cannot_create_transaction_without_account()
    {
        $user = User::factory()->create();
        $receipt = Receipt::factory()->create(['user_id' => $user->id]);

        $category = Category::factory()->create(['user_id' => $user->id]);

        $response = $this->actingAs($user)
            ->withoutMiddleware([\Illuminate\Foundation\Http\Middleware\ValidateCsrfToken::class])
            ->postJson("/api/v1/receipts/{$receipt->id}/transaction", [
                'category_id' => $category->id,
                'type' => 'expense',
                'amount' => 100000,
                'transaction_date' => '2024-03-13',
            ]);

        $response->assertStatus(422)
            ->assertJsonValidationErrors('account_id');
    }

    public function test_user_cannot_create_transaction_with_invalid_amount()
    {
        $user = User::factory()->create();
        $receipt = Receipt::factory()->create(['user_id' => $user->id]);

        $category = Category::factory()->create(['user_id' => $user->id]);
        $account = Account::factory()->create(['user_id' => $user->id]);

        $response = $this->actingAs($user)
            ->withoutMiddleware([\Illuminate\Foundation\Http\Middleware\ValidateCsrfToken::class])
            ->postJson("/api/v1/receipts/{$receipt->id}/transaction", [
                'category_id' => $category->id,
                'account_id' => $account->id,
                'type' => 'expense',
                'amount' => 0, // Invalid amount
                'transaction_date' => '2024-03-13',
            ]);

        $response->assertStatus(422)
            ->assertJsonValidationErrors('amount');
    }

    public function test_user_cannot_create_transaction_without_date()
    {
        $user = User::factory()->create();
        $receipt = Receipt::factory()->create(['user_id' => $user->id]);

        $category = Category::factory()->create(['user_id' => $user->id]);
        $account = Account::factory()->create(['user_id' => $user->id]);

        $response = $this->actingAs($user)
            ->withoutMiddleware([\Illuminate\Foundation\Http\Middleware\ValidateCsrfToken::class])
            ->postJson("/api/v1/receipts/{$receipt->id}/transaction", [
                'category_id' => $category->id,
                'account_id' => $account->id,
                'type' => 'expense',
                'amount' => 100000,
            ]);

        $response->assertStatus(422)
            ->assertJsonValidationErrors('transaction_date');
    }

    public function test_user_can_create_transaction_with_valid_date_format()
    {
        $user = User::factory()->create();
        $receipt = Receipt::factory()->create(['user_id' => $user->id]);

        $category = Category::factory()->create(['user_id' => $user->id]);
        $account = Account::factory()->create(['user_id' => $user->id]);

        // Test with various date formats
        $response = $this->actingAs($user)
            ->withoutMiddleware([\Illuminate\Foundation\Http\Middleware\ValidateCsrfToken::class])
            ->postJson("/api/v1/receipts/{$receipt->id}/transaction", [
                'category_id' => $category->id,
                'account_id' => $account->id,
                'type' => 'expense',
                'amount' => 100000,
                'transaction_date' => '2024-03-13', // YYYY-MM-DD format
            ]);

        $response->assertStatus(201);

        $this->assertDatabaseHas('transactions', [
            'transaction_date' => '2024-03-13',
        ]);
    }

    public function test_unauthorized_user_cannot_create_transaction_from_receipt()
    {
        $user1 = User::factory()->create();
        $user2 = User::factory()->create();

        $receipt = Receipt::factory()->create(['user_id' => $user1->id]);

        $category = Category::factory()->create(['user_id' => $user2->id]);
        $account = Account::factory()->create(['user_id' => $user2->id]);

        $response = $this->actingAs($user2)
            ->withoutMiddleware([\Illuminate\Foundation\Http\Middleware\ValidateCsrfToken::class])
            ->postJson("/api/v1/receipts/{$receipt->id}/transaction", [
                'category_id' => $category->id,
                'account_id' => $account->id,
                'type' => 'expense',
                'amount' => 100000,
                'transaction_date' => '2024-03-13',
            ]);

        // Should fail because user2 doesn't own the receipt
        $response->assertStatus(403);
    }
}
