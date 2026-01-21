import { ChevronRight, Download, FileText, PlusCircle, Share2 } from 'lucide-react';

interface QuickAction {
    icon: React.ReactNode;
    label: string;
    onClick?: () => void;
}

export function QuickActions() {
    const actions: QuickAction[] = [
        {
            icon: <FileText className="size-5 text-muted-foreground" />,
            label: 'Download PDF Report',
            onClick: () => console.log('Download PDF'),
        },
        {
            icon: <Share2 className="size-5 text-muted-foreground" />,
            label: 'Share with Accountant',
            onClick: () => console.log('Share'),
        },
        {
            icon: <PlusCircle className="size-5 text-muted-foreground" />,
            label: 'Add Missing Entry',
            onClick: () => console.log('Add entry'),
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
