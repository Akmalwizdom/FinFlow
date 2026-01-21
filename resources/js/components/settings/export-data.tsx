import { Download, FileSpreadsheet } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ExportDataProps {
    onExport?: () => void;
}

export function ExportData({ onExport }: ExportDataProps) {
    return (
        <div className="flex h-full flex-col justify-between rounded-xl border border-border bg-card p-6">
            <div>
                <div className="mb-4 flex items-center gap-2">
                    <div className="flex size-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                        <Download className="size-5" />
                    </div>
                    <h3 className="text-lg font-bold">Export Data</h3>
                </div>
                <p className="mb-6 text-sm leading-relaxed text-muted-foreground">
                    Take your records with you. Download a complete archive of your
                    transactions, budgets, and categories in CSV format compatible with
                    Excel and Google Sheets.
                </p>
            </div>
            <Button
                onClick={onExport}
                className="w-full gap-2 font-bold"
            >
                <FileSpreadsheet className="size-5" />
                Download CSV Archive
            </Button>
        </div>
    );
}
