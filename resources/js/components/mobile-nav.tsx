import { Link, usePage } from '@inertiajs/react';
import {
    Activity,
    CreditCard,
    Home,
    Plus,
    Settings,
} from 'lucide-react';

interface MobileNavProps {
    onAddTransaction?: () => void;
}

const navItems = [
    { name: 'Home', icon: Home, href: '/' },
    { name: 'Activity', icon: Activity, href: '/transactions' },
    { name: 'Cards', icon: CreditCard, href: '/accounts' },
    { name: 'Profile', icon: Settings, href: '/settings' },
];

export function MobileNav({ onAddTransaction }: MobileNavProps) {
    const { url } = usePage();

    return (
        <>
            {/* Floating Action Button */}
            <div className="fixed bottom-24 right-4 z-30 md:hidden">
                <button
                    onClick={onAddTransaction}
                    className="flex size-14 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg transition-transform active:scale-90"
                >
                    <Plus className="size-7" />
                </button>
            </div>

            {/* Bottom Navigation Bar */}
            <nav className="fixed inset-x-0 bottom-0 z-20 flex h-20 items-center justify-between border-t border-border bg-card/80 px-6 pb-4 backdrop-blur-lg md:hidden">
                {navItems.map((item) => {
                    const isActive = url === item.href || (item.href === '/' && url.startsWith('/dashboard'));
                    const Icon = item.icon;

                    return (
                        <Link
                            key={item.name}
                            href={item.href}
                            className={`flex flex-col items-center gap-1 ${
                                isActive
                                    ? 'text-primary'
                                    : 'text-muted-foreground'
                            }`}
                        >
                            <Icon
                                className={`size-6 ${isActive ? 'fill-current' : ''}`}
                            />
                            <span className="text-[10px] font-bold">
                                {item.name}
                            </span>
                        </Link>
                    );
                })}
            </nav>
        </>
    );
}
