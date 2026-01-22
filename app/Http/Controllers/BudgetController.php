<?php

namespace App\Http\Controllers;

use App\Http\Requests\BudgetRequest;
use App\Http\Resources\BudgetResource;
use App\Models\Budget;
use App\Services\BudgetService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Inertia\Response;

class BudgetController extends Controller
{
    public function __construct(
        protected BudgetService $budgetService
    ) {}

    /**
     * Display a listing of budgets (Inertia page).
     */
    public function index(Request $request): Response|JsonResponse
    {
        $user = Auth::user();

        $budgets = $user->budgets()
            ->with('category')
            ->active()
            ->orderBy('name')
            ->get();

        // Calculate summary
        $summary = $this->budgetService->getSummary($user);

        // If API request, return JSON
        if ($request->wantsJson() || $request->is('api/*')) {
            return response()->json([
                'success' => true,
                'data' => [
                    'items' => BudgetResource::collection($budgets),
                    'summary' => $summary,
                ],
            ]);
        }

        $categories = $user->categories()->where('type', 'expense')->get();

        return Inertia::render('Budgets/Index', [
            'budgets' => BudgetResource::collection($budgets),
            'summary' => $summary,
            'categories' => $categories,
            'periods' => Budget::PERIODS,
        ]);
    }

    /**
     * Store a newly created budget.
     */
    public function store(BudgetRequest $request): JsonResponse
    {
        $user = Auth::user();
        $validated = $request->validated();

        // Validate that category belongs to user if provided
        if (isset($validated['category_id'])) {
            $category = $user->categories()->find($validated['category_id']);
            if (!$category) {
                return response()->json([
                    'success' => false,
                    'error' => [
                        'code' => 'INVALID_CATEGORY',
                        'message' => 'Selected category does not belong to you.',
                    ],
                ], 422);
            }
        }

        $budget = $user->budgets()->create($validated);
        $budget->load('category');

        return response()->json([
            'success' => true,
            'data' => new BudgetResource($budget),
            'message' => 'Budget created successfully.',
        ], 201);
    }

    /**
     * Display the specified budget.
     */
    public function show(Budget $budget): JsonResponse
    {
        $this->authorize('view', $budget);

        $budget->load('category');

        return response()->json([
            'success' => true,
            'data' => new BudgetResource($budget),
        ]);
    }

    /**
     * Update the specified budget.
     */
    public function update(BudgetRequest $request, Budget $budget): JsonResponse
    {
        $this->authorize('update', $budget);

        $validated = $request->validated();

        // Validate that category belongs to user if provided
        if (isset($validated['category_id'])) {
            $user = Auth::user();
            $category = $user->categories()->find($validated['category_id']);
            if (!$category) {
                return response()->json([
                    'success' => false,
                    'error' => [
                        'code' => 'INVALID_CATEGORY',
                        'message' => 'Selected category does not belong to you.',
                    ],
                ], 422);
            }
        }

        $budget->update($validated);
        $budget->load('category');

        return response()->json([
            'success' => true,
            'data' => new BudgetResource($budget),
            'message' => 'Budget updated successfully.',
        ]);
    }

    /**
     * Remove the specified budget.
     */
    public function destroy(Budget $budget): JsonResponse
    {
        $this->authorize('delete', $budget);

        $budget->delete();

        return response()->json([
            'success' => true,
            'message' => 'Budget deleted successfully.',
        ]);
    }

    /**
     * Get budget summary for current period.
     */
    public function summary(Request $request): JsonResponse
    {
        $user = Auth::user();
        $summary = $this->budgetService->getSummary($user);

        return response()->json([
            'success' => true,
            'data' => $summary,
        ]);
    }
}
