<?php

namespace App\Http\Controllers;

use App\Models\Category;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Symfony\Component\HttpFoundation\StreamedResponse;

class ExportController extends Controller
{
    /**
     * Export all transactions as CSV.
     */
    public function all(Request $request): StreamedResponse
    {
        $transactions = $request->user()
            ->transactions()
            ->with('category')
            ->orderBy('transaction_date', 'desc')
            ->get();

        return $this->streamCsv($transactions, 'all_transactions.csv');
    }

    /**
     * Export transactions by month.
     */
    public function monthly(Request $request): StreamedResponse
    {
        $request->validate([
            'month' => 'required|date_format:Y-m',
        ]);

        $month = $request->month;

        $transactions = $request->user()
            ->transactions()
            ->with('category')
            ->whereRaw("DATE_FORMAT(transaction_date, '%Y-%m') = ?", [$month])
            ->orderBy('transaction_date', 'desc')
            ->get();

        return $this->streamCsv($transactions, "transactions_{$month}.csv");
    }

    /**
     * Export transactions by category.
     */
    public function category(Request $request, Category $category): StreamedResponse
    {
        // Ensure user owns the category
        if ($category->user_id !== $request->user()->id) {
            abort(403);
        }

        $transactions = $request->user()
            ->transactions()
            ->with('category')
            ->where('category_id', $category->id)
            ->orderBy('transaction_date', 'desc')
            ->get();

        $categoryName = strtolower(str_replace(' ', '_', $category->name));

        return $this->streamCsv($transactions, "transactions_{$categoryName}.csv");
    }

    /**
     * Stream CSV response.
     */
    private function streamCsv($transactions, string $filename): StreamedResponse
    {
        $headers = [
            'Content-Type' => 'text/csv',
            'Content-Disposition' => "attachment; filename=\"{$filename}\"",
        ];

        return response()->stream(function () use ($transactions) {
            $handle = fopen('php://output', 'w');

            // CSV header
            fputcsv($handle, [
                'ID',
                'Date',
                'Type',
                'Category',
                'Amount',
                'Note',
                'Spending Type',
            ]);

            // CSV rows
            foreach ($transactions as $transaction) {
                fputcsv($handle, [
                    $transaction->id,
                    $transaction->transaction_date->format('Y-m-d'),
                    $transaction->type,
                    $transaction->category->name ?? '',
                    $transaction->amount,
                    $transaction->note ?? '',
                    $transaction->spending_type ?? '',
                ]);
            }

            fclose($handle);
        }, 200, $headers);
    }
}
