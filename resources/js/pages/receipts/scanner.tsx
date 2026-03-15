import { Head, router } from '@inertiajs/react';
import { History, Scan, Tag } from 'lucide-react';
import { useEffect, useState } from 'react';
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

const loadingTexts = [
    'Searching for merchant name...',
    'Extracting transaction date...',
    'Summarizing total amount...',
    'Gemini is perfecting the details...',
];

export default function ReceiptScanner() {
    const [file, setFile] = useState<File | null>(null);
    const [receipt, setReceipt] = useState<Receipt | null>(null);
    const [isScanning, setIsScanning] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [loadingStep, setLoadingStep] = useState(0);

    const handleFileSelect = async (selectedFile: File) => {
        setFile(selectedFile);
        setReceipt(null);
        setIsScanning(true);

        try {
            const response = await receiptsApi.scan(selectedFile);
            if (response.data.success) {
                setReceipt(response.data.data);
                toast.success('Upload successful! Scanning receipt...');
            } else {
                toast.error(
                    response.data.message || 'Failed to upload receipt.',
                );
                setIsScanning(false);
            }
        } catch (error: unknown) {
            console.error('Scan error:', error);
            const err = error as { response?: { data?: { message?: string } } };
            const message =
                err.response?.data?.message ||
                'Check your Gemini API Configuration.';
            toast.error(`Scan Error: ${message}`);
            setIsScanning(false);
        }
    };

    // Poll for receipt status changes
    useEffect(() => {
        let interval: NodeJS.Timeout;

        if (
            receipt &&
            (receipt.status === 'pending' || receipt.status === 'processing')
        ) {
            setIsScanning(true);
            interval = setInterval(async () => {
                try {
                    const response = await receiptsApi.get(receipt.id);
                    if (response.data.success) {
                        const updatedReceipt = response.data.data;
                        setReceipt(updatedReceipt);

                        if (updatedReceipt.status === 'completed') {
                            toast.success('Scanning complete!');
                            setIsScanning(false);
                            clearInterval(interval);
                        } else if (updatedReceipt.status === 'failed') {
                            toast.error(
                                updatedReceipt.error_message ||
                                    'Scanning failed.',
                            );
                            setIsScanning(false);
                            clearInterval(interval);
                        }
                    }
                } catch (error) {
                    console.error('Polling error:', error);
                    clearInterval(interval);
                    setIsScanning(false);
                }
            }, 2000); // Poll every 2 seconds
        }

        return () => {
            if (interval) clearInterval(interval);
        };
    }, [receipt?.id, receipt?.status, receipt]);

    const handleSaveTransaction = async (formData: SaveTransactionData) => {
        if (!receipt) return;
        setIsSaving(true);

        try {
            // Parse date to YYYY-MM-DD format
            const transactionDate = new Date(formData.transaction_date);
            const formattedDate = transactionDate.toISOString().split('T')[0];

            const payload = {
                category_id: parseInt(formData.category_id),
                account_id: parseInt(formData.account_id),
                type: formData.type,
                amount: formData.amount,
                note: formData.note,
                transaction_date: formattedDate,
                spending_type: formData.spending_type,
            };

            console.log('Saving transaction with payload:', payload);

            const response = await receiptsApi.createTransaction(receipt.id, payload);
            
            console.log('Response:', response.data);
            
            if (response.data.success) {
                toast.success('Transaction created successfully!');
                router.visit('/transactions');
            }
        } catch (error: unknown) {
            console.error('Save transaction error:', error);
            const err = error as { response?: { data?: { message?: string; errors?: any } } };
            const message = err.response?.data?.message || 'Failed to create transaction.';
            const errors = err.response?.data?.errors;
            if (errors) {
                console.error('Validation errors:', errors);
                toast.error(`Validation error: ${JSON.stringify(errors)}`);
            } else {
                toast.error(message);
            }
        } finally {
            setIsSaving(false);
        }
    };

    // Loading text cycler effect
    useEffect(() => {
        let timer: NodeJS.Timeout;
        if (isScanning) {
            timer = setInterval(() => {
                setLoadingStep((prev) => (prev + 1) % loadingTexts.length);
            }, 2500);
        } else {
            setLoadingStep(0);
        }
        return () => clearInterval(timer);
    }, [isScanning]);

    const resetScanner = () => {
        setFile(null);
        setReceipt(null);
        setIsScanning(false);
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Receipt Scanner" />

            <div className="noise-overlay relative flex flex-1 flex-col gap-6 p-4 md:gap-8 md:p-8">
                {/* Ambient Background Blur */}
                <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
                    <div className="absolute top-0 left-1/2 -mt-32 h-120 w-160 -translate-x-1/2 rounded-full bg-primary/5 blur-[100px]" />
                </div>

                {/* Header Section */}
                <div className="space-y-3 text-center">
                    <div className="inline-flex items-center gap-3">
                        <div className="flex size-12 items-center justify-center rounded-2xl bg-linear-to-br from-primary/20 to-primary/5 text-primary shadow-inner">
                            <Scan className="size-6" />
                        </div>
                        <h1 className="text-4xl font-black tracking-tighter">
                            Smart Scanner
                        </h1>
                    </div>
                    <p className="mx-auto max-w-xl text-lg leading-relaxed text-muted-foreground">
                        Instantly turn your receipts into transactions using
                        advanced Gemini AI analysis.
                    </p>
                </div>

                {!file && !receipt && !isScanning ? (
                    /* Centered Initial State */
                    <div className="mx-auto max-w-2xl animate-in fade-in zoom-in-95 duration-500 space-y-8 mt-12">
                        <ReceiptUploadZone
                            onFileSelect={handleFileSelect}
                            isUploading={isScanning}
                        />
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-center">
                            <div className="rounded-3xl border border-white/20 bg-white/40 p-6 shadow-xs backdrop-blur-xl transition-all duration-300 hover:bg-white/50 dark:border-white/10 dark:bg-slate-900/40">
                                <Scan className="size-6 mx-auto mb-3 text-primary opacity-80" />
                                <h4 className="font-bold text-sm mb-1 text-foreground">Clear Photo</h4>
                                <p className="text-xs text-muted-foreground leading-relaxed">Capture the whole receipt in good lighting</p>
                            </div>
                            <div className="rounded-3xl border border-white/20 bg-white/40 p-6 shadow-xs backdrop-blur-xl transition-all duration-300 hover:bg-white/50 dark:border-white/10 dark:bg-slate-900/40">
                                <History className="size-6 mx-auto mb-3 text-primary opacity-80" />
                                <h4 className="font-bold text-sm mb-1 text-foreground">Fast & Smart</h4>
                                <p className="text-xs text-muted-foreground leading-relaxed">Gemini AI analyzes items automatically</p>
                            </div>
                            <div className="rounded-3xl border border-white/20 bg-white/40 p-6 shadow-xs backdrop-blur-xl transition-all duration-300 hover:bg-white/50 dark:border-white/10 dark:bg-slate-900/40">
                                <Tag className="size-6 mx-auto mb-3 text-primary opacity-80" />
                                <h4 className="font-bold text-sm mb-1 text-foreground">Multi-Language</h4>
                                <p className="text-xs text-muted-foreground leading-relaxed">Supports Indonesian & English formats</p>
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="@container grid grid-cols-1 gap-10 lg:grid-cols-12 animate-in fade-in slide-in-from-bottom-8 duration-700">
                        {/* Left Column: Upload & Preview */}
                        <div className="space-y-6 lg:col-span-5 2xl:col-span-3">
                            {!file ? (
                                <div className="sticky top-8">
                                    <ReceiptUploadZone
                                        onFileSelect={handleFileSelect}
                                        isUploading={isScanning}
                                    />
                                </div>
                            ) : (
                                <div className="sticky top-8">
                                    <ReceiptPreview
                                        file={file}
                                        isProcessing={isScanning}
                                        onRemove={resetScanner}
                                        hideOverlay={true}
                                    />
                                    <Card className="mt-6 rounded-3xl border-0 bg-accent/20 shadow-sm">
                                        <CardHeader className="pb-2">
                                            <CardTitle className="flex items-center gap-2 text-sm font-bold">
                                                <History className="size-4" />
                                                Tips for better results
                                            </CardTitle>
                                        </CardHeader>
                                        <CardContent className="space-y-2 text-xs text-muted-foreground">
                                            <p>• Ensure good lighting and flat surface</p>
                                            <p>• Capture the whole receipt clearly</p>
                                            <p>• Support for Indonesian & English formats</p>
                                        </CardContent>
                                    </Card>
                                </div>
                            )}
                        </div>

                        {/* Right Column: Results & Form */}
                        <div className="lg:col-span-7 2xl:col-span-9">
                            <div className="animate-in space-y-8 duration-700 fade-in slide-in-from-right-4">
                                {isScanning &&
                                (!receipt || receipt.status !== 'completed') ? (
                                    <div className="flex flex-col items-center justify-center rounded-4xl border border-primary/20 bg-primary/5 p-16 text-center shadow-[inset_0_0_100px_rgba(var(--primary),0.02)] backdrop-blur-xl transition-all h-[calc(100vh-200px)] min-h-125">
                                        <div className="mb-8 flex size-24 items-center justify-center relative">
                                            <div className="absolute inset-0 animate-pulse rounded-full bg-primary/20 blur-xl" />
                                            <div className="relative size-16 animate-spin rounded-full border-4 border-primary/30 border-t-primary" />
                                            <div className="absolute inset-0 flex items-center justify-center">
                                                <Scan className="size-6 text-primary animate-pulse" />
                                            </div>
                                        </div>
                                        <h3 className="text-2xl font-black tracking-tight text-foreground animate-in fade-in slide-in-from-bottom-2 duration-500" key={loadingStep}>
                                            {loadingTexts[loadingStep]}
                                        </h3>
                                        <p className="mx-auto mt-3 max-w-65 text-sm font-medium leading-relaxed text-muted-foreground/80 lowercase italic">
                                            almost there, finalizing your transaction...
                                        </p>
                                    </div>
                                ) : (
                                    receipt?.parsed_data && (
                                        <div className="grid grid-cols-1 gap-8 2xl:grid-cols-2">
                                            <div className="space-y-8">
                                                <ReceiptParsedResult
                                                    data={receipt.parsed_data}
                                                    rawText={receipt.raw_text}
                                                    hideItemsList={true}
                                                    hideRawText={true}
                                                />
                                            </div>

                                            <div className="space-y-8">
                                                <div className="hidden 2xl:block h-px bg-transparent" /> {/* Spacer instead of line on 3-col */}
                                                <div className="block 2xl:hidden h-px bg-border" /> {/* Line for mobile/tablet */}

                                                <ReceiptToTransactionForm
                                                    data={receipt.parsed_data}
                                                    onSave={handleSaveTransaction}
                                                    isSaving={isSaving}
                                                />
                                            </div>
                                        </div>
                                    )
                                )}
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </AppLayout>
    );
}
