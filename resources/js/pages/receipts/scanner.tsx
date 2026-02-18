import { Head, router } from '@inertiajs/react';
import { History, Scan } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';

import { ReceiptParsedResult } from '@/components/receipt-scanner/ReceiptParsedResult';
import { ReceiptPreview } from '@/components/receipt-scanner/ReceiptPreview';
import { ReceiptToTransactionForm } from '@/components/receipt-scanner/ReceiptToTransactionForm';
import { ReceiptUploadZone } from '@/components/receipt-scanner/ReceiptUploadZone';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import AppLayout from '@/layouts/app-layout';
import { receiptsApi, type Receipt } from '@/lib/api';
import { type BreadcrumbItem } from '@/types';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Dashboard',
        href: '/dashboard',
    },
    {
        title: 'Receipt Scanner',
        href: '/receipts/scanner',
    },
];

interface SaveTransactionData {
    amount: number;
    note: string;
    transaction_date: string;
    category_id: string;
    account_id: string;
    type: 'income' | 'expense';
    spending_type: 'need' | 'want';
}

export default function ReceiptScanner() {
    const [file, setFile] = useState<File | null>(null);
    const [receipt, setReceipt] = useState<Receipt | null>(null);
    const [isScanning, setIsScanning] = useState(false);
    const [isSaving, setIsSaving] = useState(false);

    const handleFileSelect = async (selectedFile: File) => {
        setFile(selectedFile);
        setReceipt(null);
        setIsScanning(true);

        try {
            const response = await receiptsApi.scan(selectedFile);
            if (response.data.success) {
                setReceipt(response.data.data);
                toast.success('Receipt scanned successfully!');
            } else {
                toast.error(response.data.message || 'Failed to scan receipt.');
            }
        } catch (error: unknown) {
            console.error('Scan error:', error);
            const err = error as { response?: { data?: { message?: string } } };
            const message =
                err.response?.data?.message ||
                'Check your Tesseract OCR installation.';
            toast.error(`OCR Error: ${message}`);
        } finally {
            setIsScanning(false);
        }
    };

    const handleSaveTransaction = async (formData: SaveTransactionData) => {
        if (!receipt) return;
        setIsSaving(true);

        try {
            const response = await receiptsApi.createTransaction(receipt.id, {
                ...formData,
                category_id: parseInt(formData.category_id),
                account_id: parseInt(formData.account_id),
            });
            if (response.data.success) {
                toast.success('Transaction created successfully!');
                router.visit('/transactions');
            }
        } catch (error: unknown) {
            const err = error as { response?: { data?: { message?: string } } };
            toast.error(
                err.response?.data?.message || 'Failed to create transaction.',
            );
        } finally {
            setIsSaving(false);
        }
    };

    const resetScanner = () => {
        setFile(null);
        setReceipt(null);
        setIsScanning(false);
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Receipt Scanner" />

            <div className="mx-auto max-w-4xl space-y-8 p-4 sm:p-6 lg:p-8">
                {/* Header Section */}
                <div className="space-y-2">
                    <div className="flex items-center gap-3">
                        <div className="flex size-10 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                            <Scan className="size-6" />
                        </div>
                        <h1 className="text-3xl font-black tracking-tight">
                            Receipt Scanner
                        </h1>
                    </div>
                    <p className="text-lg text-muted-foreground">
                        Turn your receipts into transactions instantly using
                        AI-powered OCR.
                    </p>
                </div>

                <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
                    {/* Left Column: Upload & Preview */}
                    <div className="space-y-6 lg:col-span-5">
                        {!file ? (
                            <ReceiptUploadZone
                                onFileSelect={handleFileSelect}
                                isUploading={isScanning}
                            />
                        ) : (
                            <ReceiptPreview
                                file={file}
                                isProcessing={isScanning}
                                onRemove={resetScanner}
                            />
                        )}

                        <Card className="rounded-3xl border-0 bg-accent/20 shadow-sm">
                            <CardHeader className="pb-2">
                                <CardTitle className="flex items-center gap-2 text-sm font-bold">
                                    <History className="size-4" />
                                    Tips for better results
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-2 text-xs text-muted-foreground">
                                <p>• Ensure good lighting and flat surface</p>
                                <p>• Capture the whole receipt clearly</p>
                                <p>
                                    • Support for Indonesian & English formats
                                </p>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Right Column: Results & Form */}
                    <div className="lg:col-span-7">
                        {!receipt && !isScanning && (
                            <div className="flex h-full min-h-100 flex-col items-center justify-center rounded-3xl border-2 border-dashed bg-accent/5 p-8 text-center opacity-50">
                                <div className="mb-4 flex size-16 items-center justify-center rounded-full bg-muted">
                                    <Scan className="size-8 text-muted-foreground" />
                                </div>
                                <h3 className="text-lg font-bold">
                                    No Scanning Data
                                </h3>
                                <p className="mx-auto max-w-70 text-sm text-muted-foreground">
                                    Upload a receipt to see the extracted data
                                    and create a transaction.
                                </p>
                            </div>
                        )}

                        {(isScanning || receipt) && (
                            <div className="animate-in space-y-8 duration-700 fade-in slide-in-from-right-4">
                                {receipt?.parsed_data && (
                                    <>
                                        <ReceiptParsedResult
                                            data={receipt.parsed_data}
                                            rawText={receipt.raw_text}
                                        />

                                        <div className="my-8 h-px bg-border" />

                                        <ReceiptToTransactionForm
                                            data={receipt.parsed_data}
                                            onSave={handleSaveTransaction}
                                            isSaving={isSaving}
                                        />
                                    </>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
