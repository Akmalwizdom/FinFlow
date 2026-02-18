import {
    Calendar,
    ChevronDown,
    ChevronUp,
    DollarSign,
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
}

export function ReceiptParsedResult({
    data,
    rawText,
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
        <div className="animate-in space-y-6 duration-500 slide-in-from-bottom-4">
            <div className="flex items-center justify-between">
                <h3 className="text-lg font-bold">Extraction Result</h3>
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

            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                {/* Merchant */}
                <Card className="overflow-hidden rounded-2xl border-0 bg-accent/30 shadow-sm">
                    <CardContent className="flex items-center gap-4 p-4">
                        <div className="flex size-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                            <Store className="size-5" />
                        </div>
                        <div className="min-w-0">
                            <p className="text-xs font-medium tracking-wider text-muted-foreground uppercase">
                                Merchant
                            </p>
                            <p className="truncate font-bold">
                                {data.merchant || 'Unknown'}
                            </p>
                        </div>
                    </CardContent>
                </Card>

                {/* Amount */}
                <Card className="overflow-hidden rounded-2xl border-0 bg-accent/30 shadow-sm">
                    <CardContent className="flex items-center gap-4 p-4">
                        <div className="flex size-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                            <DollarSign className="size-5" />
                        </div>
                        <div className="min-w-0">
                            <p className="text-xs font-medium tracking-wider text-muted-foreground uppercase">
                                Total Amount
                            </p>
                            <p className="text-lg font-bold">
                                ${data.total.toFixed(2)}
                            </p>
                        </div>
                    </CardContent>
                </Card>

                {/* Date */}
                <Card className="overflow-hidden rounded-2xl border-0 bg-accent/30 shadow-sm">
                    <CardContent className="flex items-center gap-4 p-4">
                        <div className="flex size-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                            <Calendar className="size-5" />
                        </div>
                        <div className="min-w-0">
                            <p className="text-xs font-medium tracking-wider text-muted-foreground uppercase">
                                Date
                            </p>
                            <p className="font-bold">
                                {data.date || 'Not found'}
                            </p>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Items List (Simplified) */}
            {data.items.length > 0 && (
                <div className="space-y-3">
                    <div className="flex items-center gap-2 text-sm font-bold text-muted-foreground">
                        <Tag className="size-4" />
                        <span>Detected Items</span>
                    </div>
                    <div className="grid grid-cols-1 gap-2">
                        {data.items.slice(0, 5).map((item, i) => (
                            <div
                                key={i}
                                className="flex items-center justify-between rounded-xl border border-border/50 bg-accent/10 p-3"
                            >
                                <span className="text-sm font-medium">
                                    {item.name}
                                </span>
                                <span className="text-sm font-bold">
                                    ${item.price.toFixed(2)}
                                </span>
                            </div>
                        ))}
                        {data.items.length > 5 && (
                            <p className="py-1 text-center text-xs text-muted-foreground">
                                + {data.items.length - 5} more items
                            </p>
                        )}
                    </div>
                </div>
            )}

            {/* Raw Text Collapsible */}
            {rawText && (
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
