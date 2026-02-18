import { Camera, Upload } from 'lucide-react';
import { useCallback, useState } from 'react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface ReceiptUploadZoneProps {
    onFileSelect: (file: File) => void;
    isUploading?: boolean;
}

export function ReceiptUploadZone({
    onFileSelect,
    isUploading,
}: ReceiptUploadZoneProps) {
    const [isDragging, setIsDragging] = useState(false);

    const validateAndSelect = useCallback(
        (file: File) => {
            if (!file.type.startsWith('image/')) {
                toast.error('Please upload an image file (JPG, PNG, WEBP).');
                return;
            }

            if (file.size > 10 * 1024 * 1024) {
                toast.error('Image size must be less than 10MB.');
                return;
            }

            onFileSelect(file);
        },
        [onFileSelect],
    );

    const handleDragOver = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(true);
    }, []);

    const handleDragLeave = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(false);
    }, []);

    const handleDrop = useCallback(
        (e: React.DragEvent) => {
            e.preventDefault();
            e.stopPropagation();
            setIsDragging(false);

            const files = e.dataTransfer.files;
            if (files && files.length > 0) {
                validateAndSelect(files[0]);
            }
        },
        [validateAndSelect],
    );

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (files && files.length > 0) {
            validateAndSelect(files[0]);
        }
    };

    return (
        <div
            className={cn(
                'group relative flex min-h-[300px] w-full flex-col items-center justify-center rounded-3xl border-2 border-dashed p-6 transition-all duration-300',
                isDragging
                    ? 'scale-[1.01] border-primary bg-primary/5'
                    : 'border-muted-foreground/20 hover:border-primary/50 hover:bg-accent/50',
                isUploading && 'pointer-events-none opacity-50',
            )}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
        >
            <input
                type="file"
                id="receipt-upload"
                className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
                onChange={handleFileChange}
                accept="image/*"
            />

            <div className="flex flex-col items-center gap-4 text-center">
                <div className="relative">
                    <div className="absolute -inset-4 rounded-full bg-primary/10 blur-2xl transition-all duration-500 group-hover:bg-primary/20" />
                    <div className="relative flex size-16 items-center justify-center rounded-2xl bg-primary/10 text-primary transition-transform duration-500 group-hover:scale-110">
                        <Upload className="size-8" />
                    </div>
                </div>

                <div className="space-y-2">
                    <h3 className="text-xl font-bold tracking-tight">
                        Upload Receipt
                    </h3>
                    <p className="max-w-[240px] text-sm text-muted-foreground">
                        Drag and drop your receipt here, or click to browse
                        files
                    </p>
                </div>

                <div className="flex flex-wrap items-center justify-center gap-3">
                    <Button
                        variant="outline"
                        size="sm"
                        className="h-10 gap-2 rounded-xl px-4"
                    >
                        <Camera className="size-4" />
                        Take Photo
                    </Button>
                    <span className="text-xs font-medium text-muted-foreground">
                        PNG, JPG, WEBP • Max 10MB
                    </span>
                </div>
            </div>

            {/* Hidden capture input for mobile */}
            <input
                type="file"
                id="receipt-capture"
                className="hidden"
                accept="image/*"
                // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                // @ts-ignore
                capture="environment"
                onChange={handleFileChange}
            />
        </div>
    );
}
