<?php

namespace App\Http\Controllers;

use App\Services\ReportService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

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
}
