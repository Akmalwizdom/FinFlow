import { Calendar, ChevronDown, Filter, Search, Tag, Check } from 'lucide-react';
import { useState } from 'react';

import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from '@/components/ui/popover';
import { type Category } from '@/lib/api';

interface TransactionFiltersProps {
    searchQuery: string;
    onSearchChange: (query: string) => void;
    dateFilter: string;
    onDateFilterChange: (filter: string) => void;
    typeFilter?: 'income' | 'expense';
    onTypeFilterChange?: (type: 'income' | 'expense' | undefined) => void;
    categories?: Category[];
    categoryFilter?: number;
    onCategoryFilterChange?: (categoryId: number | undefined) => void;
}

const dateOptions = [
    { value: 'this-month', label: 'This Month' },
    { value: 'last-month', label: 'Last Month' },
    { value: 'this-year', label: 'This Year' },
    { value: 'all', label: 'All Time' },
];

const typeOptions = [
    { value: undefined, label: 'All Types' },
    { value: 'income' as const, label: 'Income' },
    { value: 'expense' as const, label: 'Expense' },
];

export function TransactionFilters({
    searchQuery,
    onSearchChange,
    dateFilter,
    onDateFilterChange,
    typeFilter,
    onTypeFilterChange,
    categories = [],
    categoryFilter,
    onCategoryFilterChange,
}: TransactionFiltersProps) {
    const [dateOpen, setDateOpen] = useState(false);
    const [categoryOpen, setCategoryOpen] = useState(false);
    const [typeOpen, setTypeOpen] = useState(false);

    const selectedDateLabel = dateOptions.find((d) => d.value === dateFilter)?.label || 'This Month';
    const selectedTypeLabel = typeOptions.find((t) => t.value === typeFilter)?.label || 'All Types';
    const selectedCategoryLabel = categories.find((c) => c.id === categoryFilter)?.name || 'All Categories';

    return (
        <div className="flex flex-wrap items-center gap-3">
            {/* Search Input */}
            <div className="min-w-[240px] flex-1">
                <div className="group relative">
                    <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground transition-colors group-focus-within:text-primary" />
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => onSearchChange(e.target.value)}
                        placeholder="Search transactions, notes..."
                        className="w-full rounded-xl border-none bg-secondary py-2 pl-10 pr-4 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
                    />
                </div>
            </div>

            {/* Filter Buttons */}
            <div className="flex items-center gap-2 overflow-x-auto pb-1">
                {/* Date Filter */}
                <Popover open={dateOpen} onOpenChange={setDateOpen}>
                    <PopoverTrigger asChild>
                        <button className="flex items-center gap-1.5 rounded-lg border border-border bg-card px-3 py-1.5 text-xs font-bold transition-colors hover:border-primary">
                            <Calendar className="size-4" />
                            <span>{selectedDateLabel}</span>
                            <ChevronDown className="size-4" />
                        </button>
                    </PopoverTrigger>
                    <PopoverContent className="w-40 p-1" align="start">
                        {dateOptions.map((option) => (
                            <button
                                key={option.value}
                                onClick={() => {
                                    onDateFilterChange(option.value);
                                    setDateOpen(false);
                                }}
                                className={`flex w-full items-center justify-between rounded-md px-3 py-2 text-sm transition-colors hover:bg-secondary ${
                                    dateFilter === option.value ? 'bg-secondary font-medium' : ''
                                }`}
                            >
                                {option.label}
                                {dateFilter === option.value && <Check className="size-4 text-primary" />}
                            </button>
                        ))}
                    </PopoverContent>
                </Popover>

                {/* Categories Filter */}
                <Popover open={categoryOpen} onOpenChange={setCategoryOpen}>
                    <PopoverTrigger asChild>
                        <button className="flex items-center gap-1.5 rounded-lg border border-border bg-card px-3 py-1.5 text-xs font-bold transition-colors hover:border-primary">
                            <Tag className="size-4" />
                            <span>{categoryFilter ? selectedCategoryLabel : 'Categories'}</span>
                            <ChevronDown className="size-4" />
                        </button>
                    </PopoverTrigger>
                    <PopoverContent className="max-h-60 w-48 overflow-y-auto p-1" align="start">
                        <button
                            onClick={() => {
                                onCategoryFilterChange?.(undefined);
                                setCategoryOpen(false);
                            }}
                            className={`flex w-full items-center justify-between rounded-md px-3 py-2 text-sm transition-colors hover:bg-secondary ${
                                !categoryFilter ? 'bg-secondary font-medium' : ''
                            }`}
                        >
                            All Categories
                            {!categoryFilter && <Check className="size-4 text-primary" />}
                        </button>
                        {categories.map((cat) => (
                            <button
                                key={cat.id}
                                onClick={() => {
                                    onCategoryFilterChange?.(cat.id);
                                    setCategoryOpen(false);
                                }}
                                className={`flex w-full items-center justify-between rounded-md px-3 py-2 text-sm transition-colors hover:bg-secondary ${
                                    categoryFilter === cat.id ? 'bg-secondary font-medium' : ''
                                }`}
                            >
                                <span className="flex items-center gap-2">
                                    <span
                                        className="size-2 rounded-full"
                                        style={{ backgroundColor: cat.color || '#d1d5db' }}
                                    />
                                    {cat.name}
                                </span>
                                {categoryFilter === cat.id && <Check className="size-4 text-primary" />}
                            </button>
                        ))}
                    </PopoverContent>
                </Popover>

                {/* Type Filter */}
                <Popover open={typeOpen} onOpenChange={setTypeOpen}>
                    <PopoverTrigger asChild>
                        <button className="flex items-center gap-1.5 rounded-lg border border-border bg-card px-3 py-1.5 text-xs font-bold transition-colors hover:border-primary">
                            <Filter className="size-4" />
                            <span>{selectedTypeLabel}</span>
                            <ChevronDown className="size-4" />
                        </button>
                    </PopoverTrigger>
                    <PopoverContent className="w-36 p-1" align="start">
                        {typeOptions.map((option) => (
                            <button
                                key={option.label}
                                onClick={() => {
                                    onTypeFilterChange?.(option.value);
                                    setTypeOpen(false);
                                }}
                                className={`flex w-full items-center justify-between rounded-md px-3 py-2 text-sm transition-colors hover:bg-secondary ${
                                    typeFilter === option.value ? 'bg-secondary font-medium' : ''
                                }`}
                            >
                                {option.label}
                                {typeFilter === option.value && <Check className="size-4 text-primary" />}
                            </button>
                        ))}
                    </PopoverContent>
                </Popover>
            </div>
        </div>
    );
}
