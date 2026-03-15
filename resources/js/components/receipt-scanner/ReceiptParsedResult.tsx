import {
    Calendar,
    ChevronDown,
    ChevronUp,
    Info,
    Store,
    Tag,
} from 'lucide-react';
import { useState } from 'react';

import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import {
    Collapsible,
    CollapsibleContent,
    CollapsibleTrigger,
} from '@/components/ui/collapsible';
import { cn } from '@/lib/utils';

interface ParsedData {
    merchant: string | null;
    total: number;
    date: string | null;
    items: Array<{ name: string; price: number }>;
    confidence: number;
}

interface ReceiptParsedResultProps {
    data: ParsedData;
    rawText?: string | null;
    hideItemsList?: boolean;
    hideRawText?: boolean;
}

export function ReceiptParsedResult({
    data,
    rawText,
    hideItemsList = false,
    hideRawText = false,
}: ReceiptParsedResultProps) {
    const [isRawOpen, setIsRawOpen] = useState(false);

    const confidenceLevel =
        data.confidence > 0.8
            ? 'High'
            : data.confidence > 0.5
              ? 'Medium'
              : 'Low';
    const confidenceColor =
        data.confidence > 0.8
            ? 'text-emerald-500 bg-emerald-500/10'
            : data.confidence > 0.5
              ? 'text-amber-500 bg-amber-500/10'
              : 'text-red-500 bg-red-500/10';

    return (
        <div className="animate-in space-y-8 duration-500 slide-in-from-bottom-4">
            <div className="flex items-center justify-between">
                <h3 className="text-2xl font-black tracking-tight">Gemini Analysis</h3>
                <Badge
                    variant="outline"
                    className={cn(
                        'rounded-full border-0 px-3 py-1 font-bold',
                        confidenceColor,
                    )}
                >
                    {confidenceLevel} Confidence
                </Badge>
            </div>

            <div className="flex flex-col gap-3">
                {/* Merchant Strip */}
                <Card className="overflow-hidden rounded-xl border border-border/50 bg-card shadow-sm transition-all duration-200 hover:shadow-md">
                    <CardContent className="flex items-center gap-4 p-4">
                        <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                            <Store className="size-5" />
                        </div>
                        <div className="min-w-0 flex-1">
                            <p className="text-[10px] font-semibold tracking-wider text-muted-foreground uppercase">
                                Merchant
                            </p>
                            <p className="text-base font-bold text-foreground break-words">
                                {data.merchant || 'Unknown'}
                            </p>
                        </div>
                    </CardContent>
                </Card>

                {/* Total Amount Strip */}
                <Card className="overflow-hidden rounded-xl border border-border/50 bg-card shadow-sm transition-all duration-200 hover:shadow-md">
                    <CardContent className="flex items-center gap-4 p-4">
                        <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                            <Tag className="size-5" />
                        </div>
                        <div className="min-w-0 flex-1">
                            <p className="text-[10px] font-semibold tracking-wider text-muted-foreground uppercase">
                                Total Amount
                            </p>
                            <p className="text-lg font-bold text-foreground">
                                Rp {data.total.toLocaleString('id-ID')}
                            </p>
                        </div>
                    </CardContent>
                </Card>

                {/* Date Strip */}
                <Card className="overflow-hidden rounded-xl border border-border/50 bg-card shadow-sm transition-all duration-200 hover:shadow-md">
                    <CardContent className="flex items-center gap-4 p-4">
                        <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                            <Calendar className="size-5" />
                        </div>
                        <div className="min-w-0 flex-1">
                            <p className="text-[10px] font-semibold tracking-wider text-muted-foreground uppercase">
                                Transaction Date
                            </p>
                            <p className="text-base font-bold text-foreground">
                                {data.date || 'Not found'}
                            </p>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Items List (Simplified) */}
            {data.items.length > 0 && !hideItemsList && (
                <div className="space-y-4">
                    <div className="flex items-center gap-2 text-sm font-bold tracking-tight text-muted-foreground">
                        <Tag className="size-4" />
                        <span className="uppercase tracking-widest text-xs">Detected Items</span>
                    </div>
                    <div className="grid grid-cols-1 gap-3">
                        {data.items.slice(0, 5).map((item, i) => (
                            <div
                                key={i}
                                className="flex items-center justify-between rounded-2xl border border-white/20 bg-white/40 p-4 shadow-xs backdrop-blur-xl transition-colors hover:bg-white/50 dark:border-white/10 dark:bg-slate-900/40 dark:hover:bg-slate-900/50"
                            >
                                <span className="text-sm font-semibold text-foreground">
                                    {item.name}
                                </span>
                                <span className="text-sm font-black text-foreground">
                                    Rp {item.price.toLocaleString('id-ID')}
                                </span>
                            </div>
                        ))}
                        {data.items.length > 5 && (
                            <div className="flex items-center justify-center gap-2 py-2">
                                <div className="h-px flex-1 bg-border/50" />
                                <span className="text-xs font-bold text-muted-foreground uppercase tracking-widest">
                                    + {data.items.length - 5} more items
                                </span>
                                <div className="h-px flex-1 bg-border/50" />
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* Raw Text Collapsible */}
            {rawText && !hideRawText && (
                <Collapsible
                    open={isRawOpen}
                    onOpenChange={setIsRawOpen}
                    className="w-full"
                >
                    <CollapsibleTrigger className="flex w-full items-center justify-between rounded-2xl bg-muted/50 p-4 text-sm font-bold transition-colors hover:bg-muted">
                        <div className="flex items-center gap-2">
                            <Info className="size-4" />
                            <span>View Raw Extraction Text</span>
                        </div>
                        {isRawOpen ? (
                            <ChevronUp className="size-4" />
                        ) : (
                            <ChevronDown className="size-4" />
                        )}
                    </CollapsibleTrigger>
                    <CollapsibleContent className="mt-2 max-h-50 overflow-y-auto rounded-2xl border bg-muted/30 p-4 font-mono text-xs leading-relaxed whitespace-pre-wrap">
                        {rawText}
                    </CollapsibleContent>
                </Collapsible>
            )}
        </div>
    );
}
