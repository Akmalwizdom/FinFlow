<?php

namespace App\Http\Controllers;

use App\Services\ForecastService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ForecastController extends Controller
{
    public function __construct(
        private ForecastService $forecastService
    ) {}

    /**
     * Get cashflow forecast.
     */
    public function index(Request $request): JsonResponse
    {
        $forecast = $this->forecastService->getForecast(
            $request->user()->id
        );

        return response()->json([
            'success' => true,
            'data' => $forecast,
        ]);
    }
}
