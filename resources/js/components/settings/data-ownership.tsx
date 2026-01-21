import { Shield, Trash2 } from 'lucide-react';

interface DataOwnershipProps {
    onDeleteAllData?: () => void;
}

export function DataOwnership({ onDeleteAllData }: DataOwnershipProps) {
    return (
        <div className="flex h-full flex-col justify-between rounded-xl border border-border bg-card p-6">
            <div>
                <div className="mb-4 flex items-center gap-2">
                    <div className="flex size-10 items-center justify-center rounded-lg bg-yellow-50 text-yellow-600 dark:bg-yellow-900/20">
                        <Shield className="size-5" />
                    </div>
                    <h3 className="text-lg font-bold">Data Ownership</h3>
                </div>
                <p className="mb-6 text-sm leading-relaxed text-muted-foreground">
                    You are the sole owner of your financial data. We do not sell your
                    info or share it with advertisers. All sync is end-to-end encrypted.
                </p>
            </div>
            <div className="flex flex-col gap-3">
                <button
                    onClick={onDeleteAllData}
                    className="flex w-fit items-center gap-1 rounded-lg px-3 py-2 text-sm font-bold text-red-600 transition-colors hover:bg-red-50 dark:hover:bg-red-900/20"
                >
                    <Trash2 className="size-4" />
                    Permanently Delete All Data
                </button>
            </div>
        </div>
    );
}
