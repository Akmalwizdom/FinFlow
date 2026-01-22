<?php

namespace App\Http\Controllers;

use App\Http\Requests\AccountRequest;
use App\Http\Resources\AccountResource;
use App\Models\Account;
use App\Services\AccountService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Inertia\Response;

class AccountController extends Controller
{
    public function __construct(
        protected AccountService $accountService
    ) {}

    /**
     * Display a listing of accounts (Inertia page).
     */
    public function index(Request $request): Response|JsonResponse
    {
        $user = Auth::user();

        $accounts = $user->accounts()
            ->withCount('transactions')
            ->orderBy('name')
            ->get();

        // Calculate totals
        $totalBalance = $accounts->sum(fn($account) => $account->current_balance);

        // If API request, return JSON
        if ($request->wantsJson() || $request->is('api/*')) {
            return response()->json([
                'success' => true,
                'data' => [
                    'items' => AccountResource::collection($accounts),
                    'total_balance' => $totalBalance,
                ],
            ]);
        }

        return Inertia::render('Accounts/Index', [
            'accounts' => AccountResource::collection($accounts),
            'totalBalance' => $totalBalance,
            'accountTypes' => Account::TYPES,
        ]);
    }

    /**
     * Store a newly created account.
     */
    public function store(AccountRequest $request): JsonResponse
    {
        $user = Auth::user();
        $validated = $request->validated();

        $account = $user->accounts()->create($validated);

        return response()->json([
            'success' => true,
            'data' => new AccountResource($account),
            'message' => 'Account created successfully.',
        ], 201);
    }

    /**
     * Display the specified account.
     */
    public function show(Account $account): JsonResponse
    {
        $this->authorize('view', $account);

        $account->loadCount('transactions');

        return response()->json([
            'success' => true,
            'data' => new AccountResource($account),
        ]);
    }

    /**
     * Update the specified account.
     */
    public function update(AccountRequest $request, Account $account): JsonResponse
    {
        $this->authorize('update', $account);

        $account->update($request->validated());

        return response()->json([
            'success' => true,
            'data' => new AccountResource($account),
            'message' => 'Account updated successfully.',
        ]);
    }

    /**
     * Remove the specified account.
     */
    public function destroy(Account $account): JsonResponse
    {
        $this->authorize('delete', $account);

        // Check if account has transactions
        if ($account->transactions()->exists()) {
            return response()->json([
                'success' => false,
                'error' => [
                    'code' => 'HAS_TRANSACTIONS',
                    'message' => 'Cannot delete account with existing transactions. Please reassign or delete transactions first.',
                ],
            ], 422);
        }

        $account->delete();

        return response()->json([
            'success' => true,
            'message' => 'Account deleted successfully.',
        ]);
    }

    /**
     * Transfer funds between accounts.
     */
    public function transfer(Request $request): JsonResponse
    {
        $request->validate([
            'from_account_id' => ['required', 'exists:accounts,id'],
            'to_account_id' => ['required', 'exists:accounts,id', 'different:from_account_id'],
            'amount' => ['required', 'numeric', 'min:0.01'],
            'note' => ['nullable', 'string', 'max:255'],
            'transaction_date' => ['nullable', 'date'],
        ]);

        $user = Auth::user();

        $fromAccount = Account::findOrFail($request->from_account_id);
        $toAccount = Account::findOrFail($request->to_account_id);

        // Authorize both accounts
        $this->authorize('update', $fromAccount);
        $this->authorize('update', $toAccount);

        $result = $this->accountService->transfer(
            $fromAccount,
            $toAccount,
            $request->amount,
            $request->note ?? 'Transfer',
            $request->transaction_date ?? now()
        );

        return response()->json([
            'success' => true,
            'data' => $result,
            'message' => 'Transfer completed successfully.',
        ]);
    }
}
