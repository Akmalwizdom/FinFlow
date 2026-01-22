<?php

namespace Tests\Feature;

use App\Models\Account;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class AccountTest extends TestCase
{
    use RefreshDatabase;

    protected User $user;

    protected function setUp(): void
    {
        parent::setUp();
        $this->user = User::factory()->create();
    }

    public function test_user_can_list_their_accounts(): void
    {
        Account::factory()->count(3)->create(['user_id' => $this->user->id]);
        Account::factory()->create(); // Another user's account

        $response = $this->actingAs($this->user)
            ->getJson('/api/v1/accounts');

        $response->assertOk()
            ->assertJsonCount(3, 'data.items');
    }

    public function test_user_can_create_account(): void
    {
        $response = $this->actingAs($this->user)
            ->postJson('/api/v1/accounts', [
                'name' => 'BCA Checking',
                'type' => 'bank',
                'initial_balance' => 1000000,
                'currency' => 'IDR',
            ]);

        $response->assertCreated()
            ->assertJsonPath('data.name', 'BCA Checking')
            ->assertJsonPath('data.type', 'bank');

        $this->assertDatabaseHas('accounts', [
            'user_id' => $this->user->id,
            'name' => 'BCA Checking',
        ]);
    }

    public function test_user_can_view_their_account(): void
    {
        $account = Account::factory()->create(['user_id' => $this->user->id]);

        $response = $this->actingAs($this->user)
            ->getJson("/api/v1/accounts/{$account->id}");

        $response->assertOk()
            ->assertJsonPath('data.id', $account->id);
    }

    public function test_user_cannot_view_other_users_account(): void
    {
        $otherAccount = Account::factory()->create();

        $response = $this->actingAs($this->user)
            ->getJson("/api/v1/accounts/{$otherAccount->id}");

        $response->assertForbidden();
    }

    public function test_user_can_update_their_account(): void
    {
        $account = Account::factory()->create([
            'user_id' => $this->user->id,
            'name' => 'Old Name',
        ]);

        $response = $this->actingAs($this->user)
            ->putJson("/api/v1/accounts/{$account->id}", [
                'name' => 'New Name',
                'type' => 'ewallet',
                'initial_balance' => 500000,
            ]);

        $response->assertOk()
            ->assertJsonPath('data.name', 'New Name');
    }

    public function test_user_can_delete_account_without_transactions(): void
    {
        $account = Account::factory()->create(['user_id' => $this->user->id]);

        $response = $this->actingAs($this->user)
            ->deleteJson("/api/v1/accounts/{$account->id}");

        $response->assertOk();
        $this->assertDatabaseMissing('accounts', ['id' => $account->id]);
    }

    public function test_account_type_validation(): void
    {
        $response = $this->actingAs($this->user)
            ->postJson('/api/v1/accounts', [
                'name' => 'Test Account',
                'type' => 'invalid_type',
                'initial_balance' => 0,
            ]);

        $response->assertUnprocessable()
            ->assertJsonValidationErrors(['type']);
    }

    public function test_user_can_transfer_between_accounts(): void
    {
        $sourceAccount = Account::factory()->create([
            'user_id' => $this->user->id,
            'initial_balance' => 1000000,
        ]);

        $destAccount = Account::factory()->create([
            'user_id' => $this->user->id,
            'initial_balance' => 500000,
        ]);

        $response = $this->actingAs($this->user)
            ->postJson('/api/v1/accounts/transfer', [
                'from_account_id' => $sourceAccount->id,
                'to_account_id' => $destAccount->id,
                'amount' => 200000,
                'note' => 'Transfer test',
            ]);

        $response->assertOk();

        // Verify transactions were created
        $this->assertDatabaseHas('transactions', [
            'account_id' => $sourceAccount->id,
            'type' => 'expense',
            'amount' => 200000,
        ]);

        $this->assertDatabaseHas('transactions', [
            'account_id' => $destAccount->id,
            'type' => 'income',
            'amount' => 200000,
        ]);
    }
}
