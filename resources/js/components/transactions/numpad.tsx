import { Delete } from 'lucide-react';

interface NumpadProps {
    onInput: (value: string) => void;
    onDelete: () => void;
}

const keys = [
    ['1', '2', '3'],
    ['4', '5', '6'],
    ['7', '8', '9'],
    ['.', '0', 'del'],
];

export function Numpad({ onInput, onDelete }: NumpadProps) {
    const handleKeyPress = (key: string) => {
        if (key === 'del') {
            onDelete();
        } else {
            onInput(key);
        }
    };

    return (
        <div className="grid grid-cols-3 gap-3">
            {keys.flat().map((key) => (
                <button
                    key={key}
                    type="button"
                    onClick={() => handleKeyPress(key)}
                    className="flex h-14 items-center justify-center rounded-xl bg-secondary text-xl font-bold text-foreground transition-all active:scale-95 active:bg-muted"
                >
                    {key === 'del' ? (
                        <Delete className="size-5" />
                    ) : (
                        key
                    )}
                </button>
            ))}
        </div>
    );
}
