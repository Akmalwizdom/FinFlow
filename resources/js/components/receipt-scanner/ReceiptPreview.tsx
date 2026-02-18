import { Loader2, RefreshCcw, X } from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

interface ReceiptPreviewProps {
    file: File | null;
    imageUrl?: string | null;
    isProcessing: boolean;
    onRemove: () => void;
}

export function ReceiptPreview({
    file,
    imageUrl,
    isProcessing,
    onRemove,
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
            {isProcessing && (
                <div className="absolute inset-0 flex animate-in flex-col items-center justify-center gap-4 bg-background/60 backdrop-blur-sm duration-300 fade-in">
                    <div className="relative">
                        <div className="absolute -inset-4 animate-pulse rounded-full bg-primary/20 blur-xl" />
                        <Loader2 className="size-10 animate-spin text-primary" />
                    </div>
                    <div className="space-y-1 text-center">
                        <p className="animate-pulse text-lg font-bold">
                            Scanning Receipt...
                        </p>
                        <p className="text-sm text-muted-foreground">
                            Extracting details with OCR
                        </p>
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
