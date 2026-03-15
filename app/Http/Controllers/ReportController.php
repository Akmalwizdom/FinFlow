<?php

namespace App\Http\Controllers;

use App\Services\ReportService;
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
        
        // Generate simple PDF using HTML
        $html = view('reports.pdf', compact('report', 'user', 'currentMonth'))->render();
        
        return Response::make($html, 200, [
            'Content-Type' => 'application/pdf',
            'Content-Disposition' => 'attachment; filename="financial_report_' . now()->format('Y-m-d') . '.pdf"',
        ]);
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
        
        // Generate CSV content
        $csv = "Financial Report - " . now()->format('F Y') . "\n";
        $csv .= "Generated: " . now()->format('Y-m-d H:i:s') . "\n\n";
        
        $csv .= "Summary\n";
        $csv .= "Metric,Amount\n";
        $csv .= sprintf("Total Income,%.2f\n", $report['total_income']);
        $csv .= sprintf("Total Expense,%.2f\n", $report['total_expense']);
        $csv .= sprintf("Remaining Balance,%.2f\n\n", $report['remaining_balance']);
        
        $csv .= "Need vs Want Ratio\n";
        $csv .= "Type,Percentage\n";
        $csv .= sprintf("Need,%.1f%%\n", $report['need_want_ratio']['need_percentage']);
        $csv .= sprintf("Want,%.1f%%\n\n", $report['need_want_ratio']['want_percentage']);
        
        $csv .= "Top Expense Categories\n";
        $csv .= "Category,Amount,Percentage\n";
        foreach ($report['top_categories'] ?? [] as $category) {
            $csv .= sprintf(
                "%s,%.2f,%.1f%%\n",
                $category['category'],
                $category['amount'],
                $category['percentage']
            );
        }
        
        return Response::make($csv, 200, [
            'Content-Type' => 'text/csv; charset=UTF-8',
            'Content-Disposition' => 'attachment; filename="financial_report_' . now()->format('Y-m-d') . '.csv"',
        ]);
    }
}

