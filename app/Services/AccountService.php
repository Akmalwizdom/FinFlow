<?php

namespace App\Services;

use App\Models\Account;
use App\Models\Transaction;
use Carbon\Carbon;

class AccountService
{
    /**
     * Get the current balance for an account.
     */
    public function getCurrentBalance(Account $account): float
    {
        return $account->current_balance;
    }

    /**
     * Get balance history for an account over a period.
     */
    public function getBalanceHistory(Account $account, int $days = 30): array
    {
        $endDate = Carbon::now();
        $startDate = $endDate->copy()->subDays($days);

        $history = [];
        $runningBalance = $account->initial_balance;

        // Get all transactions grouped by date
        $transactions = $account->transactions()
            ->where('transaction_date', '<=', $endDate)
            ->orderBy('transaction_date')
            ->get()
            ->groupBy(fn($t) => $t->transaction_date->format('Y-m-d'));

        // Calculate running balance up to start date
        foreach ($transactions as $date => $dayTransactions) {
            if (Carbon::parse($date)->lt($startDate)) {
                foreach ($dayTransactions as $transaction) {
                    if ($transaction->type === 'income') {
                        $runningBalance += $transaction->amount;
                    } else {
                        $runningBalance -= $transaction->amount;
                    }
                }
            }
        }

        // Build history for the requested period
        $currentDate = $startDate->copy();
        while ($currentDate->lte($endDate)) {
            $dateStr = $currentDate->format('Y-m-d');

            if (isset($transactions[$dateStr])) {
                foreach ($transactions[$dateStr] as $transaction) {
                    if ($transaction->type === 'income') {
                        $runningBalance += $transaction->amount;
                    } else {
                        $runningBalance -= $transaction->amount;
                    }
                }
            }

            $history[] = [
                'date' => $dateStr,
                'balance' => round($runningBalance, 2),
            ];

            $currentDate->addDay();
        }

        return $history;
    }

    /**
     * Transfer funds between two accounts.
     */
    public function transfer(
        Account $fromAccount,
        Account $toAccount,
        float $amount,
        string $note = 'Transfer',
        Carbon|string|null $transactionDate = null
    ): array {
        $transactionDate = $transactionDate instanceof Carbon
            ? $transactionDate
            : Carbon::parse($transactionDate ?? now());

        // Create expense transaction from source account
        $expenseTransaction = Transaction::create([
            'user_id' => $fromAccount->user_id,
            'category_id' => $this->getTransferCategoryId($fromAccount->user_id, 'expense'),
            'account_id' => $fromAccount->id,
            'type' => 'expense',
            'amount' => $amount,
            'note' => "Transfer to {$toAccount->name}: {$note}",
            'transaction_date' => $transactionDate,
        ]);

        // Create income transaction to destination account
        $incomeTransaction = Transaction::create([
            'user_id' => $toAccount->user_id,
            'category_id' => $this->getTransferCategoryId($toAccount->user_id, 'income'),
            'account_id' => $toAccount->id,
            'type' => 'income',
            'amount' => $amount,
            'note' => "Transfer from {$fromAccount->name}: {$note}",
            'transaction_date' => $transactionDate,
        ]);

        return [
            'expense_transaction' => $expenseTransaction,
            'income_transaction' => $incomeTransaction,
            'from_account_new_balance' => $fromAccount->fresh()->current_balance,
            'to_account_new_balance' => $toAccount->fresh()->current_balance,
        ];
    }

    /**
     * Get or create the transfer category ID.
     */
    protected function getTransferCategoryId(int $userId, string $type): int
    {
        $categoryName = $type === 'expense' ? 'Lainnya' : 'Lainnya';

        $category = \App\Models\Category::where('user_id', $userId)
            ->where('type', $type)
            ->where('name', $categoryName)
            ->first();

        return $category?->id ?? \App\Models\Category::where('user_id', $userId)
            ->where('type', $type)
            ->first()
            ->id;
    }
}
