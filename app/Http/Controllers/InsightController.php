<?php

namespace App\Http\Controllers;

use App\Services\InsightService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class InsightController extends Controller
{
    public function __construct(
        private InsightService $insightService
    ) {}

    /**
     * Get spending insights.
     */
    public function index(Request $request): JsonResponse
    {
        $month = $request->get('month');

        $insights = $this->insightService->getInsights(
            $request->user()->id,
            $month
        );

        return response()->json([
            'success' => true,
            'data' => $insights,
        ]);
    }
}
