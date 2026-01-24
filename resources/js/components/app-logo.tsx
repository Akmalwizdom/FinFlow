import { Wallet } from 'lucide-react';

export default function AppLogo() {
    return (
        <>
            <div className="flex aspect-square size-10 items-center justify-center rounded-xl bg-primary text-white">
                <Wallet className="size-5" />
            </div>
            <div className="ml-2 grid flex-1 text-left group-data-[state=collapsed]:hidden">
                <span className="truncate leading-tight font-bold text-foreground">
                    FinFlow
                </span>
                <span className="truncate text-xs font-medium text-muted-foreground">
                    Personal Account
                </span>
            </div>
        </>
    );
}
