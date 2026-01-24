import { Link, usePage, router } from '@inertiajs/react';
import {
    BarChart3,
    ChevronRight,
    CreditCard,
    KeyRound,
    LayoutGrid,
    Palette,
    PiggyBank,
    Plus,
    Receipt,
    Settings,
    Sliders,
    User,
} from 'lucide-react';
import { useState, useEffect } from 'react';

import { NavUser } from '@/components/nav-user';
import { AddTransactionModal, type TransactionFormData } from '@/components/transactions/add-transaction-modal';
import { Button } from '@/components/ui/button';
import { categoriesApi, transactionsApi, type Category } from '@/lib/api';
import { cn } from '@/lib/utils';
import {
    Collapsible,
    CollapsibleContent,
    CollapsibleTrigger,
} from '@/components/ui/collapsible';
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarGroup,
    SidebarGroupLabel,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    SidebarMenuSub,
    SidebarMenuSubButton,
    SidebarMenuSubItem,
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

const settingsSubItems = [
    {
        title: 'App Settings',
        href: '/settings/app',
        icon: Sliders,
    },
    {
        title: 'Profile',
        href: '/settings/profile',
        icon: User,
    },
    {
        title: 'Security',
        href: '/settings/password',
        icon: KeyRound,
    },
    {
        title: 'Appearance',
        href: '/settings/appearance',
        icon: Palette,
    },
];

export function AppSidebar() {
    const { url } = usePage();
    const isSettingsActive = url.startsWith('/settings');
    
    // Add Transaction modal state
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [categories, setCategories] = useState<Category[]>([]);
    
    // Fetch categories when modal opens
    useEffect(() => {
        if (isModalOpen && categories.length === 0) {
            categoriesApi.list().then((res) => {
                setCategories(res.data.data);
            }).catch(console.error);
        }
    }, [isModalOpen, categories.length]);
    
    // Handle save transaction
    const handleSaveTransaction = async (data: TransactionFormData) => {
        try {
            await transactionsApi.create({
                category_id: data.category_id,
                account_id: data.account_id,
                type: data.type,
                amount: data.amount,
                note: data.note,
                transaction_date: data.date,
            });
            // Refresh the page to show new transaction
            router.reload();
        } catch (error) {
            console.error('Failed to save transaction:', error);
        }
    };

    return (
        <>
        <Sidebar collapsible="icon" variant="inset" className="glass border-r-0">
            <SidebarHeader>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton size="lg" asChild className="hover:bg-transparent">
                            <Link href={dashboard()} prefetch>
                                <AppLogo />
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>

            <SidebarContent>
                <SidebarGroup className="px-2 py-0">
                    <SidebarGroupLabel>Platform</SidebarGroupLabel>
                    <SidebarMenu>
                        {/* Main Navigation Items */}
                        {mainNavItems.map((item) => (
                            <SidebarMenuItem key={item.title}>
                                <SidebarMenuButton
                                    asChild
                                    isActive={url === item.href}
                                    tooltip={{ children: item.title }}
                                    className="h-11 px-4 rounded-xl transition-all hover:bg-primary/5"
                                >
                                    <Link href={item.href} prefetch className="flex items-center gap-3">
                                        {item.icon && <item.icon className={cn("size-5", url === item.href ? "text-primary transition-colors" : "text-muted-foreground")} />}
                                        <span className={cn("text-sm transition-colors", url === item.href ? "font-bold text-primary" : "font-medium text-foreground")}>{item.title}</span>
                                    </Link>
                                </SidebarMenuButton>
                            </SidebarMenuItem>
                        ))}

                        {/* Settings with Submenu */}
                        <Collapsible
                            asChild
                            defaultOpen={isSettingsActive}
                            className="group/collapsible"
                        >
                            <SidebarMenuItem>
                                <CollapsibleTrigger asChild>
                                    <SidebarMenuButton
                                        tooltip="Settings"
                                        isActive={isSettingsActive}
                                        className="h-11 px-4 rounded-xl transition-all hover:bg-primary/5"
                                    >
                                        <div className="flex w-full items-center gap-3">
                                            <Settings className={cn("size-5", isSettingsActive ? "text-primary transition-colors" : "text-muted-foreground")} />
                                            <span className={cn("text-sm transition-colors", isSettingsActive ? "font-bold text-primary" : "font-medium text-foreground")}>Settings</span>
                                            <ChevronRight className="ml-auto size-4 transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
                                        </div>
                                    </SidebarMenuButton>
                                </CollapsibleTrigger>
                                <CollapsibleContent>
                                    <SidebarMenuSub>
                                        {settingsSubItems.map((item) => (
                                            <SidebarMenuSubItem key={item.title}>
                                                <SidebarMenuSubButton
                                                    asChild
                                                    isActive={url === item.href}
                                                    className="h-10 px-3 rounded-lg transition-all hover:bg-primary/5"
                                                >
                                                    <Link href={item.href} className="flex items-center gap-3">
                                                        <item.icon className={cn("size-5 transition-colors", url === item.href ? "text-primary" : "text-muted-foreground")} />
                                                        <span className={cn("text-sm transition-colors", url === item.href ? "font-bold text-primary" : "font-medium text-foreground")}>{item.title}</span>
                                                    </Link>
                                                </SidebarMenuSubButton>
                                            </SidebarMenuSubItem>
                                        ))}
                                    </SidebarMenuSub>
                                </CollapsibleContent>
                            </SidebarMenuItem>
                        </Collapsible>
                    </SidebarMenu>
                </SidebarGroup>
            </SidebarContent>

            <SidebarFooter className="gap-3">
                <NavUser />
                <Button 
                    className="glow-primary btn-hover-scale w-full gap-2 rounded-xl font-black shadow-lg"
                    onClick={() => setIsModalOpen(true)}
                >
                    <Plus className="size-4" />
                    <span>Add Transaction</span>
                </Button>
            </SidebarFooter>
        </Sidebar>
        
        {/* Add Transaction Modal */}
        <AddTransactionModal
            open={isModalOpen}
            onOpenChange={setIsModalOpen}
            categories={categories}
            onSave={handleSaveTransaction}
        />
        </>
    );
}

