import { Toaster as Sonner } from 'sonner';

type ToasterProps = React.ComponentProps<typeof Sonner>;

const Toaster = ({ ...props }: ToasterProps) => {
    return (
        <Sonner
            theme="system"
            className="toaster group"
            toastOptions={{
                classNames: {
                    toast: 'group toast group-[.toaster]:bg-background group-[.toaster]:text-foreground group-[.toaster]:border-border group-[.toaster]:shadow-lg',
                    description: 'group-[.toast]:text-muted-foreground',
                    actionButton:
                        'group-[.toast]:bg-primary group-[.toast]:text-primary-foreground',
                    cancelButton:
                        'group-[.toast]:bg-muted group-[.toast]:text-muted-foreground',
                    success: 'group-[.toaster]:bg-income group-[.toaster]:text-white group-[.toaster]:border-income',
                    error: 'group-[.toaster]:bg-expense group-[.toaster]:text-white group-[.toaster]:border-expense',
                    warning: 'group-[.toaster]:bg-amber-500 group-[.toaster]:text-white group-[.toaster]:border-amber-500',
                },
            }}
            {...props}
        />
    );
};

export { Toaster };
