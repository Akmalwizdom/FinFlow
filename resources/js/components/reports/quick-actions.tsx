import { ChevronRight, Download, FileSpreadsheet, FileText } from 'lucide-react';
import { router } from '@inertiajs/react';
import { toast } from 'sonner';

interface QuickAction {
    icon: React.ReactNode;
    label: string;
    onClick?: () => void;
}

export function QuickActions() {
    const handleExportPDF = () => {
        toast.info('Generating PDF report...');
        router.get('/reports/export/pdf', undefined, {
            preserveState: true,
            onSuccess: () => {
                toast.success('PDF report downloaded!');
            },
            onError: () => {
                toast.error('Failed to generate PDF report.');
            },
        });
    };

    const handleExportExcel = () => {
        toast.info('Generating Excel report...');
        router.get('/reports/export/excel', undefined, {
            preserveState: true,
            onSuccess: () => {
                toast.success('Excel report downloaded!');
            },
            onError: () => {
                toast.error('Failed to generate Excel report.');
            },
        });
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
