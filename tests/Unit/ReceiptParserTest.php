<?php

namespace Tests\Unit;

use App\Services\ReceiptParserService;
use Tests\TestCase;

class ReceiptParserTest extends TestCase
{
    protected ReceiptParserService $service;

    protected function setUp(): void
    {
        parent::setUp();
        $this->service = new ReceiptParserService();
    }

    public function test_it_extracts_merchant_correctly_skipping_headers()
    {
        $rawText = "STRUK PEMBAYARAN\nIndomaret Point\nJl. Sudirman No. 1\nJakarta";
        $data = $this->service->parseReceiptText($rawText);
        $this->assertEquals('INDOMARET', $data['merchant']);
    }

    public function test_it_extracts_total_with_indonesian_format()
    {
        $rawText = "Indomaret\nITEM A 10.000\nITEM B 5.000\nTotal Bayar: 15.000,00";
        $data = $this->service->parseReceiptText($rawText);
        $this->assertEquals(15000.0, $data['total']);
    }

    public function test_it_extracts_total_from_candidates_if_no_pattern()
    {
        $rawText = "Warung Makan\nNasi Goreng 25.000\nEs Teh 5.000\n30.000\nTerima Kasih";
        $data = $this->service->parseReceiptText($rawText);
        $this->assertEquals(30000.0, $data['total']);
    }

    public function test_it_extracts_date_correctly()
    {
        $rawText = "Toko Maju Jaya\nTanggal: 15/02/2026\nJam: 10:00";
        $data = $this->service->parseReceiptText($rawText);
        $this->assertEquals('2026-02-15', $data['date']);
        
        $rawText2 = "Toko Maju Jaya\n15 Februari 2026\nJam: 10:00";
        $data2 = $this->service->parseReceiptText($rawText2);
        $this->assertEquals('2026-02-15', $data2['date']);
    }

    public function test_it_calculates_confidence_score()
    {
        $rawText = "Indomaret Point\nTanggal: 15/02/2026\nTotal: 50.000";
        $data = $this->service->parseReceiptText($rawText);
        $this->assertGreaterThan(0.7, $data['confidence']);
    }

    public function test_it_extracts_line_items()
    {
        $rawText = "Supermarket\nSusu Bantal 5.000\nRoti Sobek 12.000\nTotal 17.000";
        $data = $this->service->parseReceiptText($rawText);
        
        $this->assertCount(2, $data['items']);
        $this->assertEquals('Susu Bantal', $data['items'][0]['name']);
        $this->assertEquals(5000.0, $data['items'][0]['price']);
        $this->assertEquals('Roti Sobek', $data['items'][1]['name']);
        $this->assertEquals(12000.0, $data['items'][1]['price']);
    }

    public function test_it_ignores_phone_numbers_as_total()
    {
        $rawText = "Alfamart\nTelp: 081234567890\nNPWP: 013332220054000\nTotal: 25.000";
        $data = $this->service->parseReceiptText($rawText);
        $this->assertEquals(25000.0, $data['total']);
    }
}
