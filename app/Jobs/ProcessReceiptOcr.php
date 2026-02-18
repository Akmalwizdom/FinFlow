<?php

namespace App\Jobs;

use App\Models\Receipt;
use App\Services\ReceiptParserService;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Log;

class ProcessReceiptOcr implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    /**
     * The number of times the job may be attempted.
     *
     * @var int
     */
    public $tries = 3;

    /**
     * The number of seconds the job can run before timing out.
     *
     * @var int
     */
    public $timeout = 120;

    /**
     * Create a new job instance.
     */
    public function __construct(protected Receipt $receipt)
    {
    }

    /**
     * Execute the job.
     */
    public function handle(ReceiptParserService $parserService): void
    {
        Log::info("Starting OCR processing for Receipt ID: {$this->receipt->id}");
        
        $parserService->processReceipt($this->receipt);
        
        Log::info("Finished OCR processing for Receipt ID: {$this->receipt->id}");
    }

    /**
     * Handle a job failure.
     */
    public function failed(\Throwable $exception): void
    {
        Log::error("OCR Job failed for Receipt ID: {$this->receipt->id}. Error: " . $exception->getMessage());
        
        $this->receipt->update([
            'status' => 'failed',
            'error_message' => $exception->getMessage(),
        ]);
    }
}
