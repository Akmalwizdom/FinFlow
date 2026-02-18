<?php

namespace App\Services;

use App\Models\Receipt;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;
use thiagoalessio\TesseractOCR\TesseractOCR;

class ReceiptParserService
{
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

            // 1. Extract raw text via Tesseract
            $rawText = $this->extractText($fullPath);
            
            // 2. Parse extracted text
            $parsedData = $this->parseReceiptText($rawText);

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

    /**
     * Run Tesseract OCR on the image.
     */
    public function extractText(string $filePath): string
    {
        $tesseract = new TesseractOCR($filePath);
        
        // Use system path from config if available
        $executable = config('ocr.tesseract_path', 'tesseract');
        $tesseract->executable($executable);
        
        $tesseract->lang('eng');
        $tesseract->psm(6); // Assume uniform block of text

        return $tesseract->run();
    }

    /**
     * Parse raw OCR text into structured data.
     */
    public function parseReceiptText(string $rawText): array
    {
        $lines = explode("\n", $rawText);
        $lines = array_filter(array_map('trim', $lines));

        $data = [
            'merchant' => $this->extractMerchant($lines),
            'total' => $this->extractTotal($rawText),
            'date' => $this->extractDate($rawText),
            'items' => $this->extractItems($lines),
            'confidence' => 0.8, // Static for now
        ];

        return $data;
    }

    /**
     * Extract merchant name (usually first non-empty line).
     */
    private function extractMerchant(array $lines): ?string
    {
        return $lines[0] ?? 'Unknown Merchant';
    }

    /**
     * Extract total amount using regex.
     */
    private function extractTotal(string $rawText): float
    {
        // Common patterns for total amount
        $patterns = [
            '/(?:total|grand total|jumlah|total bayar)[:\s]*[RrPp\$\s]*([\d.,]+)/i',
            '/[RrPp\$\s]*([\d.,]+)\s*(?:total|grand total|jumlah)/i',
            '/TOTAL[:\s]*([\d.,]+)/',
        ];

        foreach ($patterns as $pattern) {
            if (preg_match($pattern, $rawText, $matches)) {
                $amount = str_replace([',', ' '], '', $matches[1]);
                // Handle European decimal point if needed, or simple floatval
                if (strpos($amount, '.') !== false && substr_count($amount, '.') > 1) {
                     $amount = str_replace('.', '', $amount);
                }
                return (float) $amount;
            }
        }

        return 0.00;
    }

    /**
     * Extract date using common patterns.
     */
    private function extractDate(string $rawText): ?string
    {
        $patterns = [
            '/\b(\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4})\b/', // DD/MM/YYYY or MM/DD/YYYY
            '/\b(\d{4}[\/\-]\d{1,2}[\/\-]\d{1,2})\b/', // YYYY-MM-DD
            '/\b(\d{1,2}\s+[A-Za-z]+\s+\d{2,4})\b/', // DD MMM YYYY
        ];

        foreach ($patterns as $pattern) {
            if (preg_match($pattern, $rawText, $matches)) {
                try {
                    return date('Y-m-d', strtotime(str_replace('/', '-', $matches[1])));
                } catch (\Exception $e) {
                    continue;
                }
            }
        }

        return date('Y-m-d'); // Default to today
    }

    /**
     * Extract line items.
     */
    private function extractItems(array $lines): array
    {
        $items = [];
        // Very basic line item extraction: Look for lines with a price pattern at the end
        foreach ($lines as $line) {
            if (preg_match('/^(.*?)\s+[\d.,]+\s*$/', $line, $matches)) {
                $items[] = [
                    'name' => trim($matches[1]),
                    'price' => 0.00, // Harder to get accurately without more complex regex
                ];
            }
        }

        return $items;
    }
}
