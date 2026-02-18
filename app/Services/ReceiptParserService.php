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
        
        // Try to use ind+eng for better Indonesian receipt support
        // We catch exception in case the language pack is not installed
        try {
             $tesseract->lang('ind', 'eng');
        } catch (\Exception $e) {
             $tesseract->lang('eng');
        }
        
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
        $lines = array_values($lines); // Re-index

        $data = [
            'merchant' => $this->extractMerchant($lines),
            'total' => $this->extractTotal($rawText),
            'date' => $this->extractDate($rawText),
            'items' => $this->extractItems($lines),
            'confidence' => $this->calculateConfidence($rawText),
        ];

        return $data;
    }

    /**
     * Extract merchant name.
     * Skips common non-merchant headers.
     */
    private function extractMerchant(array $lines): ?string
    {
        $skipKeywords = [
            'struk', 'nota', 'pembayaran', 'receipt', 'invoice', 'welcome', 'selamat datang',
            'toko', 'merchant', 'bukti', 'transaksi', 'layanan', 'customer', 'pelanggan'
        ];

        foreach ($lines as $line) {
            $normalized = strtolower($line);
            
            // Skip if line is too short or contains common header keywords
            if (strlen($line) < 3) continue;
            
            $shouldSkip = false;
            foreach ($skipKeywords as $keyword) {
                if (str_contains($normalized, $keyword)) {
                    // Check if it's JUST the keyword (like "STRUK PEMBAYARAN")
                    // If it's something like "Toko Kelontong", we might want to keep it.
                    // But usually, headers are separate lines.
                    if (strlen($normalized) < strlen($keyword) + 10) {
                        $shouldSkip = true;
                        break;
                    }
                }
            }

            if (!$shouldSkip) {
                // Return the first line that doesn't look like a header
                return $line;
            }
        }

        return $lines[0] ?? 'Unknown Merchant';
    }

    /**
     * Extract total amount using a more robust candidate-based approach.
     */
    private function extractTotal(string $rawText): float
    {
        // 1. Find all numbers in the text that look like currency
        // Matches: 10.000, 10,000, 10.000,00, 123.45
        preg_match_all('/(?:Rp|IDR)?\s*([\d.,]+)/i', $rawText, $matches);
        
        $candidates = [];
        if (!empty($matches[1])) {
            foreach ($matches[1] as $match) {
                $cleaned = $this->cleanAmount($match);
                if ($cleaned > 0) {
                    $candidates[] = $cleaned;
                }
            }
        }

        // 2. Look for specific context for "Total"
        $totalPatterns = [
            '/(?:total|grand total|jumlah|total bayar|billing|amount due)[:\s]*[RrPp\$\s]*([\d.,]+)/i',
            '/[RrPp\$\s]*([\d.,]+)\s*(?:total|grand total|jumlah|bayar)/i',
            '/TOTAL[:\s]*([\d.,]+)/',
        ];

        foreach ($totalPatterns as $pattern) {
            if (preg_match($pattern, $rawText, $matches)) {
                return $this->cleanAmount($matches[1]);
            }
        }

        // 3. Heuristic: Usually the largest number in a receipt is the total
        // We filter out candidates that are likely years (e.g., 2024, 2025) 
        // unless they are clearly in a currency context.
        if (!empty($candidates)) {
            rsort($candidates);
            foreach ($candidates as $candidate) {
                // Heuristic: Ignore numbers that look like years or small quantities
                if ($candidate > 2050 || $candidate < 100) continue; 
                return $candidate;
            }
            return $candidates[0]; // Fallback to largest
        }

        return 0.00;
    }

    /**
     * Clean Indonesian/English amount strings to float.
     */
    private function cleanAmount(string $amountStr): float
    {
        // Indonesian: 10.000,00 -> 10000.00
        // English: 10,000.00 -> 10000.00
        
        // Count dots and commas
        $dots = substr_count($amountStr, '.');
        $commas = substr_count($amountStr, ',');

        if ($commas > 0 && $dots > 0) {
            // Mixed format: 1.234,56 (ID) or 1,234.56 (US)
            if (strrpos($amountStr, ',') > strrpos($amountStr, '.')) {
                // ID format: comma is decimal
                $amountStr = str_replace('.', '', $amountStr);
                $amountStr = str_replace(',', '.', $amountStr);
            } else {
                // US format: dot is decimal
                $amountStr = str_replace(',', '', $amountStr);
            }
        } elseif ($commas > 0) {
            // Only comma: 10,000 or 10,00
            if ($commas == 1 && strlen(substr($amountStr, strpos($amountStr, ',') + 1)) === 2) {
                // Probably decimal: 10,00
                $amountStr = str_replace(',', '.', $amountStr);
            } else {
                // Probably thousands separator: 10,000
                $amountStr = str_replace(',', '', $amountStr);
            }
        } elseif ($dots > 0) {
            // Only dot: 10.000 or 10.00
            if ($dots == 1 && strlen(substr($amountStr, strpos($amountStr, '.') + 1)) === 2) {
                // Decimal: 10.00
            } else {
                // Thousands separator: 10.000
                $amountStr = str_replace('.', '', $amountStr);
            }
        }

        return (float) $amountStr;
    }

    /**
     * Extract date using common patterns.
     */
    private function extractDate(string $rawText): ?string
    {
        $patterns = [
            '/\b(\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4})\b/', // DD/MM/YYYY or MM/DD/YYYY
            '/\b(\d{4}[\/\-]\d{1,2}[\/\-]\d{1,2})\b/', // YYYY-MM-DD
            '/\b(\d{1,2}\s+(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec|Januari|Februari|Maret|April|Mei|Juni|Juli|Agustus|September|Oktober|November|Desember)[a-z]*\s+\d{2,4})\b/i', // DD MMM YYYY
        ];

        $monthMap = [
            'januari' => 'january', 'februari' => 'february', 'maret' => 'march', 'mei' => 'may',
            'juni' => 'june', 'juli' => 'july', 'agustus' => 'august', 'september' => 'september',
            'oktober' => 'october', 'november' => 'november', 'desember' => 'december'
        ];

        foreach ($patterns as $pattern) {
            if (preg_match($pattern, $rawText, $matches)) {
                $dateStr = str_replace('/', '-', $matches[1]);
                
                // Handle Indonesian month names
                $lowerDateStr = strtolower($dateStr);
                foreach ($monthMap as $id => $en) {
                    if (str_contains($lowerDateStr, $id)) {
                        $dateStr = str_replace($id, $en, $lowerDateStr);
                        break;
                    }
                }

                $timestamp = strtotime($dateStr);
                if ($timestamp) {
                    return date('Y-m-d', $timestamp);
                }
            }
        }

        return date('Y-m-d'); // Default to today
    }

    /**
     * Calculate a basic confidence score based on extraction success.
     */
    private function calculateConfidence(string $rawText): float
    {
        $score = 0.5; // Base score

        // If we found a merchant that isn't too short
        if (preg_match('/[a-zA-Z]{5,}/', $rawText)) $score += 0.1;

        // If we found a clear total pattern
        if (preg_match('/(?:total|jumlah)/i', $rawText)) $score += 0.2;

        // If we found a date
        if (preg_match('/\d{2,4}[-\/]\d{1,2}/', $rawText)) $score += 0.1;

        // Cap at 0.95 (OCR is never 100% certain)
        return min(0.95, $score);
    }

    /**
     * Extract line items (Simplified).
     */
    private function extractItems(array $lines): array
    {
        $items = [];
        // Look for lines that have a description followed by a price
        foreach ($lines as $line) {
            if (preg_match('/^(.*?)\s+([\d.,]+)\s*$/', $line, $matches)) {
                $description = trim($matches[1]);
                $price = $this->cleanAmount($matches[2]);
                
                // Filter out common metadata as "items"
                if (strlen($description) > 3 && $price > 0 && !str_contains(strtolower($description), 'total')) {
                    $items[] = [
                        'name' => $description,
                        'price' => $price,
                    ];
                }
            }
        }

        return $items;
    }
}
