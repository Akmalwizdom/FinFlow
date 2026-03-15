<?php

namespace App\Http\Controllers;

use App\Services\ReportService;
use Barryvdh\DomPDF\Facade\Pdf;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Response;

class ReportController extends Controller
{
    public function __construct(
        private ReportService $reportService
    ) {}

    /**
     * Get monthly report.
     */
    public function monthly(Request $request): JsonResponse
    {
        $request->validate([
            'month' => 'required|date_format:Y-m',
        ]);

        $report = $this->reportService->getMonthlyReport(
            $request->user()->id,
            $request->month
        );

        return response()->json([
            'success' => true,
            'data' => $report,
        ]);
    }

    /**
     * Get balance history for trend chart.
     */
    public function balanceHistory(Request $request): JsonResponse
    {
        $months = $request->get('months', 6);

        $history = $this->reportService->getBalanceHistory(
            $request->user()->id,
            (int) $months
        );

        return response()->json([
            'success' => true,
            'data' => $history,
        ]);
    }

    /**
     * Export report as PDF.
     */
    public function exportPdf(Request $request)
    {
        $user = $request->user();
        
        // Get report data
        $currentMonth = now()->format('Y-m');
        $report = $this->reportService->getMonthlyReport($user->id, $currentMonth);
        
        // Generate PDF using DomPDF
        $pdf = Pdf::loadView('reports.pdf', compact('report', 'user', 'currentMonth'));
        $pdf->setPaper('A4', 'portrait');
        
        return $pdf->download('financial_report_' . now()->format('Y-m-d') . '.pdf');
    }

    /**
     * Export report as Excel (CSV).
     */
    public function exportExcel(Request $request)
    {
        $user = $request->user();
        
        // Get report data
        $currentMonth = now()->format('Y-m');
        $report = $this->reportService->getMonthlyReport($user->id, $currentMonth);
        
        // Generate CSV content with professional formatting
        $csv = "FINFLOW - PERSONAL FINANCE MANAGEMENT SYSTEM\r\n";
        $csv .= "Financial Report - " . now()->parse($currentMonth)->format('F Y') . "\r\n";
        $csv .= "Generated: " . now()->format('d F Y, H:i') . " WIB\r\n";
        $csv .= "User: " . $user->name . " (" . $user->email . ")\r\n";
        $csv .= str_repeat('=', 80) . "\r\n\r\n";
        
        // Section 1: Financial Summary
        $csv .= "SECTION 1: FINANCIAL SUMMARY\r\n";
        $csv .= str_repeat('-', 50) . "\r\n";
        $csv .= "Description,Amount (IDR)\r\n";
        $csv .= sprintf("Total Income,\"Rp %s\"\r\n", number_format($report['total_income'], 0, ',', '.'));
        $csv .= sprintf("Total Expenses,\"Rp %s\"\r\n", number_format($report['total_expense'], 0, ',', '.'));
        $csv .= sprintf("Net Balance,\"Rp %s\"\r\n", number_format($report['remaining_balance'], 0, ',', '.'));
        $csv .= "\r\n";
        
        // Section 2: Expense Breakdown
        $csv .= "SECTION 2: EXPENSE BREAKDOWN BY CATEGORY\r\n";
        $csv .= str_repeat('-', 50) . "\r\n";
        $csv .= "No.,Category,Amount (IDR),Percentage\r\n";
        $totalExpenses = 0;
        foreach ($report['top_categories'] ?? [] as $index => $category) {
            $csv .= sprintf(
                "%d,%s,\"Rp %s\",%.1f%%\r\n",
                $index + 1,
                $category['category'],
                number_format($category['amount'], 0, ',', '.'),
                $category['percentage']
            );
            $totalExpenses += $category['amount'];
        }
        $csv .= str_repeat('-', 50) . "\r\n";
        $csv .= sprintf(
            "Total,\"Rp %s\",%.1f%%\r\n",
            number_format($totalExpenses, 0, ',', '.'),
            collect($report['top_categories'] ?? [])->sum('percentage')
        );
        $csv .= "\r\n";
        
        // Section 3: Monthly Performance Comparison
        $csv .= "SECTION 3: MONTHLY PERFORMANCE COMPARISON\r\n";
        $csv .= str_repeat('-', 50) . "\r\n";
        $csv .= "Metric,Change vs Previous Month,Trend\r\n";
        
        if ($report['comparison_with_previous']['income_change'] !== null) {
            $incomeChange = $report['comparison_with_previous']['income_change'];
            $incomeTrend = $incomeChange >= 0 ? 'UP ▲' : 'DOWN ▼';
            $csv .= sprintf(
                "Income Performance,%.1f%%,%s\r\n",
                abs($incomeChange),
                $incomeTrend
            );
        }
        
        if ($report['comparison_with_previous']['expense_change'] !== null) {
            $expenseChange = $report['comparison_with_previous']['expense_change'];
            $expenseTrend = $expenseChange >= 0 ? 'UP ▲' : 'DOWN ▼';
            $csv .= sprintf(
                "Expense Performance,%.1f%%,%s\r\n",
                abs($expenseChange),
                $expenseTrend
            );
        }
        $csv .= "\r\n";
        
        // Section 4: Daily Summary (First 10 days)
        if (count($report['daily_breakdown'] ?? []) > 0) {
            $csv .= "SECTION 4: DAILY TRANSACTION SUMMARY (First 10 Days)\r\n";
            $csv .= str_repeat('-', 50) . "\r\n";
            $csv .= "Date,Income (IDR),Expenses (IDR),Net (IDR)\r\n";
            
            foreach (array_slice($report['daily_breakdown'], 0, 10) as $day) {
                $net = $day['income'] - $day['expense'];
                $csv .= sprintf(
                    "%s,\"Rp %s\",\"Rp %s\",\"Rp %s\"\r\n",
                    \Carbon\Carbon::parse($day['date'])->format('d M Y'),
                    number_format($day['income'], 0, ',', '.'),
                    number_format($day['expense'], 0, ',', '.'),
                    number_format($net, 0, ',', '.')
                );
            }
            
            if (count($report['daily_breakdown']) > 10) {
                $csv .= "\r\n";
                $csv .= "* Note: Showing first 10 days out of " . count($report['daily_breakdown']) . " total transaction days\r\n";
            }
            $csv .= "\r\n";
        }
        
        // Footer
        $csv .= str_repeat('=', 80) . "\r\n";
        $csv .= "Report ID: " . strtoupper(uniqid('RPT-')) . "\r\n";
        $csv .= "FinFlow - Personal Finance Management System\r\n";
        $csv .= "This is a computer-generated report. No signature required.\r\n";
        
        return Response::make($csv, 200, [
            'Content-Type' => 'text/csv; charset=UTF-8',
            'Content-Disposition' => 'attachment; filename="financial_report_' . now()->format('Y-m-d') . '.csv"',
        ]);
    }
}

