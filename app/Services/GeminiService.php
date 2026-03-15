<?php

namespace App\Services;

use Gemini\Client;
use Gemini\Data\Blob;
use Illuminate\Support\Facades\Log;

class GeminiService
{
    protected Client $client;

    public function __construct()
    {
        $apiKey = config('services.gemini.api_key');
        if (!$apiKey) {
            throw new \Exception('GEMINI_API_KEY is not set in the .env file.');
        }
        $this->client = \Gemini::client($apiKey);
    }

    /**
     * Parse receipt image using Gemini Vision AI
     */
    public function parseReceipt(string $imagePath): array
    {
        if (!file_exists($imagePath)) {
            throw new \Exception("Image file not found: {$imagePath}");
        }

        $mimeStr = mime_content_type($imagePath);
        $mimeType = \Gemini\Enums\MimeType::tryFrom($mimeStr);
        if (!$mimeType) {
            throw new \Exception("Unsupported image mime type: {$mimeStr}");
        }

        $imageData = base64_encode(file_get_contents($imagePath));

        $prompt = <<<EOT
You are an expert receipt data extraction AI.
Analyze this receipt image and extract the following information.
Provide the output ONLY as a valid JSON object matching this exact structure:
{
    "merchant": "Name of the store or company. (String)",
    "total": "The absolute final Grand Total amount paid. Remove currency symbols and separators, format as a pure float number like 201600.00. (Float)",
    "date": "The transaction date prominently displayed, formatted precisely as YYYY-MM-DD. (String)",
    "items": [
        {
            "name": "Line item name/description (String)",
            "price": "Line item total price. Remove currency symbols and separators. (Float)"
        }
    ]
}
Important rules:
1. Do NOT wrap the JSON in markdown code blocks like ```json ... ```. Just return the raw JSON string starting with { and ending with }.
2. If a value is missing or unreadable, use null for strings and 0.00 for floats.
3. Be EXTREMELY careful not to confuse phone numbers or NPWP numbers with the Grand Total or Date.
4. For the merchant name, prioritize the largest brand logo or text at the very top.
EOT;

        try {
            $model = config('services.gemini.model', 'gemini-2.5-flash');
            $response = $this->client->generativeModel($model)->generateContent([
                $prompt,
                new Blob(
                    mimeType: $mimeType,
                    data: $imageData
                )
            ]);

            $textOutput = $response->text();
            
            // In case Gemini still adds markdown formatting despite instructions
            $textOutput = str_replace(['```json', '```'], '', $textOutput);
            $textOutput = trim($textOutput);

            $data = json_decode($textOutput, true);

            if (json_last_error() !== JSON_ERROR_NONE) {
                 $errorMessage = "Gemini JSON parse error: " . json_last_error_msg();
                 Log::error($errorMessage . " | Raw Output: " . $textOutput);
                 throw new \Exception($errorMessage);
            }

            // Calculate confidence (Gemini is usually highly confident if it returns valid JSON)
            $data['confidence'] = 0.95;
            
            return [
                'success' => true,
                'raw_text' => $textOutput, // We store the JSON string as raw_text for debugging
                'parsed_data' => $data
            ];

        } catch (\Exception $e) {
            Log::error("Gemini OCR failed: " . $e->getMessage());
            return [
                'success' => false,
                'error' => $e->getMessage()
            ];
        }
    }
}
