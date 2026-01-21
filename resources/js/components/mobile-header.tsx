import { usePage } from '@inertiajs/react';
import { User } from 'lucide-react';

interface PageProps {
    auth?: {
        user?: {
            name?: string;
        };
    };
}

export function MobileHeader() {
    const props = usePage().props as PageProps;
    const firstName = props.auth?.user?.name?.split(' ')[0] || 'User';

    return (
        <header className="flex items-center justify-between px-6 pb-2 pt-6 md:hidden">
            <div>
                <p className="text-sm font-medium text-muted-foreground">
                    Welcome back,
                </p>
                <h2 className="text-xl font-bold leading-tight text-foreground">
                    {firstName}
                </h2>
            </div>
            <button className="flex size-10 items-center justify-center rounded-full border border-border bg-card shadow-sm">
                <User className="size-5 text-primary" />
            </button>
        </header>
    );
}
