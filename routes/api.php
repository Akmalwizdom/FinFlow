<?php

use App\Http\Controllers\AccountController;
use App\Http\Controllers\BudgetController;
use App\Http\Controllers\CategoryController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\ExportController;
use App\Http\Controllers\ForecastController;
use App\Http\Controllers\InsightController;
use App\Http\Controllers\ReportController;
use App\Http\Controllers\SettingsController;
use App\Http\Controllers\TransactionController;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
*/

Route::middleware(['auth:web'])->prefix('v1')->group(function () {
    // Dashboard
    Route::get('dashboard', [DashboardController::class, 'index']);

    // Transactions
    Route::apiResource('transactions', TransactionController::class);

    // Categories
    Route::apiResource('categories', CategoryController::class);

    // Accounts
    Route::post('accounts/transfer', [AccountController::class, 'transfer']);
    Route::apiResource('accounts', AccountController::class);

    // Budgets
    Route::get('budgets/summary', [BudgetController::class, 'summary']);
    Route::apiResource('budgets', BudgetController::class);

    // Reports
    Route::get('reports/monthly', [ReportController::class, 'monthly']);
    Route::get('reports/balance-history', [ReportController::class, 'balanceHistory']);

    // Insights
    Route::get('insights', [InsightController::class, 'index']);

    // Forecast
    Route::get('forecast', [ForecastController::class, 'index']);

    // Export
    Route::get('export/all', [ExportController::class, 'all']);
    Route::get('export/monthly', [ExportController::class, 'monthly']);
    Route::get('export/category/{category}', [ExportController::class, 'category']);

    // Settings
    Route::get('settings', [SettingsController::class, 'show']);
    Route::put('settings', [SettingsController::class, 'update']);
    Route::put('settings/password', [SettingsController::class, 'changePassword']);
    Route::delete('settings/account', [SettingsController::class, 'destroy']);
});




