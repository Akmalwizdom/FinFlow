import {
    Car,
    Home,
    PlusCircle,
    ShoppingCart,
    Utensils,
    X,
    Zap,
} from 'lucide-react';

interface Category {
    name: string;
    icon: string;
}

interface SpendingCategoriesProps {
    categories: Category[];
    onAddCategory?: () => void;
    onRemoveCategory?: (name: string) => void;
}

const iconMap: Record<string, React.ReactNode> = {
    'shopping-cart': <ShoppingCart className="size-4 text-primary" />,
    car: <Car className="size-4 text-primary" />,
    home: <Home className="size-4 text-primary" />,
    utensils: <Utensils className="size-4 text-primary" />,
    zap: <Zap className="size-4 text-primary" />,
};

export function SpendingCategories({
    categories,
    onAddCategory,
    onRemoveCategory,
}: SpendingCategoriesProps) {
    const visibleCategories = categories.slice(0, 5);
    const remainingCount = categories.length - 5;

    return (
        <section className="overflow-hidden rounded-xl border border-border bg-card">
            <div className="flex items-center justify-between border-b border-border px-6 py-4">
                <h3 className="text-lg font-bold">Spending Categories</h3>
                <button
                    onClick={onAddCategory}
                    className="flex items-center gap-1 text-sm font-bold text-primary hover:underline"
                >
                    <PlusCircle className="size-4" />
                    Add New
                </button>
            </div>
            <div className="p-6">
                <div className="flex flex-wrap gap-2">
                    {visibleCategories.map((category) => (
                        <div
                            key={category.name}
                            className="group flex items-center gap-2 rounded-lg border border-border bg-secondary px-3 py-2"
                        >
                            {iconMap[category.icon] || (
                                <ShoppingCart className="size-4 text-primary" />
                            )}
                            <span className="text-sm font-medium">{category.name}</span>
                            <button
                                onClick={() => onRemoveCategory?.(category.name)}
                                className="opacity-0 transition-opacity group-hover:opacity-100"
                            >
                                <X className="size-3 text-muted-foreground" />
                            </button>
                        </div>
                    ))}
                    {remainingCount > 0 && (
                        <div className="flex items-center gap-2 rounded-lg border border-primary/20 bg-primary/10 px-3 py-2">
                            <span className="text-xs font-bold italic text-primary">
                                + {remainingCount} more
                            </span>
                        </div>
                    )}
                </div>
                <p className="mt-4 text-xs text-muted-foreground">
                    Drag to reorder. Icons can be customized in the category detail view.
                </p>
            </div>
        </section>
    );
}
