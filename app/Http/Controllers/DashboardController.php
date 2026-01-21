<?php

namespace App\Http\Controllers;

use App\Services\ReportService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class DashboardController extends Controller
{
    public function __construct(
        private ReportService $reportService
    ) {}

    /**
     * Get dashboard summary.
     */
    public function index(Request $request): JsonResponse
    {
        $summary = $this->reportService->getDashboardSummary(
            $request->user()->id
        );

        return response()->json([
            'success' => true,
            'data' => $summary,
        ]);
    }
}
