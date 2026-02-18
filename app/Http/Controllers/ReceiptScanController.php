<?php

namespace App\Http\Controllers;

use App\Http\Requests\ReceiptScanRequest;
use App\Http\Resources\ReceiptResource;
use App\Http\Resources\TransactionResource;
use App\Models\Receipt;
use App\Models\Transaction;
use App\Services\ReceiptParserService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\Facades\Storage;

class ReceiptScanController extends Controller
{
    public function __construct(protected ReceiptParserService $parserService)
    {
    }

    /**
     * Display a listing of receipt scans.
     */
    public function index(Request $request): JsonResponse
    {
        $receipts = $request->user()->receipts()
            ->latest()
            ->paginate(20);

        return response()->json([
            'success' => true,
            'data' => [
                'items' => ReceiptResource::collection($receipts->items()),
                'pagination' => [
                    'current_page' => $receipts->currentPage(),
                    'per_page' => $receipts->perPage(),
                    'total' => $receipts->total(),
                    'last_page' => $receipts->lastPage(),
                ],
            ],
        ]);
    }

    /**
     * Upload and scan a receipt.
     */
    public function scan(ReceiptScanRequest $request): JsonResponse
    {
        $user = $request->user();
        $file = $request->file('image');

        // Store image
        $path = $file->store("receipts/{$user->id}", 'public');

        // Create receipt record
        $receipt = $user->receipts()->create([
            'image_path' => $path,
            'status' => 'pending',
        ]);

        // Process synchronously as per user preference
        $receipt = $this->parserService->processReceipt($receipt);

        return response()->json([
            'success' => true,
            'data' => new ReceiptResource($receipt),
            'message' => 'Receipt scanned successfully',
        ]);
    }

    /**
     * Display the specified receipt scan.
     */
    public function show(Receipt $receipt): JsonResponse
    {
        Gate::authorize('view', $receipt);

        return response()->json([
            'success' => true,
            'data' => new ReceiptResource($receipt),
        ]);
    }

    /**
     * Create a transaction from a receipt scan.
     */
    public function createTransaction(Request $request, Receipt $receipt): JsonResponse
    {
        Gate::authorize('update', $receipt);

        $validated = $request->validate([
            'category_id' => 'required|exists:categories,id',
            'type' => 'required|in:income,expense',
            'amount' => 'required|numeric|min:0.01',
            'note' => 'nullable|string|max:255',
            'transaction_date' => 'required|date|before_or_equal:today',
            'spending_type' => 'nullable|in:need,want',
            'account_id' => 'required|exists:accounts,id',
        ]);

        $transaction = $request->user()->transactions()->create($validated);
        
        $receipt->update([
            'transaction_id' => $transaction->id,
        ]);

        return response()->json([
            'success' => true,
            'data' => new TransactionResource($transaction),
            'message' => 'Transaction created from receipt successfully',
        ], 201);
    }

    /**
     * Remove the specified receipt scan.
     */
    public function destroy(Receipt $receipt): JsonResponse
    {
        Gate::authorize('delete', $receipt);

        // Delete image from storage
        if ($receipt->image_path) {
            Storage::disk('public')->delete($receipt->image_path);
        }

        $receipt->delete();

        return response()->json([
            'success' => true,
            'message' => 'Receipt scan deleted successfully',
        ]);
    }
}
