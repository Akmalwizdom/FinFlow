import { Loader2, RefreshCcw, X } from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

interface ReceiptPreviewProps {
    file: File | null;
    imageUrl?: string | null;
    isProcessing: boolean;
    onRemove: () => void;
    hideOverlay?: boolean;
}

export function ReceiptPreview({
    file,
    imageUrl,
    isProcessing,
    onRemove,
    hideOverlay = false,
}: ReceiptPreviewProps) {
    const previewUrl = file ? URL.createObjectURL(file) : imageUrl;

    if (!previewUrl) return null;

    return (
        <div className="group relative w-full overflow-hidden rounded-3xl border bg-accent/20 transition-all duration-500">
            {/* Image Preview */}
            <img
                src={previewUrl}
                alt="Receipt Preview"
                className="mx-auto h-auto max-h-125 w-full object-contain"
            />

            {/* Processing Overlay */}
            {isProcessing && !hideOverlay && (
                <div className="absolute inset-0 overflow-hidden bg-background/70 backdrop-blur-md transition-all duration-500">
                    <div className="absolute inset-0 flex animate-in flex-col items-center justify-center gap-6 duration-700 fade-in zoom-in-95">
                        <div className="relative">
                            <div className="absolute -inset-6 animate-pulse rounded-full bg-primary/20 blur-2xl" />
                            <div className="relative flex size-16 items-center justify-center rounded-2xl border border-primary/20 bg-background/80 shadow-[0_0_20px_rgba(var(--primary),0.2)] backdrop-blur-xl">
                                <Loader2 className="size-8 animate-spin text-primary" />
                            </div>
                        </div>
                        <div className="space-y-2 text-center">
                            <p className="text-xl font-bold tracking-tight text-foreground">
                                AI Scanning...
                            </p>
                            <p className="mx-auto max-w-48 text-sm leading-relaxed text-muted-foreground">
                                Analyzing receipt details with Gemini AI
                            </p>
                        </div>
                    </div>
                </div>
            )}

            {/* Actions Overlay */}
            {!isProcessing && (
                <div className="absolute top-4 right-4 flex gap-2">
                    <Button
                        variant="destructive"
                        size="icon"
                        className="h-9 w-9 rounded-full shadow-lg"
                        onClick={onRemove}
                    >
                        <X className="size-4" />
                    </Button>
                </div>
            )}

            {/* Bottom info */}
            {!isProcessing && (
                <div className="absolute inset-x-0 bottom-0 flex items-center justify-between bg-linear-to-t from-black/60 to-transparent p-4">
                    <Badge
                        variant="secondary"
                        className="border-0 bg-white/20 text-white backdrop-blur-md"
                    >
                        {file
                            ? `${(file.size / 1024 / 1024).toFixed(1)} MB`
                            : 'Remote Image'}
                    </Badge>
                    {!isProcessing && (
                        <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-white hover:bg-white/10"
                            onClick={onRemove}
                        >
                            <RefreshCcw className="size-3" />
                        </Button>
                    )}
                </div>
            )}
        </div>
    );
}
