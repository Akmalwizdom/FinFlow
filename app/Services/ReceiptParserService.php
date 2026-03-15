<?php

namespace App\Services;

use App\Models\Receipt;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;

class ReceiptParserService
{
    protected GeminiService $geminiService;

    public function __construct(GeminiService $geminiService)
    {
        $this->geminiService = $geminiService;
    }
    /**
     * Process a receipt record: extract text and parse data.
     */
    public function processReceipt(Receipt $receipt): Receipt
    {
        try {
            $receipt->update(['status' => 'processing']);

            $fullPath = Storage::disk('public')->path($receipt->image_path);

            if (!file_exists($fullPath)) {
                throw new \Exception("Receipt image not found at: {$fullPath}");
            }

            // Extract and parse receipt data via Gemini AI
            $result = $this->geminiService->parseReceipt($fullPath);

            if (!$result['success']) {
                throw new \Exception($result['error'] ?? 'Unknown Gemini OCR error');
            }

            $rawText = $result['raw_text'];
            $parsedData = $result['parsed_data'];

            // Save JSON parsing results directly
            $receipt->update([
                'raw_text' => $rawText,
                'parsed_data' => $parsedData,
                'status' => 'completed',
            ]);

        } catch (\Exception $e) {
            Log::error("Receipt processing failed: " . $e->getMessage());
            $receipt->update([
                'status' => 'failed',
                'error_message' => $e->getMessage(),
            ]);
        }

        return $receipt;
    }
}

// Ensure no trailing code remains.
