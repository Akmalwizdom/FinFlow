import { Link } from '@inertiajs/react';
import {
    BarChart3,
    CreditCard,
    LayoutGrid,
    PiggyBank,
    Plus,
    Receipt,
    Settings,
} from 'lucide-react';

import { NavMain } from '@/components/nav-main';
import { NavUser } from '@/components/nav-user';
import { Button } from '@/components/ui/button';
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from '@/components/ui/sidebar';
import { dashboard } from '@/routes';
import { type NavItem } from '@/types';

import AppLogo from './app-logo';

const mainNavItems: NavItem[] = [
    {
        title: 'Dashboard',
        href: dashboard(),
        icon: LayoutGrid,
    },
    {
        title: 'Transactions',
        href: '/transactions',
        icon: Receipt,
    },
    {
        title: 'Accounts',
        href: '/accounts',
        icon: CreditCard,
    },
    {
        title: 'Budgets',
        href: '/budgets',
        icon: PiggyBank,
    },
    {
        title: 'Reports',
        href: '/reports',
        icon: BarChart3,
    },
];

const settingsNavItems: NavItem[] = [
    {
        title: 'Settings',
        href: '/settings',
        icon: Settings,
    },
];

export function AppSidebar() {
    return (
        <Sidebar collapsible="icon" variant="inset">
            <SidebarHeader>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton size="lg" asChild>
                            <Link href={dashboard()} prefetch>
                                <AppLogo />
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>

            <SidebarContent>
                <NavMain items={mainNavItems} />
            </SidebarContent>

            <SidebarFooter className="gap-3">
                <NavMain items={settingsNavItems} />
                <NavUser />
                <Button className="w-full gap-2 rounded-xl font-bold">
                    <Plus className="size-4" />
                    <span>Add Transaction</span>
                </Button>
            </SidebarFooter>
        </Sidebar>
    );
}
