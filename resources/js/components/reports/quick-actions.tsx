import { ChevronRight, FileSpreadsheet, FileText } from 'lucide-react';
import { toast } from 'sonner';

interface QuickAction {
    icon: React.ReactNode;
    label: string;
    onClick?: () => void;
}

export function QuickActions() {
    const handleExportPDF = () => {
        toast.info('Generating PDF report...');
        // Use window.location for file download (Inertia doesn't handle file downloads)
        window.location.href = '/reports/export/pdf';
        toast.success('PDF report is downloading!');
    };

    const handleExportExcel = () => {
        toast.info('Generating Excel report...');
        // Use window.location for file download (Inertia doesn't handle file downloads)
        window.location.href = '/reports/export/excel';
        toast.success('Excel report is downloading!');
    };

    const actions: QuickAction[] = [
        {
            icon: <FileText className="size-5 text-muted-foreground" />,
            label: 'Export PDF',
            onClick: handleExportPDF,
        },
        {
            icon: <FileSpreadsheet className="size-5 text-muted-foreground" />,
            label: 'Export Excel',
            onClick: handleExportExcel,
        },
    ];

    return (
        <div className="flex flex-1 flex-col rounded-xl border border-border bg-card p-6">
            <h3 className="mb-4 font-bold text-foreground">Quick Actions</h3>
            <div className="flex flex-col gap-3">
                {actions.map((action) => (
                    <button
                        key={action.label}
                        onClick={action.onClick}
                        className="group flex items-center justify-between rounded-lg border border-border p-3 text-left transition-colors hover:bg-secondary"
                    >
                        <div className="flex items-center gap-3">
                            {action.icon}
                            <span className="text-sm font-semibold">{action.label}</span>
                        </div>
                        <ChevronRight className="size-4 opacity-0 transition-opacity group-hover:opacity-100" />
                    </button>
                ))}
            </div>
        </div>
    );
}
